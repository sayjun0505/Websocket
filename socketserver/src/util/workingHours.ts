import { CustomerEntity } from '../model/customer'

import * as channelService from '../service/channel'
import { keywordModel, replyModel, REPLY_EVENT } from '../model/reply'
import { OrganizationEntity } from '../model/organization'
import { errorMessage } from '../middleware/exceptions'
import { ChannelEntity } from '../model/channel/channel.entity'
import {
  ChatEntity,
  MessageEntity,
  messageModel,
  MESSAGE_DIRECTION,
} from '../model/chat'

// var WorkingHours = require('working-hours').WorkingHours
export const isWorkingHours = async (organization: OrganizationEntity) => {
  const workingHours = [
    organization.sunday,
    organization.monday,
    organization.tuesday,
    organization.wednesday,
    organization.thursday,
    organization.friday,
    organization.saturday,
  ]
  const todayWorkingHours = workingHours[new Date().getDay()]

  // In case Disable and working all time
  if (todayWorkingHours === 'disable' || todayWorkingHours === 'all') {
    return true
  }

  const range = todayWorkingHours.split('-')
  const startHour = range[0].split(':')[0]
  const endHour = range[1].split(':')[0]

  const currentTime = new Date().getTime()
  const startDateTime = new Date().setHours(Number(startHour), 0, 0, 0)
  const endDateTime = new Date().setHours(Number(endHour), 0, 0, 0)
  return startDateTime <= currentTime && endDateTime >= currentTime
}

export const sendWorkingHourMessage = async (
  chat: ChatEntity,
  channel: ChannelEntity,
  customer: CustomerEntity,
  organization: OrganizationEntity,
) => {
  if (!organization || !organization.workingHoursMessage) return
  // New Message
  let message
  try {
    const newMessage = {
      ...new MessageEntity(),
      data: JSON.stringify({ text: organization.workingHoursMessage }),
      channel,
      type: 'text',
      timestamp: new Date(),
      direction: MESSAGE_DIRECTION.OUTBOUND,
      chat,
      organization,
    } as MessageEntity
    message = await messageModel.saveMessage(newMessage)

    channelService.sendMessage(organization.id, channel, customer, message)
  } catch (error) {
    errorMessage('UTIL', 'workingHours', 'sendWorkingHourMessage', error)
    return
    // throw new HttpException(400, ErrorCode[400])
  }
}
