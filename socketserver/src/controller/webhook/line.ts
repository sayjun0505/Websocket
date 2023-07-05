import { NextFunction, Request, Response } from 'express'
import * as crypto from 'crypto'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { channelModel } from '../../model/channel'
import { OrganizationEntity, UserEntity } from '../../model/organization'
import {
  chatModel,
  MessageEntity,
  messageModel,
  MESSAGE_TYPE,
} from '../../model/chat'
import { ChannelEntity } from '../../model/channel/channel.entity'
import { lineService } from '../../service/channel'
import { gcsService } from '../../service/google'
import { MESSAGE_DIRECTION } from '../../model/chat/message.entity'
import { ChatEntity } from '../../model/chat/chat.entity'
import { CustomerEntity } from '../../model/customer/customer.entity'
import { customerModel } from '../../model/customer'
import * as channelService from '../../service/channel'
import * as replyService from '../../service/reply'
import { notificationUtil, workingHoursUtil } from '../../util'
import { sseController } from '../sse'
import { sendMessage } from '../chat/message'
import {
  chatManagement,
  customerManagement,
  getNewCustomerProfile,
} from './helper'

export const validateRequestHeader = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const headerSignature = req.headers['x-line-signature']
  if (!headerSignature || typeof headerSignature !== 'string') {
    errorMessage('CONTROLLER', 'line', 'invalid header signature')
    return next(new HttpException(400, ErrorCode[400]))
  }

  // Get Channel
  const { channelCode } = req.params
  if (!channelCode) {
    errorMessage('CONTROLLER', 'line', 'invalid parameter(channelCode)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const channelId = Buffer.from(channelCode, 'base64').toString('binary')
  const channel = await channelModel.getChannelWithIdAndOnOrganization(
    channelId,
  )
  if (!channel || !channel.line) {
    errorMessage(
      'CONTROLLER',
      'webhook.line',
      `Skip message from channel: ${channelId}`,
    )
    return
  }

  const channelSecret = channel.line.channelSecret
  const body = JSON.stringify(req.body)
  const signature = await crypto
    .createHmac('SHA256', channelSecret)
    .update(body)
    .digest('base64')
  const compare = signature.localeCompare(headerSignature)

  if (compare !== 0) {
    errorMessage('CONTROLLER', 'webhook.line', 'signature is wrong')
    return next(new HttpException(400, ErrorCode[400]))
  }

  // set channel for next function
  req.body.channel = channel
  req.body.organization = channel.organization

  next()
  // res.sendStatus(200)
}

interface ILineSource {
  type: string
  userId: string
  groupId?: string
  roomId?: string
}
interface ILineMessage {
  id: string
  type: string
  text?: string
  [key: string]: any
}
interface ILineMessageEvent {
  // Common properties
  type: string
  mode: string
  timestamp: number
  source: ILineSource
  // Specific message event properties
  replyToken: string
  message?: ILineMessage
  unsend?: { messageId: string }
}

// Convert Line event object to FoxConnect MessageEntity object
const convertMessageEvent = async (
  organizationId: string,
  event: ILineMessageEvent,
  customer: CustomerEntity,
  channel: ChannelEntity,
  chat: ChatEntity,
) => {
  if (event.type !== 'message' || !event.message) {
    errorMessage('CONTROLLER', 'webhook.line', 'input event wrong type')
    throw new HttpException(400, ErrorCode[400])
  }

  // Note : PostgreSQL doesn't support storing NULL (\0x00) characters in text fields
  const nullCharRegExp = new RegExp(/\u0000|\x00/m)

  const timestamp = new Date(Number(event.timestamp))
  const messageTimestamp = timestamp ? timestamp : new Date()
  let lineMessageData = {}
  switch (event.message.type) {
    case MESSAGE_TYPE.TEXT:
      if (!event.message.text) {
        errorMessage('CONTROLLER', 'webhook.line', 'text type wrong format')
        throw new HttpException(400, ErrorCode[400])
      }
      lineMessageData = {
        text: event.message.text.replace(nullCharRegExp, ''),
      }
      break
    case MESSAGE_TYPE.STICKER:
      if (!event.message.stickerId) {
        errorMessage('CONTROLLER', 'webhook.line', 'sticker type wrong format')
        throw new HttpException(400, ErrorCode[400])
      }
      lineMessageData = { sticker: event.message.stickerId }
      break
    case MESSAGE_TYPE.LOCATION:
      if (!event.message.stickerId) {
        errorMessage('CONTROLLER', 'webhook.line', 'sticker type wrong format')
        throw new HttpException(400, ErrorCode[400])
      }

      lineMessageData = {
        title: event.message.title,
        address: event.message.address,
        latitude: event.message.latitude,
        longitude: event.message.longitude,
      }
      break
    case MESSAGE_TYPE.AUDIO:
    case MESSAGE_TYPE.IMAGE:
    case MESSAGE_TYPE.FILE:
    case MESSAGE_TYPE.VIDEO:
      const mediaObj = await lineService.getMediaContent(
        channel,
        event.message.id,
      )
      const filename = await gcsService.uploadChatMessageFromFileObject(
        organizationId,
        channel,
        customer.id,
        event.message.id,
        mediaObj,
      )
      lineMessageData = { filename }
      break
    default:
      errorMessage(
        'CONTROLLER',
        'webhook.line',
        'unsupported message event type',
      )
      throw new HttpException(400, ErrorCode[400])
  }

  return {
    ...new MessageEntity(),
    data: JSON.stringify(lineMessageData),
    channel,
    type: event.message.type,
    timestamp: messageTimestamp,
    direction: MESSAGE_DIRECTION.INBOUND,
    chat,
    organizationId,
  } as MessageEntity
}

export const receiveMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // destination: User ID of a bot that should receive webhook events.
    // const { destination, events } = req.body
    const events: ILineMessageEvent[] = req.body.events
    const destination: string = req.body.destination
    const organization: OrganizationEntity = req.body.organization
    const channel: ChannelEntity = req.body.channel

    const organizationId: string = organization.id

    if (!destination || !events) {
      errorMessage(
        'CONTROLLER',
        'webhook.line',
        'invalid data(destination/events)',
      )
      return next(new HttpException(400, ErrorCode[400]))
    }

    console.log('[LINE] BOT userId (destination): ', destination)

    // for verify webhook
    if (events && events.length === 0) {
      console.log('LINE webhook verify')
      return res.sendStatus(200)
    }

    /**
     * Section: Message event type
     * Description: Filter message type only
     */
    const messageEvent = await events.filter(
      (element: { type: string; source: any }) =>
        element &&
        element.type === 'message' &&
        element.source &&
        element.source.userId &&
        element.source.type === 'user',
    )

    // Prepare data before process message
    if (!messageEvent || !messageEvent.length || messageEvent.length <= 0) {
      errorMessage('CONTROLLER', 'webhook.line', `Payload have no messaging`)
      return
    } else {
      // Customer Management: Get current customer / Update customer profile / Create new customer
      const customers = await customerManagement(
        [
          ...new Set(
            messageEvent.map(
              (_msgEvent: { source: { userId: any } }) =>
                _msgEvent.source.userId,
            ),
          ),
        ],
        channel,
      )
      console.log('[receiveMessage] customers:', customers)

      // Chat Management: Get current chat / Create new chat
      const chats = await chatManagement(
        customers.map((customer) => customer.id),
        channel,
      )
      console.log('[receiveMessage] chats:', chats)

      messageEvent.forEach(async (event: ILineMessageEvent) => {
        const customer = customers.find(
          (_customer: CustomerEntity) => _customer.uid === event.source.userId,
        )
        if (!customer) {
          errorMessage(
            'CONTROLLER',
            'webhook.line',
            `Skip message: customer ${event.source.userId} not found`,
          )
          return
        }
        const chat = chats.find(
          (_chat: ChatEntity) => _chat.customerId === customer.id,
        )
        if (!chat) {
          errorMessage(
            'CONTROLLER',
            'webhook.line',
            `Skip message: chat not found`,
          )
          return
        }
        const isNewChat = Boolean(chat.organizationId)

        /**
         * New Message
         */
        // let message
        if (event.message) {
          try {
            const _newMessage = await convertMessageEvent(
              organizationId,
              event,
              customer,
              channel,
              chat,
            )
            if (!_newMessage) {
              errorMessage(
                'CONTROLLER',
                'webhook.instagram',
                'convertMessageEvent(message)',
              )
            } else {
              const newMessage = await messageModel.saveMessage(_newMessage)
              console.log('New Message ', newMessage.id)

              // Check auto response response type only text message
              if (newMessage.type === MESSAGE_TYPE.TEXT) {
                try {
                  const messageData = JSON.parse(newMessage.data)
                  replyService.sendAutoResponseMessage(
                    messageData.text,
                    chat,
                    channel,
                    customer,
                    organization,
                  )
                } catch (error) {
                  errorMessage(
                    'CONTROLLER',
                    'webhook.line',
                    'auto response',
                    error,
                  )
                }
              }

              if (isNewChat) {
                // Update Customer profile
                await getNewCustomerProfile(
                  customer,
                  customer.uid,
                  channel,
                  organization.id,
                )

                // Check auto response welcome type
                // try {
                //   replyService.sendWelcomeMessage(
                //     chat,
                //     channel,
                //     customer,
                //     organization,
                //   )
                // } catch (error) {
                //   errorMessage(
                //     'CONTROLLER',
                //     'webhook.line',
                //     'auto response(welcome message)',
                //     error,
                //   )
                // }
                // Send Notification new Chat to all chat user
                notificationUtil.chat.notificationNewChat(chat, organization)
              } else {
                if (chat.ownerId) {
                  notificationUtil.chat.notificationNewMessage(
                    newMessage,
                    organization,
                  )
                }
              }

              // Check Working Hours
              try {
                const result = await workingHoursUtil.isWorkingHours(
                  organization,
                )
                if (!result) {
                  // Send Working Hour Message
                  workingHoursUtil.sendWorkingHourMessage(
                    chat,
                    channel,
                    customer,
                    organization,
                  )
                }
              } catch (error) {
                errorMessage(
                  'CONTROLLER',
                  'webhook.line',
                  'Working Hours',
                  error,
                )
              }
            }
          } catch (error) {
            errorMessage(
              'CONTROLLER',
              'webhook.line',
              'receiveMessage(message)',
              error,
            )
            return
            // throw new HttpException(400, ErrorCode[400])
          }
        }
        sseController.sendEventToAllSubscriber(
          organization.id,
          JSON.parse(JSON.stringify({ event: 'newEvent' })),
        )
        return
      })
    }

    res.status(200).send({
      code: 'received',
    })

    // You must send back a 200, within 20 seconds, to let us know you've
  } catch (error) {
    errorMessage('CONTROLLER', 'webhook.line', 'receiveMessage', error)
    // return next(new HttpException(400, ErrorCode[400]))
    res.status(200).send({
      code: 'received',
    })
  }
}
