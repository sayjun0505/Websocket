import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  OrganizationEntity,
  UserEntity,
  userModel,
} from '../../model/organization'
import * as channelService from '../../service/channel'
import {
  TeamChatChannelMemberEntity,
  teamChatChannelMemberModel,
} from '../../model/teamChat'
import { gcsService } from '../../service/google'
import { notificationUtil } from '../../util'
import { TEAMCHAT_MESSAGE_TYPE } from '../../model/teamChat/message.entity'
import { DR_MESSAGE_TYPE } from '../../model/teamChat/directMessage.entity'

import { sseController } from '../sse'
// import { sseController } from '../sse'
import { TeamChatMentionEntity } from '../../model/teamChat/mention.entity'
import { saveMentions } from '../../model/chat/mention.model'
import member from 'src/api/teamChat/member'

export const getChannelMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const channelId = req.params.channelId
    const result = await teamChatChannelMemberModel.getChannelMembers(channelId)
    if (!result) {
      errorMessage('CONTROLLER', 'channel', 'getChannelMembers')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(200).send(result.map((element)=>({
      id: element.id,
      createdAt: element.createdAt,
      memberId: element.memberId,
      display: element.member.display,
      picture: element.member.picture,
      isOnline: element.member.isOnline,
      pictureURL: element.member.picture && JSON.parse(element.member.picture) && JSON.parse(element.member.picture).filename ? gcsService.getUserProfileURL(
        element.member.id,
        JSON.parse(element.member.picture).filename,
      ) : '',
      email: element.member.email,
    })))
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'getChannelMembers', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const deleteChannelMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const { id } = req.params
    // const channel = await teamChatChannelMemberModel.getChannelIdWithId(id)
    const result = await teamChatChannelMemberModel.deleteChannelMemberWithId(
      id,
    )

    if (!result) {
      errorMessage('CONTROLLER', 'channel', 'deleteChannelMembers')
      return next(new HttpException(500, ErrorCode[500]))
    }
    sseController.sendEventToAllSubscriber(
      organization.id,
      JSON.parse(JSON.stringify({ updatedChannelId: null })),
      // JSON.parse(JSON.stringify({ updatedChannelId: channel?.channelId })),
    )
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'deleteChannelMembers', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getChannelMembersforSocket = async (
  params:any
) => {
  try {
    const organization: OrganizationEntity = params.organization
    const channelId = params.channelId
    const result = await teamChatChannelMemberModel.getChannelMembers(channelId)
    if (!result) {
      errorMessage('CONTROLLER', 'channel', 'getChannelMembers')
      return "error500"
    }
    return (result.map((element)=>({
      id: element.id,
      createdAt: element.createdAt,
      memberId: element.memberId,
      display: element.member.display,
      picture: element.member.picture,
      isOnline: element.member.isOnline,
      pictureURL: element.member.picture && JSON.parse(element.member.picture) && JSON.parse(element.member.picture).filename ? gcsService.getUserProfileURL(
        element.member.id,
        JSON.parse(element.member.picture).filename,
      ) : '',
      email: element.member.email,
    })))
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'getChannelMembers', error)
    return "error500"
  }
}
export const deleteChannelMembersforSocket = async (
  params:any
) => {
  try {
    const organization: OrganizationEntity = params.organization
    const { id } = params
    // const channel = await teamChatChannelMemberModel.getChannelIdWithId(id)
    const result = await teamChatChannelMemberModel.deleteChannelMemberWithId(
      id,
    )

    if (!result) {
      errorMessage('CONTROLLER', 'channel', 'deleteChannelMembers')
      return "error500"
    }
    sseController.sendEventToAllSubscriber(
      organization.id,
      JSON.parse(JSON.stringify({ updatedChannelId: null })),
      // JSON.parse(JSON.stringify({ updatedChannelId: channel?.channelId })),
    )
    return result
  } catch (error) {
    errorMessage('CONTROLLER', 'channel', 'deleteChannelMembers', error)
    return "error500"
  }
}
