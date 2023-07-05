import { NextFunction, Request, Response } from 'express'
import * as crypto from 'crypto'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'

import { organizationModel } from '../../model/organization'
import * as motopressService from '../../service/motopress'
import axios, { AxiosError } from 'axios'
import { CustomerEntity, customerModel } from '../../model/customer'
import * as channelService from '../../service/channel'
import { lineService } from '../../service/channel'
import { gcsService } from '../../service/google'
import {
  ChatEntity,
  chatModel,
  MessageEntity,
  messageModel,
  MESSAGE_DIRECTION,
} from '../../model/chat'

export const check = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.sendStatus(200)
}

export const receiveMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { organizationCode } = req.params
  if (!organizationCode) {
    errorMessage(
      'CONTROLLER',
      'webhook.woocommerce',
      'invalid parameter(organizationCode)',
    )
    return next(new HttpException(400, ErrorCode[400]))
  }
  const organizationId = Buffer.from(organizationCode, 'base64').toString(
    'binary',
  )
  const organization = await organizationModel.getOrganizationWithId(
    organizationId,
  )

  if (!organization) {
    errorMessage('CONTROLLER', 'webhook.woocommerce', 'organization not found')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const body = req.body

  let lineUID: string | null = null
  let payment = null
  let booking = null

  // Find Line uid
  if (body.meta_data && body.meta_data.length) {
    const uidArr = req.body.meta_data.find(
      (o: { key: string }) => o.key === 'lineUid',
    )
    if (uidArr) {
      lineUID = uidArr.value
    } else {
      return res.sendStatus(200)
    }
    // body.meta_data.forEach((element: { key: any; value: any }) => {
    //   if (element.key === 'lineUid') {
    //     lineUID = element.value
    //   }
    // })
  }
  if (body.line_items && body.line_items.length) {
    const paymentId = body.line_items[0].meta_data[0].value
    if (paymentId) {
      payment = await motopressService.payments.getPayment(
        organization.motopressUrl,
        organization.motopressConsumerKey,
        organization.motopressConsumerSecret,
        paymentId,
      )

      if (payment) {
        const bookingId = payment.booking_id
        if (bookingId) {
          booking = await motopressService.bookings.getBooking(
            organization.motopressUrl,
            organization.motopressConsumerKey,
            organization.motopressConsumerSecret,
            bookingId,
          )
        }
      }
    } else {
      return res.sendStatus(200)
    }
  }

  if (lineUID && payment && booking) {
    // Send message to customer and owner
    /**
     * Check Customer
     */
    let customer: CustomerEntity
    try {
      const foxCustomer = await customerModel.getCustomerWithUidAndChannel(
        lineUID,
        organization.channel,
        organization,
      )
      if (!foxCustomer) {
        // No customer on FoxConnect -> Get Profile and create new customer
        const newProfile: channelService.ISocialProfile =
          await channelService.getCustomerProfile(lineUID, organization.channel)
        if (!newProfile) {
          errorMessage(
            'CONTROLLER',
            'webhook.woocommerce',
            'get customer profile',
          )
          throw new HttpException(400, ErrorCode[400])
        }

        // Upload Profile picture to FoxConnect
        const filename = await gcsService.uploadChatCustomerDisplay(
          organization.channel.id,
          organization.id,
          newProfile.uid,
          newProfile.uid,
          newProfile.picture,
        )
        customer = await customerModel.saveCustomer({
          ...new CustomerEntity(),
          channel: organization.channel,
          uid: newProfile.uid,
          picture: filename,
          display: newProfile.display,
          organization,
        })
      } else {
        customer = foxCustomer
      }
    } catch (error) {
      errorMessage(
        'CONTROLLER',
        'webhook.woocommerce',
        'receiveMessage(customer)',
        error,
      )
      // return next(new HttpException(400, ErrorCode[400]))
      return
    }

    /**
     * Check Chat
     */
    let chat: ChatEntity
    let isNewChat = false
    try {
      const foxChat = await chatModel.getActiveChatWithCustomerId(
        customer.id,
        organization,
      )
      // Create New Chat
      if (!foxChat) {
        chat = await chatModel.saveChat({
          ...new ChatEntity(),
          customer,
          channel: organization.channel,
          organization,
        })
        isNewChat = true
      } else {
        chat = foxChat
      }
    } catch (error) {
      errorMessage(
        'CONTROLLER',
        'webhook.woocommerce',
        'receiveMessage(chat)',
        error,
      )
      return
      // throw new HttpException(400, ErrorCode[400])
    }

    if (req.body.status === 'processing') {
      const data = renderMsg2(req.body, lineUID, payment.id, booking.id)

      // Update point
      // need implement

      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + organization.channel.line.accessToken,
      }
      try {
        const sendMsg = await axios.post(
          'https://api.line.me/v2/bot/message/push',
          data,
          { headers },
        )
      } catch (error: AxiosError | any) {
        console.error('[woocommerce] push line message: ', error.response?.data)
      }

      // New Message
      let message
      try {
        const newMessage = {
          ...new MessageEntity(),
          data: JSON.stringify({
            text: 'receipt',
          }),
          channel: organization.channel,
          type: 'text',
          timestamp: new Date(),
          direction: MESSAGE_DIRECTION.OUTBOUND,
          chat,
          organization: chat.organization,
        } as MessageEntity
        message = await messageModel.saveMessage(newMessage)
      } catch (error) {
        errorMessage(
          'CONTROLLER',
          'webhook.woocommerce',
          'receiveMessage(message)',
          error,
        )
        return
        // throw new HttpException(400, ErrorCode[400])
      }
    } else if (
      req.body.status === 'completed' ||
      req.body.status === 'refunded' ||
      req.body.status === 'canceled'
    ) {
      const data = renderMsg3(booking, lineUID)
      const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + organization.channel.line.accessToken,
      }
      try {
        const sendMsg = await axios.post(
          'https://api.line.me/v2/bot/message/push',
          data,
          { headers },
        )
      } catch (error: AxiosError | any) {
        console.error('[woocommerce] push line message: ', error.response?.data)
      }

      if (req.body.status === 'completed') {
        try {
          const accommodation =
            await motopressService.accommodations.getAccommodation(
              organization.motopressUrl,
              organization.motopressConsumerKey,
              organization.motopressConsumerSecret,
              booking.reserved_accommodations[0].accommodation,
            )

          const formData = new URLSearchParams()
          formData.append('message', notify1(accommodation, booking, req.body))
          const headersNotify = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Bearer ' + organization.lineNotify,
          }
          const sendNotify = await axios.post(
            'https://notify-api.line.me/api/notify',
            formData,
            { headers: headersNotify },
          )
        } catch (error: AxiosError | any) {
          console.error('[woocommerce] push line notify: ', error.response.data)
        }
      }

      // New Message
      let message
      try {
        const newMessage = {
          ...new MessageEntity(),
          data: JSON.stringify({
            text: `Booking status: ${noVal(booking.status)}`,
          }),
          channel: organization.channel,
          type: 'text',
          timestamp: new Date(),
          direction: MESSAGE_DIRECTION.OUTBOUND,
          chat,
          organization: chat.organization,
        } as MessageEntity
        message = await messageModel.saveMessage(newMessage)
      } catch (error) {
        errorMessage(
          'CONTROLLER',
          'webhook.woocommerce',
          'receiveMessage(message)',
          error,
        )
        return
        // throw new HttpException(400, ErrorCode[400])
      }
    }
    return res.status(200).json({
      success: true,
    })
  } else {
    return res.sendStatus(200)
  }
}

const noVal = (params: any) => {
  const val = params ? params : 'ไม่ทราบค่า'
  return String(val)
}
const buble2 = (product: any) => {
  const bubleData = {
    type: 'box',
    layout: 'horizontal',
    contents: [
      {
        type: 'text',
        text: noVal(product.name),
        size: 'sm',
        color: '#555555',
        flex: 4,
        gravity: 'center',
        wrap: true,
      },
      {
        type: 'text',
        text: noVal(product.total) + ' ฿',
        size: 'sm',
        color: '#111111',
        align: 'end',
        gravity: 'center',
        flex: 2,
      },
    ],
  }
  return bubleData
}
const renderMsg2 = (
  products: any,
  uid: string,
  paymentId: string,
  bookingId: string,
) => {
  const productArray: any[] = []
  products.line_items.map((itemData: any, key: any) => {
    try {
      productArray.push(buble2(itemData))
    } catch (error) {
      console.log(error)
    }
  })

  const data = {
    to: uid,
    messages: [
      {
        type: 'flex',
        altText: 'ใบเสร็จรับเงิน',
        contents: {
          type: 'bubble',
          size: 'giga',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: 'ใบเสร็จรับเงิน',
                weight: 'bold',
                color: '#1DB446',
                size: 'sm',
              },
              {
                type: 'text',
                text: 'poolvilla.io',
                weight: 'bold',
                size: 'xxl',
                margin: 'md',
                color: '#000000',
              },
              {
                type: 'text',
                text: '263, 265, 267 ถ.กรุงธนบุรี แขวงคลองต้นไทร เขตคลองสาน กรุงเทพมหานคร 10600',
                size: 'xs',
                color: '#aaaaaa',
                wrap: true,
              },
              {
                type: 'separator',
                margin: 'xxl',
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: 'รายการจอง',
                    size: 'sm',
                    color: '#999999',
                    flex: 4,
                  },
                  {
                    type: 'text',
                    text: 'ราคา',
                    size: 'sm',
                    color: '#999999',
                    align: 'end',
                    flex: 2,
                  },
                ],
                paddingAll: 'sm',
              },
              {
                type: 'separator',
              },
              {
                type: 'box',
                layout: 'vertical',
                margin: 'xxl',
                spacing: 'sm',
                contents: [
                  ...productArray,
                  {
                    type: 'separator',
                    margin: 'xxl',
                  },
                  // {
                  //   type: 'box',
                  //   layout: 'horizontal',
                  //   contents: [
                  //     {
                  //       type: 'text',
                  //       text: 'ค่าจัดส่ง',
                  //       size: 'sm',
                  //       color: '#555555',
                  //     },
                  //     {
                  //       type: 'text',
                  //       text: noVal(products.shipping_total) + ' ฿',
                  //       size: 'sm',
                  //       color: '#111111',
                  //       align: 'end',
                  //     },
                  //   ],
                  // },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: 'ภาษี',
                        size: 'sm',
                        color: '#555555',
                      },
                      {
                        type: 'text',
                        text: noVal(products.total_tax) + ' ฿',
                        size: 'sm',
                        color: '#111111',
                        align: 'end',
                      },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: 'ส่วนลด',
                        size: 'sm',
                        color: '#555555',
                      },
                      {
                        type: 'text',
                        text: noVal(products.discount_total) + ' ฿',
                        size: 'sm',
                        color: '#111111',
                        align: 'end',
                      },
                    ],
                  },
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'text',
                        text: 'รวมเป็นเงิน',
                        size: 'sm',
                        color: '#111111',
                        weight: 'bold',
                      },
                      {
                        type: 'text',
                        text: noVal(products.total) + ' ฿',
                        size: 'sm',
                        color: '#111111',
                        align: 'end',
                        weight: 'bold',
                      },
                    ],
                    paddingTop: 'md',
                  },
                ],
              },
              {
                type: 'separator',
                margin: 'xxl',
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: 'md',
                contents: [
                  {
                    type: 'text',
                    text: 'รหัสการจ่ายเงิน',
                    size: 'xs',
                    color: '#aaaaaa',
                    flex: 0,
                  },
                  {
                    type: 'text',
                    text: noVal(paymentId),
                    color: '#aaaaaa',
                    size: 'xs',
                    align: 'end',
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                margin: 'md',
                contents: [
                  {
                    type: 'text',
                    text: 'รหัสการจอง',
                    size: 'xs',
                    color: '#aaaaaa',
                    flex: 0,
                  },
                  {
                    type: 'text',
                    text: noVal(bookingId),
                    color: '#aaaaaa',
                    size: 'xs',
                    align: 'end',
                  },
                ],
              },
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: 'ขอบคุณที่ใช้บริการ',
                    align: 'center',
                    size: 'sm',
                    color: '#999999',
                  },
                ],
                margin: 'md',
              },
            ],
          },
          styles: {
            footer: {
              separator: true,
            },
          },
        },
      },
    ],
  }

  return data
}

const renderMsg3 = (booking: { status: any; id: any }, uid: any) => {
  const data = {
    to: uid,
    messages: [
      {
        type: 'flex',
        altText: 'อัพเดทสถานะการจอง',
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: 'อัพเดทสถานะการจอง',
                    color: '#ffffff',
                    size: 'lg',
                    flex: 4,
                    weight: 'bold',
                    align: 'center',
                  },
                ],
              },
            ],
            paddingAll: '20px',
            backgroundColor: '#0367D3',
            spacing: 'md',
            height: '75px',
            paddingTop: '22px',
          },
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: 'สถานะ',
                    size: 'xs',
                    align: 'start',
                  },
                  {
                    type: 'text',
                    text: noVal(booking.status),
                    size: 'xs',
                    align: 'end',
                  },
                ],
              },
              {
                type: 'separator',
                margin: 'md',
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: 'หมายเลขการจอง',
                    size: 'xs',
                    align: 'start',
                  },
                  {
                    type: 'text',
                    text: noVal(booking.id),
                    size: 'xs',
                    align: 'end',
                  },
                ],
                margin: 'md',
              },
            ],
          },
        },
      },
    ],
  }

  return data
}

const getFormattedDate = (date: Date) => {
  const year = date.getFullYear()

  let month = (1 + date.getMonth()).toString()
  month = month.length > 1 ? month : '0' + month

  let day = date.getDate().toString()
  day = day.length > 1 ? day : '0' + day

  const time = `${date.getHours().toString()}:${date.getMinutes().toString()}`

  return day + '/' + month + '/' + year + ' ' + time
}
const notify1 = (accommodation: any, booking: any, order: any) => {
  const date = new Date(booking.date_created)
  const dateString = getFormattedDate(date)
  const bookingData = `Booking Confirm\nBooking Number: ${booking.id}\nBooking Date: ${dateString}`
  const customerData = `Customer: ${booking.customer.first_name} ${booking.customer.last_name}\nEmail: ${booking.customer.email}\nPhone Number: ${booking.customer.phone}`
  const itemData = `Reservation: ${accommodation.title}`
  const priceData = `Grand Total: ${order.currency_symbol}${order.total}\nPayment via: ${order.payment_method_title}`

  const notifyData = `${bookingData}\n\n${customerData}\n\n${itemData}\n\n${priceData}`
  return notifyData
}
