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
  TeamChatChannelMessageEntity,
  teamChatChannelMessageModel,
  teamChatMentionModel,
} from '../../model/teamChat'
import { gcsService } from '../../service/google'
import { notificationUtil } from '../../util'
import { TEAMCHAT_MESSAGE_TYPE } from '../../model/teamChat/message.entity'
import { DR_MESSAGE_TYPE } from '../../model/teamChat/directMessage.entity'

import { sseController } from '../sse'
// import { sseController } from '../sse'
import { TeamChatMentionEntity } from '../../model/teamChat/mention.entity'
import {
  TeamChatChannelMemberEntity,
  teamChatChannelMemberModel,
} from '../../model/teamChat'
import { saveMentions } from '../../model/chat/mention.model'

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { message, channelId } = req.body

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message || message.data == null || !message.type || message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    let teamChatMessageResult

    const channelMember = await teamChatChannelMemberModel.getChannelMembers(
      channelId,
    )
    const memberIds = channelMember.map((member) => member.memberId)

    if (message.data !== '') {
      const newMessage: TeamChatChannelMessageEntity = {
        ...message,
        channelId,
        createdBy: requester,
        organization,
      }

      teamChatMessageResult = await teamChatChannelMessageModel.saveMessage(
        newMessage,
      )

      // markRead
      await teamChatMentionModel.markRead(requester.id, channelId, organization)

      sseController.sendEventToAllSubscriber(
        organization.id,
        JSON.parse(JSON.stringify({ channelId })),
      )

      // get mention user in message
      if (message.type === TEAMCHAT_MESSAGE_TYPE.TEXT) {
        const textMessage = JSON.parse(message.data).text
        if (textMessage.toLowerCase().indexOf('@[all](all)') >= 0) {
          // All mention
          notificationUtil.teamchat.notificationChannelMention(
            memberIds.filter((memberId) => memberId !== requester.id),
            newMessage,
            organization,
          )
          // return res.status(200).send(teamChatMessageResult)
        } else {
          const mentionEmailList = textMessage.match(
            /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
          )

          // Send Notification Event
          if (
            mentionEmailList &&
            mentionEmailList.length &&
            mentionEmailList.length > 0
          ) {
            const _users = await userModel.getUserWithEmailList(
              mentionEmailList,
            )
            const userIds = _users.map((_) => _.id)
            if (userIds && userIds.length > 0) {
              notificationUtil.teamchat.notificationChannelMention(
                userIds,
                newMessage,
                organization,
              )
            }

            // filter user not mention
            const differenceUserIds = memberIds.filter(
              (x) => !userIds.includes(x),
            )

            notificationUtil.teamchat.notificationChannelMessage(
              differenceUserIds.filter((memberId) => memberId !== requester.id),
              newMessage,
              organization,
            )
            // return res.status(200).send(teamChatMessageResult)
          }
        }
      }
      notificationUtil.teamchat.notificationChannelMessage(
        memberIds.filter((memberId) => memberId !== requester.id),
        newMessage,
        organization,
      )
    }

    // file upload
    const content = req.file
    if (content) {
      try {
        const contentName =
          await gcsService.uploadTeamChatMessageFromFileObject(
            organization.id,
            channelId,
            content.originalname,
            { data: content.buffer },
          )

        const url = await gcsService.getTeamChatMessageContentURL(
          organization.id,
          channelId,
          contentName,
        )
        await teamChatMentionModel.markRead(
          requester.id,
          channelId,
          organization,
        )

        const fileExt = contentName.split('.').pop()
        let type = TEAMCHAT_MESSAGE_TYPE.IMAGE
        if (fileExt) {
          if (
            fileExt.toLowerCase() === 'jpg' ||
            fileExt.toLowerCase() === 'jpeg' ||
            fileExt.toLowerCase() === 'gif' ||
            fileExt.toLowerCase() === 'png'
          ) {
            type = TEAMCHAT_MESSAGE_TYPE.IMAGE
          } else if (
            fileExt.toLowerCase() === 'mp4' ||
            fileExt.toLowerCase() === 'avi' ||
            fileExt.toLowerCase() === '3gp'
          ) {
            type = TEAMCHAT_MESSAGE_TYPE.VIDEO
          } else {
            type = TEAMCHAT_MESSAGE_TYPE.FILE
          }
        }

        message = {
          data: JSON.stringify({ filename: contentName }),
          type,
        }

        const newFileMessage: TeamChatChannelMessageEntity = {
          ...message,
          channelId,
          createdBy: requester,
          organization,
        }

        teamChatMessageResult = await teamChatChannelMessageModel.saveMessage(
          newFileMessage,
        )
        teamChatMessageResult = {
          ...teamChatMessageResult,
          data: JSON.stringify({ url }),
        }

        // markRead
        await teamChatMentionModel.markRead(
          requester.id,
          channelId,
          organization,
        )

        notificationUtil.teamchat.notificationChannelMessage(
          channelMember
            .filter((member) => member.memberId !== requester.id)
            .map((member) => member.memberId),
          newFileMessage,
          organization,
        )

        sseController.sendEventToAllSubscriber(
          organization.id,
          JSON.parse(JSON.stringify({ channelId })),
        )
      } catch (error) {
        errorMessage('CONTROLLER', 'teamChat.message', 'uploadContent', error)
        return next(new HttpException(400, ErrorCode[400]))
      }
    }

    return res.status(200).send(teamChatMessageResult)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat.message', 'sendMessage')
    return next(new HttpException(400, ErrorCode[400]))
  }
}
export const uploadContent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const channel = req.params.channelId
  const requester: UserEntity = req.body.requester

  const content = req.file
  if (!content) {
    errorMessage('CONTROLLER', 'message', 'invalid file')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const filename = Buffer.from(
      `${channel}${new Date().getTime()}`,
      'binary',
    ).toString('base64')

    const contentName = await gcsService.uploadTeamChatMessageFromFileObject(
      organization.id,
      channel,
      content.originalname,
      { data: content.buffer },
    )

    const url = await gcsService.getTeamChatMessageContentURL(
      organization.id,
      channel,
      contentName,
    )
    await teamChatMentionModel.markRead(requester.id, channel, organization)
    return res.status(200).json({
      message: 'Upload was successful',
      fileName: contentName,
      url,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat.message', 'uploadContent', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}
export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const channelId = req.params.channelId

    const result = await teamChatChannelMessageModel.getMessagesWithChannelId(
      channelId,
      organization,
    )
    if (!result) {
      errorMessage('CONTROLLER', 'chat', 'chat not found')
      return next(new HttpException(404, 'chat not found'))
    }

    // Convert TeamChat message
    const convertTeamChatMessage = await result.map((message) => {
      if (message.type === TEAMCHAT_MESSAGE_TYPE.TEXT) {
        return message
      }
      if (message.type === TEAMCHAT_MESSAGE_TYPE.IMAGE) {
        const url = gcsService.getTeamChatMessageContentURL(
          organization.id,
          channelId,
          JSON.parse(message.data).filename,
        )
        message.data = JSON.stringify({ url })
      }
      return {
        id: message.id,
        data: message.data,
        type: message.type,
        channelId: message.channel,
        isPin: message.isPin,
        isEdit: message.isEdit,
        isDelete: message.isDelete,
        isReply: message.isReply,
        createdAt: message.createdAt,
        createdBy: {
          id: message.createdBy.id,
          display: message.createdBy.display,
          picture: message.createdBy.picture,
        },
      }
    })
    console.log("convertTeamChatMessage.length:",convertTeamChatMessage.length)
    if (convertTeamChatMessage && convertTeamChatMessage.length > 1) {
      convertTeamChatMessage.sort(function (obj1, obj2) {
        const a = obj1 as TeamChatChannelMessageEntity
        const b = obj2 as TeamChatChannelMessageEntity
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
    }

    return res.status(201).send(convertTeamChatMessage)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat', 'get_teamChat', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getMessagesforSocket = async (
  params:any,
) => {
  try {
    const organization: OrganizationEntity = params.organization
    const channelId = params.channelId

    const result = await teamChatChannelMessageModel.getMessagesWithChannelId(
      channelId,
      organization,
    )
    if (!result) {
      errorMessage('CONTROLLER', 'chat', 'chat not found')
      return 'chat not found'
    }

    // Convert TeamChat message
    const convertTeamChatMessage = await result.map((message) => {
      if (message.type === TEAMCHAT_MESSAGE_TYPE.TEXT) {
        return message
      }
      if (message.type === TEAMCHAT_MESSAGE_TYPE.IMAGE) {
        const url = gcsService.getTeamChatMessageContentURL(
          organization.id,
          channelId,
          JSON.parse(message.data).filename,
        )
        message.data = JSON.stringify({ url })
      }
      return {
        id: message.id,
        data: message.data,
        type: message.type,
        channelId: message.channel,
        isPin: message.isPin,
        isEdit: message.isEdit,
        isDelete: message.isDelete,
        isReply: message.isReply,
        createdAt: message.createdAt,
        createdBy: {
          id: message.createdBy.id,
          display: message.createdBy.display,
          picture: message.createdBy.picture,
        },
      }
    })
    console.log("convertTeamChatMessage.length:",convertTeamChatMessage.length)
    if (convertTeamChatMessage && convertTeamChatMessage.length > 1) {
      convertTeamChatMessage.sort(function (obj1, obj2) {
        const a = obj1 as TeamChatChannelMessageEntity
        const b = obj2 as TeamChatChannelMessageEntity
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
    }

    return convertTeamChatMessage
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat', 'get_teamChat', error)
    return "error500"
  }
}

export const setPin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { message } = req.body

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const result = await teamChatChannelMessageModel.isPinMessage(message)
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat_channel_message', 'sendPinMessage')
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const setDeleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { message } = req.body

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const result = await teamChatChannelMessageModel.isDeleteMessage(message)

    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'channelMessage', 'deleteMessage', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const setEditMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { message } = req.body

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const result = await teamChatChannelMessageModel.isEditMessage(message)

    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'channelMessage', 'editMessage', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const setReplyMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { message } = req.body

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const result = await teamChatChannelMessageModel.isReplyMessage(message)
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat_channel_message', 'sendReplyMessage')
    return next(new HttpException(400, ErrorCode[400]))
  }
}
