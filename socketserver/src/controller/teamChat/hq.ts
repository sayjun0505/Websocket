import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  OrganizationEntity,
  organizationUserModel,
  UserEntity,
  userModel,
} from '../../model/organization'
import { notificationUtil } from '../../util'
import {
  TeamChatHQMessageEntity,
  teamChatHQMessageModel,
  teamChatHQSettingModel,
  TEAMCHAT_HQ_MESSAGE_TYPE,
} from '../../model/teamChat'
import { sseController } from '../sse'
import { TEAMCHAT_MESSAGE_TYPE } from '../../model/teamChat/message.entity'
import { gcsService } from '../../service/google'

export const getHQData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    let lastMessageText = ''
    let lastMessageAt = null
    let lastMsssageId = null
    let unread = 0
    const hqSetting = await teamChatHQSettingModel.getHQSetting(
      requester.id,
      organization.id,
    )
    if (!hqSetting) {
      unread = await teamChatHQSettingModel.countHQMessageAfterDateTime(
        requester.createdAt,
        organization.id,
      )
    } else {
      unread = await teamChatHQSettingModel.countHQMessageAfterDateTime(
        hqSetting.readAt,
        organization.id,
      )
    }

    const hqLastMessages =
      await teamChatHQMessageModel.getLastHQMessagesWithOrganizationId(
        organization.id,
      )
    if (hqLastMessages) {
      if (hqLastMessages.type === 'text') {
        lastMessageText = JSON.parse(hqLastMessages.data).text
      } else {
        lastMessageText = `${
          hqLastMessages.type === TEAMCHAT_HQ_MESSAGE_TYPE.FILE
            ? 'document'
            : hqLastMessages.type
        } file`
      }
      lastMessageAt = hqLastMessages.createdAt
      lastMsssageId = hqLastMessages.id
    }

    return res.status(200).send({
      id: organization.id,
      createdAt: lastMessageAt,
      lastMessage: lastMessageText,
      unread,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_hq_Setting', 'getHQData', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getHQMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester
    // markRead
    await teamChatHQSettingModel.markRead(requester.id, organization.id)

    const hqMessages =
      await teamChatHQMessageModel.getHQMessagesWithOrganizationId(
        organization.id,
      )

    const messages = await Promise.all(
      hqMessages.map(async (msg) => {
        if (
          msg.type === TEAMCHAT_HQ_MESSAGE_TYPE.IMAGE ||
          msg.type === TEAMCHAT_HQ_MESSAGE_TYPE.AUDIO ||
          msg.type === TEAMCHAT_HQ_MESSAGE_TYPE.FILE ||
          msg.type === TEAMCHAT_HQ_MESSAGE_TYPE.VIDEO
        ) {
          // convert url
          const url = await gcsService.getTeamChatMessageContentURL(
            organization.id,
            'hq',
            JSON.parse(msg.data).filename,
          )
          msg.data = JSON.stringify({ url })
        }
        return {
          id: msg.id,
          data: msg.data,
          isPin: msg.isPin,
          isEdit: msg.isEdit,
          isDelete: msg.isDelete,
          isReply: msg.isReply,
          type: msg.type,
          createdAt: msg.createdAt,
          createdBy: {
            id: msg.createdBy.id,
            display: msg.createdBy.display,
            picture: msg.createdBy.picture,
            pictureURL:
              msg.createdBy.picture &&
              JSON.parse(msg.createdBy.picture) &&
              JSON.parse(msg.createdBy.picture).filename
                ? gcsService.getUserProfileURL(
                    msg.createdBy.id,
                    JSON.parse(msg.createdBy.picture).filename,
                  )
                : '',
          },
        }
      }),
    )
    messages.sort((a, b) => {
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    return res.status(200).send(messages)
    // return res.status(200).send(hqMessages.map((hqMessage) => ({
    //   data: hqMessage.data,
    //   type: hqMessage.type,
    //   createdAt: hqMessage.createdAt,
    //   createdBy: {
    //     id: hqMessage.createdBy.id,
    //     display: hqMessage.createdBy.display,
    //     picture: hqMessage.createdBy.picture,
    // }
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_hq_message', 'getHQMessages', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { message } = req.body

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
    let teamChatHQMessageResult

    const _users = await organizationUserModel.getUsers(organization.id)
    const userIds = _users.map((_) => _.userId)

    if (message.data !== '') {
      const newMessage: TeamChatHQMessageEntity = {
        ...message,
        createdBy: requester,
        organization,
      }

      teamChatHQMessageResult = await teamChatHQMessageModel.saveMessage(
        newMessage,
      )

      // markRead
      await teamChatHQSettingModel.markRead(requester.id, organization.id)

      sseController.sendEventToAllSubscriber(
        organization.id,
        JSON.parse(JSON.stringify({ organizationId: organization.id })),
      )

      // get mention user in message
      if (message.type === TEAMCHAT_MESSAGE_TYPE.TEXT) {
        const textMessage = JSON.parse(message.data).text
        if (textMessage.toLowerCase().indexOf('@[all](all)') >= 0) {
          // All mention
          notificationUtil.teamchat.notificationHQMessageMention(
            userIds,
            teamChatHQMessageResult,
            organization,
          )
          // return res.status(200).send(teamChatHQMessageResult)
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
            const _emailUsers = await userModel.getUserWithEmailList(
              mentionEmailList,
            )
            const _emailUserIds = _emailUsers.map((_) => _.id)
            if (_emailUserIds.length > 0) {
              notificationUtil.teamchat.notificationHQMessageMention(
                _emailUserIds,
                teamChatHQMessageResult,
                organization,
              )
            }

            // filter user not mention
            const differenceUserIds = userIds.filter(
              (x) => !_emailUserIds.includes(x),
            )
            if (differenceUserIds.length > 0) {
              notificationUtil.teamchat.notificationHQMessage(
                differenceUserIds.filter((_user) => _user !== requester.id),
                teamChatHQMessageResult,
                organization,
              )
            }
            // return res.status(200).send(teamChatHQMessageResult)
          }
        }
      }
    }

    const content = req.file
    if (content) {
      try {
        const contentName =
          await gcsService.uploadTeamChatMessageFromFileObject(
            organization.id,
            'hq',
            content.originalname,
            { data: content.buffer },
          )

        const url = await gcsService.getTeamChatMessageContentURL(
          organization.id,
          'hq',
          contentName,
        )
        await teamChatHQSettingModel.markRead(requester.id, organization.id)

        const fileExt = contentName.split('.').pop()
        let type = 'image'
        if (fileExt) {
          if (
            fileExt.toLowerCase() === 'jpg' ||
            fileExt.toLowerCase() === 'jpeg' ||
            fileExt.toLowerCase() === 'gif' ||
            fileExt.toLowerCase() === 'png'
          ) {
            type = 'image'
          } else if (
            fileExt.toLowerCase() === 'mp4' ||
            fileExt.toLowerCase() === 'avi' ||
            fileExt.toLowerCase() === '3gp'
          ) {
            type = 'video'
          } else {
            type = 'file'
          }
        }

        message = {
          data: JSON.stringify({ filename: contentName }),
          type,
        }

        const newFileMessage: TeamChatHQMessageEntity = {
          ...message,
          createdBy: requester,
          organization,
        }

        teamChatHQMessageResult = await teamChatHQMessageModel.saveMessage(
          newFileMessage,
        )
        teamChatHQMessageResult = {
          ...teamChatHQMessageResult,
          data: JSON.stringify({ url }),
        }

        // markRead
        await teamChatHQSettingModel.markRead(requester.id, organization.id)

        sseController.sendEventToAllSubscriber(
          organization.id,
          JSON.parse(JSON.stringify({ organizationId: organization.id })),
        )

        notificationUtil.teamchat.notificationHQMessage(
          userIds,
          teamChatHQMessageResult,
          organization,
        )
      } catch (error) {
        errorMessage(
          'CONTROLLER',
          'teamChat_hq_message',
          'uploadContent',
          error,
        )
        return next(new HttpException(400, ErrorCode[400]))
      }
    }
    return res.status(200).send(teamChatHQMessageResult)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat_hq_message', 'sendMessage')
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const uploadContent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  const content = req.file
  if (!content) {
    errorMessage('CONTROLLER', 'teamChat_hq_message', 'invalid file')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const contentName = await gcsService.uploadTeamChatMessageFromFileObject(
      organization.id,
      'hq',
      content.originalname,
      { data: content.buffer },
    )

    const url = await gcsService.getTeamChatMessageContentURL(
      organization.id,
      'hq',
      contentName,
    )
    await teamChatHQSettingModel.markRead(requester.id, organization.id)

    return res.status(200).json({
      message: 'Upload was successful',
      fileName: contentName,
      url,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat_hq_message', 'uploadContent', error)
    return next(new HttpException(400, ErrorCode[400]))
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
    const teamChatHQMessageResult = await teamChatHQMessageModel.isPinMessage(
      message,
    )
    return res.status(200).send(teamChatHQMessageResult)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat_hq_message', 'sendPinMessage')
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
    const result = await teamChatHQMessageModel.isDeleteMessage(message)

    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'hqMessage', 'deleteMessage', error)
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
    const result = await teamChatHQMessageModel.isEditMessage(message)

    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'hqMessage', 'editMessage', error)
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
    const teamChatHQMessageResult = await teamChatHQMessageModel.isReplyMessage(
      message,
    )
    return res.status(200).send(teamChatHQMessageResult)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat_hq_message', 'sendReplyMessage')
    return next(new HttpException(400, ErrorCode[400]))
  }
}
export const getHQDataforSocket = async (
  params:any
) => {
  try {
    const organization: OrganizationEntity = params.organization
    const requester: UserEntity = params.requester

    let lastMessageText = ''
    let lastMessageAt = null
    let lastMsssageId = null
    let unread = 0
    const hqSetting = await teamChatHQSettingModel.getHQSetting(
      requester.id,
      organization.id,
    )
    if (!hqSetting) {
      unread = await teamChatHQSettingModel.countHQMessageAfterDateTime(
        requester.createdAt,
        organization.id,
      )
    } else {
      unread = await teamChatHQSettingModel.countHQMessageAfterDateTime(
        hqSetting.readAt,
        organization.id,
      )
    }

    const hqLastMessages =
      await teamChatHQMessageModel.getLastHQMessagesWithOrganizationId(
        organization.id,
      )
    if (hqLastMessages) {
      if (hqLastMessages.type === 'text') {
        lastMessageText = JSON.parse(hqLastMessages.data).text
      } else {
        lastMessageText = `${
          hqLastMessages.type === TEAMCHAT_HQ_MESSAGE_TYPE.FILE
            ? 'document'
            : hqLastMessages.type
        } file`
      }
      lastMessageAt = hqLastMessages.createdAt
      lastMsssageId = hqLastMessages.id
    }

    return ({
      id: organization.id,
      createdAt: lastMessageAt,
      lastMessage: lastMessageText,
      unread
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_hq_Setting', 'getHQData', error)
    return "error500"
  }
}

export const getHQMessagesforSocket = async (
  params:any
) => {
  try {
    const organization: OrganizationEntity = params.organization
    const requester: UserEntity = params.requester
    // markRead
    await teamChatHQSettingModel.markRead(requester.id, organization.id)

    const hqMessages =
      await teamChatHQMessageModel.getHQMessagesWithOrganizationId(
        organization.id,
      )

    const messages = await Promise.all(
      hqMessages.map(async (msg) => {
        if (
          msg.type === TEAMCHAT_HQ_MESSAGE_TYPE.IMAGE ||
          msg.type === TEAMCHAT_HQ_MESSAGE_TYPE.AUDIO ||
          msg.type === TEAMCHAT_HQ_MESSAGE_TYPE.FILE ||
          msg.type === TEAMCHAT_HQ_MESSAGE_TYPE.VIDEO
        ) {
          // convert url
          const url = await gcsService.getTeamChatMessageContentURL(
            organization.id,
            'hq',
            JSON.parse(msg.data).filename,
          )
          msg.data = JSON.stringify({ url })
        }
        return {
          id: msg.id,
          data: msg.data,
          isPin: msg.isPin,
          isEdit: msg.isEdit,
          isDelete: msg.isDelete,
          isReply: msg.isReply,
          type: msg.type,
          createdAt: msg.createdAt,
          createdBy: {
            id: msg.createdBy.id,
            display: msg.createdBy.display,
            picture: msg.createdBy.picture,
            pictureURL:
              msg.createdBy.picture &&
              JSON.parse(msg.createdBy.picture) &&
              JSON.parse(msg.createdBy.picture).filename
                ? gcsService.getUserProfileURL(
                    msg.createdBy.id,
                    JSON.parse(msg.createdBy.picture).filename,
                  )
                : '',
          },
        }
      }),
    )
    messages.sort((a, b) => {
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    return messages    
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_hq_message', 'getHQMessages', error)
    return "error500"
  }
}

export const sendMessageforSocket = async (
  params:any
) => {
  let { message } = params

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message || message.data == null || !message.type || message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return "error400"
  }

  const organization: OrganizationEntity = params.organization
  const requester: UserEntity = params.requester

  try {
    let teamChatHQMessageResult

    const _users = await organizationUserModel.getUsers(organization.id)
    const userIds = _users.map((_) => _.userId)

    if (message.data !== '') {
      const newMessage: TeamChatHQMessageEntity = {
        ...message,
        createdBy: requester,
        organization,
      }

      teamChatHQMessageResult = await teamChatHQMessageModel.saveMessage(
        newMessage,
      )

      // markRead
      await teamChatHQSettingModel.markRead(requester.id, organization.id)

      sseController.sendEventToAllSubscriber(
        organization.id,
        JSON.parse(JSON.stringify({ organizationId: organization.id })),
      )

      // get mention user in message
      if (message.type === TEAMCHAT_MESSAGE_TYPE.TEXT) {
        const textMessage = JSON.parse(message.data).text
        if (textMessage.toLowerCase().indexOf('@[all](all)') >= 0) {
          // All mention
          notificationUtil.teamchat.notificationHQMessageMention(
            userIds,
            teamChatHQMessageResult,
            organization,
          )
          // return res.status(200).send(teamChatHQMessageResult)
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
            const _emailUsers = await userModel.getUserWithEmailList(
              mentionEmailList,
            )
            const _emailUserIds = _emailUsers.map((_) => _.id)
            if (_emailUserIds.length > 0) {
              notificationUtil.teamchat.notificationHQMessageMention(
                _emailUserIds,
                teamChatHQMessageResult,
                organization,
              )
            }

            // filter user not mention
            const differenceUserIds = userIds.filter(
              (x) => !_emailUserIds.includes(x),
            )
            if (differenceUserIds.length > 0) {
              notificationUtil.teamchat.notificationHQMessage(
                differenceUserIds.filter((_user) => _user !== requester.id),
                teamChatHQMessageResult,
                organization,
              )
            }
            // return res.status(200).send(teamChatHQMessageResult)
          }
        }
      }
    }

    const content = params.file
    if (content) {
      try {
        const contentName =
          await gcsService.uploadTeamChatMessageFromFileObject(
            organization.id,
            'hq',
            content.originalname,
            { data: content.buffer },
          )

        const url = await gcsService.getTeamChatMessageContentURL(
          organization.id,
          'hq',
          contentName,
        )
        await teamChatHQSettingModel.markRead(requester.id, organization.id)

        const fileExt = contentName.split('.').pop()
        let type = 'image'
        if (fileExt) {
          if (
            fileExt.toLowerCase() === 'jpg' ||
            fileExt.toLowerCase() === 'jpeg' ||
            fileExt.toLowerCase() === 'gif' ||
            fileExt.toLowerCase() === 'png'
          ) {
            type = 'image'
          } else if (
            fileExt.toLowerCase() === 'mp4' ||
            fileExt.toLowerCase() === 'avi' ||
            fileExt.toLowerCase() === '3gp'
          ) {
            type = 'video'
          } else {
            type = 'file'
          }
        }

        message = {
          data: JSON.stringify({ filename: contentName }),
          type,
        }

        const newFileMessage: TeamChatHQMessageEntity = {
          ...message,
          createdBy: requester,
          organization,
        }

        teamChatHQMessageResult = await teamChatHQMessageModel.saveMessage(
          newFileMessage,
        )
        teamChatHQMessageResult = {
          ...teamChatHQMessageResult,
          data: JSON.stringify({ url }),
        }

        // markRead
        await teamChatHQSettingModel.markRead(requester.id, organization.id)

        sseController.sendEventToAllSubscriber(
          organization.id,
          JSON.parse(JSON.stringify({ organizationId: organization.id })),
        )

        notificationUtil.teamchat.notificationHQMessage(
          userIds,
          teamChatHQMessageResult,
          organization,
        )
      } catch (error) {
        errorMessage(
          'CONTROLLER',
          'teamChat_hq_message',
          'uploadContent',
          error,
        )
        return "error400"
      }
    }
    return teamChatHQMessageResult
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat_hq_message', 'sendMessage')
    return "error400"
  }
}

export const uploadContentforSocket = async (
  params:any
) => {
  const organization: OrganizationEntity = params.organization
  const requester: UserEntity = params.requester

  const content = params.file
  if (!content) {
    errorMessage('CONTROLLER', 'teamChat_hq_message', 'invalid file')
    return "error400"
  }

  try {
    const contentName = await gcsService.uploadTeamChatMessageFromFileObject(
      organization.id,
      'hq',
      content.originalname,
      { data: content.buffer },
    )

    const url = await gcsService.getTeamChatMessageContentURL(
      organization.id,
      'hq',
      contentName,
    )
    await teamChatHQSettingModel.markRead(requester.id, organization.id)

    return ({
      message: 'Upload was successful',
      fileName: contentName,
      url
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat_hq_message', 'uploadContent', error)
    return "error400"
  }
}

export const setPinforSocket = async (
  params:any
) => {
  let { message } = params

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return "error400"
  }

  try {
    const teamChatHQMessageResult = await teamChatHQMessageModel.isPinMessage(
      message,
    )
    return teamChatHQMessageResult
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat_hq_message', 'sendPinMessage')
    return "error400"
  }
}

export const setDeleteMessageforSocket = async (
  params:any
) => {
  let { message } = params

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return "error400"
  }

  try {
    const result = await teamChatHQMessageModel.isDeleteMessage(message)

    return result
  } catch (error) {
    errorMessage('CONTROLLER', 'hqMessage', 'deleteMessage', error)
    return "error500"
  }
}

export const setEditMessageforSocket = async (
  params:any
) => {
  let { message } = params

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return "error400"
  }

  try {
    const result = await teamChatHQMessageModel.isEditMessage(message)

    return result
  } catch (error) {
    errorMessage('CONTROLLER', 'hqMessage', 'editMessage', error)
    return "error500"
  }
}

export const setReplyMessageforSocket = async (
  params:any
) => {
  let { message } = params

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return "error400"
  }

  try {
    const teamChatHQMessageResult = await teamChatHQMessageModel.isReplyMessage(
      message,
    )
    return teamChatHQMessageResult
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat_hq_message', 'sendReplyMessage')
    return "error400"
  }
}
