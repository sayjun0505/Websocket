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
export interface IFacebookProfile {
  firstname?: string
  lastname: string
  profilePic?: string
  fbId: string
  email: string
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

export const getFacebookCustomerProfile = async (
  uid: string,
  channel: ChannelEntity,
): Promise<IFacebookProfile> => {
  try {
    if (!channel || !channel.facebook) {
      errorMessage('SERVICE', 'facebook', 'invalid parameter(channel)')
      throw new HttpException(400, ErrorCode[400])
    }

    const BASE_URL = `${FB_GRAPH_URL}/${uid}`
    const response = await axios.get(BASE_URL, {
      headers: {
        Authorization: `Bearer ${channel.facebook.accessToken}`,
      },
    })

    // const display = await gcsService.uploadChatCustomerDisplay(
    //   channel,
    //   customerId,
    //   response.data.id,
    //   response.data.profile_pic,
    // )

    return {
      firstname: response.data.first_name || '',
      lastname: response.data.last_name || '',
      profilePic: response.data.profile_pic || '',
      fbId: response.data.id,
      email: response.data.email || '',
    }
  } catch (error) {
    // console.error('[DEBUG] ',error)
    errorMessage('SERVICE', 'facebook', `get profile (${uid})`, error)
    throw new HttpException(500, ErrorCode[500])
  }
}

/*
 * New Facebook Service
 * Setup Facebook Channel
 *
 */
export const getPageList = async (userID: string, accessToken: string) => {
  const URL = `${FB_GRAPH_URL}/${userID}/accounts?access_token=${accessToken}`
  const ret = await axios
    .get(URL)
    .then(async (response: AxiosResponse) => {
      return response.data.data
    })
    .catch((error: AxiosError) => {
      console.error('[Facebook] getPageList: ', error.response?.data)
      throw new HttpException(500, ErrorCode[500])
    })
  return ret
}

export const getLongLivedAccessToken = (accessToken: string) => {
  const URL = `${FB_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${accessToken}`
  const ret = axios
    .get(URL)
    .then(async (response: AxiosResponse) => {
      return response.data
    })
    .catch((error: AxiosError) => {
      console.error(
        '[Facebook] getLongLivedAccessToken: ',
        error.response?.data,
      )
      throw new HttpException(500, ErrorCode[500])
    })
  return ret
}

export const subscribedMessages = async (
  pageId: string,
  accessToken: string,
) => {
  const URL = `${FB_GRAPH_URL}/${pageId}/subscribed_apps?access_token=${accessToken}&subscribed_fields=messages`
  const ret = await axios
    .post(URL)
    .then(async (response: AxiosResponse) => {
      return response.data
    })
    .catch((error: AxiosError) => {
      console.error(
        '[Facebook] Subscribed Messages on Facebook page: ',
        error.response?.data,
      )
      throw new HttpException(500, ErrorCode[500])
    })
  return ret
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

    case MESSAGE_TYPE.BUTTONS:
      const data = JSON.parse(message.data).buttons
      const buttons = data.actions
        ? data.actions.map((_: { label: any; text: any }) => ({
            type: 'postback',
            title: _.label,
            payload: _.text,
          }))
        : []

      facebookMessage = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: data.title,
            buttons,
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
  if (!channel || !channel.facebook) {
    errorMessage('SERVICE', 'facebook', 'invalid parameter(channel)')
    return new HttpException(400, ErrorCode[400])
  }

  if (channel && channel.isDelete) {
    errorMessage('SERVICE', 'facebook', 'channel unavailable')
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
        Authorization: `Bearer ${channel.facebook.accessToken}`,
      },
    })
    return response.data
  } catch (error) {
    errorMessage('SERVICE', 'facebook', 'sendMessage', error)
    return new HttpException(500, ErrorCode[500])
  }
}
