import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { gcsService } from '../google'
import { ChannelEntity } from '../../model/channel'
import { MessageEntity, MESSAGE_TYPE } from '../../model/chat'
import { CustomerEntity } from '../../model/customer'

export interface IInstagramProfile {
  name: string
  username: string
  profilePic: string
  igId: string
}

const FB_GRAPH_URL = process.env.FB_GRAPH_URL
const APP_SECRET = process.env.MESSENGER_APP_SECRET
const APP_ID = process.env.MESSENGER_APP_ID
const VALIDATION_TOKEN = process.env.MESSENGER_VALIDATION_TOKEN
const SERVER_URL = process.env.SERVER_URL

if (!(FB_GRAPH_URL && APP_SECRET && VALIDATION_TOKEN && SERVER_URL)) {
  errorMessage('SERVICE', 'facebook', 'missing facebook env')
  throw new HttpException(500, ErrorCode[500])
}

export const validate = (mode: string, token: string): boolean => {
  return mode === 'subscribe' && token === VALIDATION_TOKEN
}

export const getInstagramCustomerProfile = async (
  id: string,
  channel: ChannelEntity,
): Promise<IInstagramProfile> => {
  try {
    if (!channel || !channel.instagram) {
      errorMessage('SERVICE', 'instagram', 'invalid parameter(channel)')
      throw new HttpException(400, ErrorCode[400])
    }

    const BASE_URL = `${FB_GRAPH_URL}/${id}`
    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${channel.instagram.accessToken}`,
      },
    })

    // const display = await gcsService.uploadChatCustomerDisplay(
    //   channel,
    //   customerId,
    //   response.data.id,
    //   response.data.profile_pic,
    // )

    return {
      name: response.data.name || '',
      username: response.data.username || '',
      profilePic: response.data.profile_pic,
      igId: response.data.id,
    }
  } catch (error) {
    // console.error('[DEBUG] ',error)
    errorMessage('SERVICE', 'instagram', `get profile (${id})`, error)
    throw new HttpException(500, ErrorCode[500])
  }
}

/**
 * Facebook Messenger Service
 * Send the message using the Send API.
 *
 */

const makeMessageObject = async (
  organizationId: string,
  channel: ChannelEntity,
  customer: CustomerEntity,
  message: MessageEntity,
) => {
  let facebookMessage
  switch (message.type) {
    case MESSAGE_TYPE.TEXT:
      facebookMessage = {
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
      facebookMessage = {
        attachment: {
          type: message.type,
          payload: {
            url,
            // eslint-disable-next-line camelcase
            is_reusable: false,
          },
        },
      }
      break
    default:
      errorMessage('SERVICE', 'facebook', 'invalid parameter(message type)')
      throw new HttpException(400, ErrorCode[400])
  }
  return {
    recipient: {
      id: customer.uid,
    },
    message: facebookMessage,
  }
}

export const sendMessage = async (
  organizationId: string,
  channel: ChannelEntity,
  customer: CustomerEntity,
  message: MessageEntity,
) => {
  if (!channel || !channel.instagram) {
    errorMessage('SERVICE', 'instagram', 'invalid parameter(channel)')
    return new HttpException(400, ErrorCode[400])
  }

  if (channel && channel.isDelete) {
    errorMessage('SERVICE', 'instagram', 'channel unavailable')
    return new HttpException(400, ErrorCode[400])
  }

  const BASE_URL = `${FB_GRAPH_URL}/me/messages`

  try {
    const messageData = await makeMessageObject(
      organizationId,
      channel,
      customer,
      message,
    )
    const response = await axios.post(BASE_URL, messageData, {
      headers: {
        Authorization: `Bearer ${channel.instagram.accessToken}`,
      },
    })
    return response.data
  } catch (error) {
    errorMessage('SERVICE', 'instagram', 'sendMessage', error)
    return new HttpException(500, ErrorCode[500])
  }
}
