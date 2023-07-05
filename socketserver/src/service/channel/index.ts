import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'

import { CHANNEL, ChannelEntity } from '../../model/channel'
import { MessageEntity } from '../../model/chat'
import { CustomerEntity } from '../../model/customer'
import { OrganizationEntity } from '../../model/organization'

import * as facebookService from './facebook'
import * as instagramService from './instagram'
import * as lineService from './line'
export interface ISocialProfile {
  firstname?: string
  lastname?: string
  display: string
  picture: string
  uid: string
  email?: string
}

export const getCustomerProfile = async (
  uid: string,
  channel: ChannelEntity,
) => {
  if (!channel) {
    errorMessage('SERVICE', 'channel', 'invalid parameter(channel)')
    throw new HttpException(400, ErrorCode[400])
  }

  try {
    switch (channel.channel) {
      case CHANNEL.LINE:
        const lineProfile = await lineService.getLineCustomerProfile(
          uid,
          channel,
        )
        const newLineProfile: ISocialProfile = {
          uid: lineProfile.userId,
          display: lineProfile.displayName,
          picture: lineProfile.pictureUrl ? lineProfile.pictureUrl : '',
        }
        return newLineProfile
      case CHANNEL.FACEBOOK:
        const fbProfile = await facebookService.getFacebookCustomerProfile(
          uid,
          channel,
        )
        const newFacebookProfile: ISocialProfile = {
          firstname: fbProfile.firstname,
          lastname: fbProfile.lastname,
          uid: fbProfile.fbId,
          display: fbProfile.firstname === '' && fbProfile.lastname === '' ? fbProfile.fbId : `${fbProfile.firstname} ${fbProfile.lastname}`,
          picture: fbProfile.profilePic ? fbProfile.profilePic : '',
          email: fbProfile.email,
        }
        return newFacebookProfile
      case CHANNEL.INSTAGRAM:
        const igProfile = await instagramService.getInstagramCustomerProfile(
          uid,
          channel,
        )
        const newInstagramProfile: ISocialProfile = {
          uid: igProfile.igId,
          display: igProfile.name === '' ? igProfile.username : igProfile.name,
          picture: igProfile.profilePic,
        }
        return newInstagramProfile
    }
  } catch (error) {
    errorMessage('SERVICE', 'channel', 'getCustomerProfile', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const sendMessage = async (
  organizationId: string,
  channel: ChannelEntity,
  customer: CustomerEntity,
  message: MessageEntity,
) => {
  try {
    switch (channel.channel) {
      case CHANNEL.LINE:
        return lineService.sendMessage(organizationId, channel, customer, message)
      case CHANNEL.FACEBOOK:
        return facebookService.sendMessage(organizationId, channel, customer, message)
      case CHANNEL.INSTAGRAM:
        return instagramService.sendMessage(organizationId, channel, customer, message)
      default:
        errorMessage('SERVICE', 'channel', 'invalid parameter(channel)')
        throw new HttpException(400, ErrorCode[400])
    }
  } catch (error) {
    errorMessage('SERVICE', 'channel', 'sendMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export { facebookService, instagramService, lineService }
