import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { ChannelEntity, channelModel } from '../../model/channel'
import { gcsService } from '../google'
import { MessageEntity, MESSAGE_TYPE } from '../../model/chat'
import { CustomerEntity } from '../../model/customer'
export interface ILineProfile {
  displayName: string
  pictureUrl?: string
  userId: string
  statusMessage?: string
}

const LINE_API_URL = process.env.LINE_API_URL
const LINE_DATA_API_URL = process.env.LINE_DATA_API_URL
const BACKEND_URL = process.env.BACKEND_URL

if (!(LINE_API_URL && LINE_DATA_API_URL && BACKEND_URL)) {
  errorMessage('SERVICE', 'line', 'missing line env')
  throw new HttpException(500, ErrorCode[500])
}

export const getStickerUrl = (stickerId: string): string => {
  return (
    'https://stickershop.line-scdn.net/stickershop/v1/sticker/' +
    stickerId +
    '/android/sticker.png'
  )
}

export const getLineCustomerProfile = async (
  uid: string,
  channel: ChannelEntity,
): Promise<ILineProfile> => {
  try {
    if (!channel || !channel.line) {
      errorMessage('SERVICE', 'line', 'invalid parameter(channel)')
      throw new HttpException(400, ErrorCode[400])
    }

    const BASE_URL = `${LINE_API_URL}/profile/${uid}`
    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${channel.line.accessToken}`,
      },
    })

    // const display = await gcsService.uploadChatCustomerDisplay(
    //   channel,
    //   customerId,
    //   response.data.userId,
    //   response.data.pictureUrl,
    // )

    return {
      displayName: response.data.displayName,
      pictureUrl: response.data.pictureUrl,
      userId: response.data.userId,
      statusMessage: response.data.statusMessage,
    }
  } catch (error) {
    errorMessage('SERVICE', 'line', 'get profile', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

/*
 * New LINE Service
 * Setup LINE Channel
 *
 */
export const setWebhook = async (channel: ChannelEntity) => {
  if (!channel || !channel.line) {
    errorMessage('SERVICE', 'line', 'invalid parameter(channel)')
    throw new HttpException(400, ErrorCode[400])
  }
  if (channel && channel.isDelete) {
    errorMessage('SERVICE', 'line', 'channel unavailable')
    throw new HttpException(400, ErrorCode[400])
  }
  try {
    const channelCode = Buffer.from(channel.id, 'binary').toString('base64')
    const webhookURL = `${BACKEND_URL}/api/webhook/line/${channelCode}`
    const result = await axios.put(
      `${LINE_API_URL}/channel/webhook/endpoint`,
      { endpoint: webhookURL },
      {
        headers: {
          Authorization: `Bearer ${channel.line.accessToken}`,
        },
      },
    )
    return result.data
  } catch (error) {
    errorMessage('SERVICE', 'line', 'setup webhook')
    throw new HttpException(400, ErrorCode[400])
  }
}

export const testWebhook = async (channel: ChannelEntity) => {
  if (!channel || !channel.line) {
    errorMessage('SERVICE', 'line', 'invalid parameter(channel)')
    throw new HttpException(400, ErrorCode[400])
  }
  if (channel && channel.isDelete) {
    errorMessage('SERVICE', 'line', 'channel unavailable')
    throw new HttpException(400, ErrorCode[400])
  }
  try {
    const result = await axios.put(
      `${LINE_API_URL}/channel/webhook/test`,
      {},
      {
        headers: {
          Authorization: `Bearer ${channel.line.accessToken}`,
        },
      },
    )
    return result.data
  } catch (error) {
    errorMessage('SERVICE', 'line', 'test webhook')
    throw new HttpException(400, ErrorCode[400])
  }
}

export const getWebhook = async (channel: ChannelEntity) => {
  if (!channel || !channel.line) {
    errorMessage('SERVICE', 'line', 'invalid parameter(channel)')
    throw new HttpException(400, ErrorCode[400])
  }
  if (channel && channel.isDelete) {
    errorMessage('SERVICE', 'line', 'channel unavailable')
    throw new HttpException(400, ErrorCode[400])
  }
  try {
    const result = await axios.get(`${LINE_API_URL}/channel/webhook/endpoint`, {
      headers: {
        Authorization: `Bearer ${channel.line.accessToken}`,
      },
    })
    return result.data
  } catch (error) {
    errorMessage('SERVICE', 'line', 'get webhook')
    throw new HttpException(400, ErrorCode[400])
  }
}

/*
 * Get Media content Image/Video
 *
 */
// https://api-data.line.me/v2/bot/message/{messageId}/content
export const getMediaContent = async (
  channel: ChannelEntity,
  mediaId: string,
) => {
  if (!channel || !channel.line) {
    errorMessage('SERVICE', 'line', 'invalid parameter(channel)')
    throw new HttpException(400, ErrorCode[400])
  }
  if (channel && channel.isDelete) {
    errorMessage('SERVICE', 'line', 'channel unavailable')
    throw new HttpException(400, ErrorCode[400])
  }

  const BASE_URL = `${LINE_DATA_API_URL}/message/${mediaId}/content`
  const response = await axios.get(BASE_URL, {
    headers: {
      Authorization: `Bearer ${channel.line.accessToken}`,
    },
    responseType: 'arraybuffer',
  })
  return { contentType: response.headers['content-type'], data: response.data }
}

/*
 * Send the message using the Send API.
 *
 */

const makeMessageObject = async (
  organizationId: string,
  channel: ChannelEntity,
  customer: CustomerEntity,
  message: MessageEntity,
) => {
  let lineMessage
  switch (message.type) {
    case MESSAGE_TYPE.TEXT:
      // case MESSAGE_TYPE.SURVEY:
      lineMessage = {
        type: 'text',
        text: JSON.parse(message.data).text,
      }
      break
    case MESSAGE_TYPE.IMAGE:
    case MESSAGE_TYPE.VIDEO:
      const url = await gcsService.getChatMessageContentURL(
        organizationId,
        channel,
        customer.id,
        JSON.parse(message.data).filename,
      )
      lineMessage = {
        type: message.type,
        originalContentUrl: url,
        previewImageUrl: url,
      }
      break
    case MESSAGE_TYPE.CONFIRM:
      lineMessage = {
        type: 'template',
        altText: 'this is a template message',
        template: JSON.parse(message.data).confirm,
      }
      break
    case MESSAGE_TYPE.BUTTONS:
      lineMessage = {
        type: 'template',
        altText: 'this is a template message',
        template: JSON.parse(message.data).buttons,
      }
      break
    case MESSAGE_TYPE.CAROUSEL:
      lineMessage = {
        type: 'template',
        altText: 'this is a template message',
        template: JSON.parse(message.data).carousel,
      }
      break
    case MESSAGE_TYPE.FLEX:
      lineMessage = {
        type: 'flex',
        altText: 'this is a flex message',
        contents: JSON.parse(JSON.parse(message.data).flex),
      }
      break
    default:
      errorMessage('SERVICE', 'line', 'invalid parameter(message type)')
      throw new HttpException(400, ErrorCode[400])
  }
  if (lineMessage) {
    return {
      to: customer.uid,
      messages: [lineMessage],
    }
  }
}

export const sendMessage = async (
  organizationId: string,
  channel: ChannelEntity,
  customer: CustomerEntity,
  message: MessageEntity,
) => {
  if (!channel || !channel.line) {
    errorMessage('SERVICE', 'line', 'invalid parameter(channel)')
    throw new HttpException(400, ErrorCode[400])
  }

  if (channel && channel.isDelete) {
    errorMessage('SERVICE', 'line', 'channel unavailable')
    throw new HttpException(400, ErrorCode[400])
  }

  const BASE_URL = `${LINE_API_URL}/message/push`

  try {
    const messageData = await makeMessageObject(
      organizationId,
      channel,
      customer,
      message,
    )
    const response = await axios.post(BASE_URL, messageData, {
      headers: {
        Authorization: `Bearer ${channel.line.accessToken}`,
      },
    })
    return response.data
  } catch (error) {
    errorMessage('SERVICE', 'line', 'sendMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
