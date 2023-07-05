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
import * as channelService from '../../service/channel'
import {
  TeamChatDirectMessageEntity,
  teamChatDirectMessageModel,
  teamChatDmSettingModel,
} from '../../model/teamChat'
import { gcsService } from '../../service/google'
import { notificationUtil } from '../../util'
import { TEAMCHAT_MESSAGE_TYPE } from '../../model/teamChat/message.entity'
import { DR_MESSAGE_TYPE } from '../../model/teamChat/directMessage.entity'
import { organizationModel, } from '../../model/organization'
import { sseController } from '../sse'
import { v4 as uuidv4 } from 'uuid';
import { saveMentions } from '../../model/chat/mention.model'
export const sendDirectMessageforSocket = async (
  msgdata: any
) => {
  const organization = await organizationModel.getOrganizationWithId(
    msgdata.organizationId,
  )
  const user = await userModel.getUserWithId(msgdata.sendUser)
  // const rsvuser = await userModel.getUserWithId(msgdata.receiveUser)
  let registerid = uuidv4()
  try {
    if ((user !== undefined) && (organization !== undefined) && (user !== null) && (organization !== null)) {
      const newMessage: TeamChatDirectMessageEntity = {
        data: `{"text":"${msgdata.data}"}`,
        id: registerid,
        type: DR_MESSAGE_TYPE.TEXT,
        receiveUser: msgdata.receiveUser,
        receiveUserId: msgdata.receiveUser,
        sendUserId: user.id,
        sendUser: user,
        isPin: false,
        isEdit: false,
        isReply: false,
        isDelete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        organization: organization,
      }
      const directMessageResult = await teamChatDirectMessageModel.saveDirectMessage(newMessage)
      if (organization != undefined) {
        await teamChatDmSettingModel.markRead(
          msgdata.sendUser,
          msgdata.receiveUser,
          msgdata.organizationId
        )
      }
      sseController.sendEventToAllSubscriber(
        organization.id,
        JSON.parse(
          JSON.stringify({
            teamchat: 'directMessage',
            receiveUser: msgdata.receiveUser,
            sendUser: user.id,
          }),
        ),
      )

      notificationUtil.teamchat.notificationDirectMessage(
        newMessage,
        msgdata.receiveUser,
        organization,
      )
      return 1;
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat', 'sendDirectMessage')
    return "e-400"
  }
}

export const sendDirectMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { message } = req.body
  const receiveUser = req.params.receiveUser
  if (typeof message === 'string') {
    message = JSON.parse(message)
  }
  if (!message || !message.data || !message.type || message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  try {
    const newMessage: TeamChatDirectMessageEntity = {
      ...message,
      receiveUser,
      sendUser: requester,
      createdBy: requester,
      organization,
    }
    const directMessageResult =
      await teamChatDirectMessageModel.saveDirectMessage(newMessage)
    // markRead
    await teamChatDmSettingModel.markRead(
      requester.id,
      receiveUser,
      organization.id,
    )
    console.log("requester.id:", requester.id)
    // notificationUtil.notificationNewEvent(organization)
    sseController.sendEventToAllSubscriber(
      organization.id,
      JSON.parse(
        JSON.stringify({
          teamchat: 'directMessage',
          receiveUser,
          sendUser: requester.id,
        }),
      ),
    )
    notificationUtil.teamchat.notificationDirectMessage(
      newMessage,
      receiveUser,
      organization,
    )
    return res.status(200).send(directMessageResult)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat', 'sendDirectMessage')
    return next(new HttpException(400, ErrorCode[400]))
  }
}
export const sendDirectMessageAndFile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const receiveUser = req.params.receiveUser
  const requester: UserEntity = req.body.requester
  // message register
  let { message } = req.body
  if (typeof message === 'string') {
    message = JSON.parse(message)
  }
  if (!message || message.data == null || !message.type || message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  try {
    let directMessageResult
    if (message.data !== '') {
      const newMessage: TeamChatDirectMessageEntity = {
        ...message,
        receiveUser,
        sendUser: requester,
        createdBy: requester,
        organization,
      }
      directMessageResult = await teamChatDirectMessageModel.saveDirectMessage(
        newMessage,
      )
      // markRead
      await teamChatDmSettingModel.markRead(
        requester.id,
        receiveUser,
        organization.id,
      )
      // notificationUtil.notificationNewEvent(organization)
      sseController.sendEventToAllSubscriber(
        organization.id,
        JSON.parse(JSON.stringify({ receiveUser })),
      )
      notificationUtil.teamchat.notificationDirectMessage(
        newMessage,
        receiveUser,
        organization,
      )
    }
    // file upload
    const content = req.file
    if (!content) {
      return res.status(200).send(directMessageResult)
    }
    try {
      const filename = Buffer.from(
        `${content.originalname}${new Date().getTime()}`,
        'binary',
      ).toString('base64')
      const contentName = await gcsService.uploadDirectMessageFromFileObject(
        organization.id,
        requester.id,
        receiveUser,
        content.originalname,
        { data: content.buffer },
      )
      const url = await gcsService.getDirectMessageContentURL(
        organization.id,
        requester.id,
        receiveUser,
        contentName,
      )
      // markRead
      await teamChatDmSettingModel.markRead(
        requester.id,
        receiveUser,
        organization.id,
      )
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
        } else if (fileExt.toLowerCase() === 'mp4') {
          type = 'video'
        } else {
          type = 'file'
        }
      }
      message = {
        data: JSON.stringify({ filename: contentName }),
        type,
      }
      const fileMessage: TeamChatDirectMessageEntity = {
        ...message,
        receiveUser,
        sendUser: requester,
        createdBy: requester,
        organization,
      }

      directMessageResult = await teamChatDirectMessageModel.saveDirectMessage(
        fileMessage,
      )
      directMessageResult = {
        ...directMessageResult,
        data: JSON.stringify({ url }),
      }
      // markRead
      await teamChatDmSettingModel.markRead(
        requester.id,
        receiveUser,
        organization.id,
      )
      // notificationUtil.notificationNewEvent(organization)
      sseController.sendEventToAllSubscriber(
        organization.id,
        JSON.parse(JSON.stringify({ receiveUser })),
      )
      notificationUtil.teamchat.notificationDirectMessage(
        fileMessage,
        receiveUser,
        organization,
      )
    } catch (error) {
      errorMessage('CONTROLLER', 'teamChat.message', 'uploadContent', error)
      return next(new HttpException(400, ErrorCode[400]))
    }
    return res.status(200).send(directMessageResult)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat.message', 'sendMessage')
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const uploadDirectContent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const receiveUser = req.params.receiveUser
  const requester: UserEntity = req.body.requester

  const content = req.file
  if (!content) {
    errorMessage('CONTROLLER', 'message', 'invalid file')
    return next(new HttpException(400, ErrorCode[400]))
  }
  try {
    const contentName = await gcsService.uploadDirectMessageFromFileObject(
      organization.id,
      requester.id,
      receiveUser,
      content.originalname,
      { data: content.buffer },
    )
    const url = await gcsService.getDirectMessageContentURL(
      organization.id,
      requester.id,
      receiveUser,
      contentName,
    )
    // markRead
    await teamChatDmSettingModel.markRead(
      requester.id,
      receiveUser,
      organization.id,
    )
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
export const getMessageById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  const { messageId, receiveUser } = req.body

  await teamChatDmSettingModel.markRead(
    requester.id,
    receiveUser,
    organization.id,
  )
  let result = (await teamChatDirectMessageModel.getDirectMessageWithMessageId(
    messageId,
  )) as TeamChatDirectMessageEntity
  if (
    result.type === DR_MESSAGE_TYPE.IMAGE ||
    result.type === DR_MESSAGE_TYPE.AUDIO ||
    result.type === DR_MESSAGE_TYPE.FILE ||
    result.type === DR_MESSAGE_TYPE.VIDEO
  ) {
    const url = gcsService.getDirectMessageContentURL(
      organization.id,
      result.sendUser.id,
      result.receiveUser.id,
      JSON.parse(result.data).filename,
    )
    result = {
      ...result,
      data: JSON.stringify({ url }),
    } as TeamChatDirectMessageEntity
  }
  const user = await userModel.getUserWithId(receiveUser)
  const userResult = user
    ? {
      id: user.id,
      display: user.display,
      picture: user.picture,
      isOnline: user.isOnline,
      pictureURL:
        user.picture &&
          JSON.parse(user.picture) &&
          JSON.parse(user.picture).filename
          ? gcsService.getUserProfileURL(
            user.id,
            JSON.parse(user.picture).filename,
          )
          : '',
    }
    : null
  const messagesResult = {
    id: result.id,
    type: result.type,
    data: result.data,
    isPin: result.isPin,
    isEdit: result.isEdit,
    isDelete: result.isDelete,
    isReply: result.isReply,
    createdAt: result.createdAt,
    sendUser: {
      id: result.sendUser.id,
      display: result.sendUser.display,
      picture: result.sendUser.picture,
      pictureURL:
        result.sendUser.picture &&
          JSON.parse(result.sendUser.picture) &&
          JSON.parse(result.sendUser.picture).filename
          ? gcsService.getUserProfileURL(
            result.sendUser.id,
            JSON.parse(result.sendUser.picture).filename,
          )
          : '',
    },
  }
  return res.status(201).send(messagesResult)
}
export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  const { receiveUser } = req.params
  // markRead
  await teamChatDmSettingModel.markRead(
    requester.id,
    receiveUser,
    organization.id,
  )
  try {
    const user = await userModel.getUserWithId(receiveUser)
    const result = await teamChatDirectMessageModel.getDirectMessage(
      requester.id,
      receiveUser,
      organization,
    )
    const convertDirectMessage = await result.map((message) => {
      if (message.type === DR_MESSAGE_TYPE.TEXT) {
        return message as TeamChatDirectMessageEntity
      }
      if (
        message.type === DR_MESSAGE_TYPE.IMAGE ||
        message.type === DR_MESSAGE_TYPE.AUDIO ||
        message.type === DR_MESSAGE_TYPE.FILE ||
        message.type === DR_MESSAGE_TYPE.VIDEO
      ) {
        const url = gcsService.getDirectMessageContentURL(
          organization.id,
          message.sendUser.id,
          message.receiveUser.id,
          JSON.parse(message.data).filename,
        )
        return {
          ...message,
          data: JSON.stringify({ url }),
        } as TeamChatDirectMessageEntity
      }
      {
        return message
      }
    })
    if (convertDirectMessage && convertDirectMessage.length > 1) {
      convertDirectMessage.sort(function (obj1, obj2) {
        const a = obj1 as TeamChatDirectMessageEntity
        const b = obj2 as TeamChatDirectMessageEntity
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
    }
    const userResult = user
      ? {
        id: user.id,
        display: user.display,
        picture: user.picture,
        isOnline: user.isOnline,
        pictureURL:
          user.picture &&
            JSON.parse(user.picture) &&
            JSON.parse(user.picture).filename
            ? gcsService.getUserProfileURL(
              user.id,
              JSON.parse(user.picture).filename,
            )
            : '',
      }
      : null
    const messagesResult = convertDirectMessage.map((dm) => ({
      id: dm.id,
      type: dm.type,
      data: dm.data,
      isPin: dm.isPin,
      isEdit: dm.isEdit,
      isDelete: dm.isDelete,
      isReply: dm.isReply,
      createdAt: dm.createdAt,
      sendUser: {
        id: dm.sendUser.id,
        display: dm.sendUser.display,
        picture: dm.sendUser.picture,
        pictureURL:
          dm.sendUser.picture &&
            JSON.parse(dm.sendUser.picture) &&
            JSON.parse(dm.sendUser.picture).filename
            ? gcsService.getUserProfileURL(
              dm.sendUser.id,
              JSON.parse(dm.sendUser.picture).filename,
            )
            : '',
      },
    }))
    return res.status(201).send({
      contact: userResult,
      messages: messagesResult,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'directMessage', 'getMessages', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getMessagesforSocket = async (
  params: any
) => {
  const organizationId = params.oid
  const requesterId = params.uid
  const receiveUserId = params.cid
  // markRead
  await teamChatDmSettingModel.markRead(
    requesterId,
    receiveUserId,
    organizationId,
  )
  try {
    const user = await userModel.getUserWithId(receiveUserId)
    const result = await teamChatDirectMessageModel.getDirectMessage(
      requesterId,
      receiveUserId,
      organizationId,
    )
    const convertDirectMessage = await result.map((message) => {
      if (message.type === DR_MESSAGE_TYPE.TEXT) {
        return message as TeamChatDirectMessageEntity
      }
      if (
        message.type === DR_MESSAGE_TYPE.IMAGE ||
        message.type === DR_MESSAGE_TYPE.AUDIO ||
        message.type === DR_MESSAGE_TYPE.FILE ||
        message.type === DR_MESSAGE_TYPE.VIDEO
      ) {
        const url = gcsService.getDirectMessageContentURL(
          organizationId,
          message.sendUser.id,
          message.receiveUser.id,
          JSON.parse(message.data).filename,
        )
        return {
          ...message,
          data: JSON.stringify({ url }),
        } as TeamChatDirectMessageEntity
      }
      {
        return message
      }
    })
    if (convertDirectMessage && convertDirectMessage.length > 1) {
      convertDirectMessage.sort(function (obj1, obj2) {
        const a = obj1 as TeamChatDirectMessageEntity
        const b = obj2 as TeamChatDirectMessageEntity
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
    }
    const userResult = user
      ? {
        id: user.id,
        display: user.display,
        picture: user.picture,
        isOnline: user.isOnline,
        pictureURL:
          user.picture &&
            JSON.parse(user.picture) &&
            JSON.parse(user.picture).filename
            ? gcsService.getUserProfileURL(
              user.id,
              JSON.parse(user.picture).filename,
            )
            : '',
      }
      : null
    const messagesResult = convertDirectMessage.map((dm) => ({
      id: dm.id,
      type: dm.type,
      data: dm.data,
      isPin: dm.isPin,
      isEdit: dm.isEdit,
      isDelete: dm.isDelete,
      isReply: dm.isReply,
      createdAt: dm.createdAt,
      sendUser: {
        id: dm.sendUser.id,
        display: dm.sendUser.display,
        picture: dm.sendUser.picture,
        pictureURL:
          dm.sendUser.picture &&
            JSON.parse(dm.sendUser.picture) &&
            JSON.parse(dm.sendUser.picture).filename
            ? gcsService.getUserProfileURL(
              dm.sendUser.id,
              JSON.parse(dm.sendUser.picture).filename,
            )
            : '',
      },
    }))
    return {
      contact: userResult,
      messages: messagesResult,
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'directMessage', 'getMessages', error)
    return "error500"
  }
}
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  const userList = await organizationUserModel.getUsers(organization.id)
  if (userList.length === 0) return res.status(201).send([])
  try {
    const directMessages = await Promise.all(
      userList.map(async (user) => {
        const messageList = await teamChatDirectMessageModel.getDirectMessage(
          requester.id,
          user.userId,
          organization,
        )
        messageList.sort((a, b) => {
          return a.createdAt.getTime() - b.createdAt.getTime()
        })

        const lastMessageObj =
          messageList.length > 0 ? messageList[messageList.length - 1] : null

        let unread = 0
        const directReadLastest = await teamChatDmSettingModel.getDmLastest(
          requester.id,
          user.userId,
          organization.id,
        )
        if (!directReadLastest) {
          unread = await teamChatDmSettingModel.countDmMessageAfterDateTime(
            requester.createdAt,
            requester.id,
            user.userId,
            organization,
          )
        } else {
          unread = await teamChatDmSettingModel.countDmMessageAfterDateTime(
            directReadLastest.readAt,
            requester.id,
            user.userId,
            organization,
          )
        }

        let lastMessageText = ''
        if (lastMessageObj) {
          if (lastMessageObj.type === 'text') {
            lastMessageText = JSON.parse(lastMessageObj.data).text
          } else {
            lastMessageText = `${lastMessageObj.type === DR_MESSAGE_TYPE.FILE
                ? 'document'
                : lastMessageObj.type
              } file`
          }
        }
        return {
          id: user.id,
          userId: user.userId,
          email: user.user.email,
          display: user.user.display,
          picture: user.user.picture,
          isOnline: user.user.isOnline,
          pictureURL:
            user.user.picture &&
              JSON.parse(user.user.picture) &&
              JSON.parse(user.user.picture).filename
              ? gcsService.getUserProfileURL(
                user.userId,
                JSON.parse(user.user.picture).filename,
              )
              : '',
          createdAt: lastMessageObj ? lastMessageObj.createdAt : null,
          lastMessage: lastMessageText,
          unread,
        }
      }),
    )
    return res.status(201).send(directMessages)
  } catch (error) {
    errorMessage('CONTROLLER', 'directMessage', 'getDirectMessages', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getUsersforSocket = async (
  params: any
) => {
  const organizationId = params.oid
  const requesterId = params.uid
  const requester = await userModel.getUserWithId(params.uid)
  const userList = await organizationUserModel.getUsers(organizationId)
  if (userList.length === 0) return []
  try {
    const directMessages = await Promise.all(
      userList.map(async (user) => {
        const messageList = await teamChatDirectMessageModel.getDirectMessage(
          requesterId,
          user.userId,
          organizationId,
        )
        messageList.sort((a, b) => {
          return a.createdAt.getTime() - b.createdAt.getTime()
        })

        const lastMessageObj =
          messageList.length > 0 ? messageList[messageList.length - 1] : null

        let unread = 0
        const directReadLastest = await teamChatDmSettingModel.getDmLastest(
          requesterId,
          user.userId,
          organizationId,
        )
        if (!directReadLastest) {
          if (requester != undefined) {
            unread = await teamChatDmSettingModel.countDmMessageAfterDateTime(
              requester.createdAt,
              requesterId,
              user.userId,
              organizationId,
            )
          }
        } else {
          unread = await teamChatDmSettingModel.countDmMessageAfterDateTime(
            directReadLastest.readAt,
            requesterId,
            user.userId,
            organizationId,
          )
        }

        let lastMessageText = ''
        if (lastMessageObj) {
          if (lastMessageObj.type === 'text') {
            lastMessageText = JSON.parse(lastMessageObj.data).text
          } else {
            lastMessageText = `${lastMessageObj.type === DR_MESSAGE_TYPE.FILE
                ? 'document'
                : lastMessageObj.type
              } file`
          }
        }
        return {
          id: user.id,
          userId: user.userId,
          email: user.user.email,
          display: user.user.display,
          picture: user.user.picture,
          isOnline: user.user.isOnline,
          pictureURL:
            user.user.picture &&
              JSON.parse(user.user.picture) &&
              JSON.parse(user.user.picture).filename
              ? gcsService.getUserProfileURL(
                user.userId,
                JSON.parse(user.user.picture).filename,
              )
              : '',
          createdAt: lastMessageObj ? lastMessageObj.createdAt : null,
          lastMessage: lastMessageText,
          unread,
        }
      }),
    )
    return directMessages
  } catch (error) {
    errorMessage('CONTROLLER', 'directMessage', 'getDirectMessages', error)
    return "error500"
  }
}

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { contactId } = req.params
  const organization: OrganizationEntity = req.body.organization

  try {
    if (typeof contactId !== 'string') {
      errorMessage('CONTROLLER', 'user', 'invalid user id')
      return next(new HttpException(400, ErrorCode[400]))
    }
    // const user = await userModel.getUserWithId(contactId)
    const organizationUser = await organizationUserModel.getUserWithId(
      organization,
      contactId,
    )
    if (!organizationUser) {
      errorMessage('CONTROLLER', 'user', 'User(id) not found')
      return next(new HttpException(404, 'user not found'))
    }
    return res.status(200).send({
      id: organizationUser.userId,
      email: organizationUser.user.email,
      firstname: organizationUser.user.firstname,
      lastname: organizationUser.user.lastname,
      display: organizationUser.user.display,
      picture: organizationUser.user.picture,
      pictureURL:
        organizationUser.user.picture &&
          JSON.parse(organizationUser.user.picture) &&
          JSON.parse(organizationUser.user.picture).filename
          ? gcsService.getUserProfileURL(
            organizationUser.userId,
            JSON.parse(organizationUser.user.picture).filename,
          )
          : '',
      gender: organizationUser.user.gender,
      mobile: organizationUser.user.mobile,
      address: organizationUser.user.address,
      createdAt: organizationUser.user.createdAt,
      team: organizationUser.team
        ? {
          id: organizationUser.team.id,
          name: organizationUser.team.name,
        }
        : null,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'directMessage', 'getContact', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const setPin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { message } = req.body
  // const receiveUser = req.params.receiveUser

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message.id) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const result = await teamChatDirectMessageModel.isPinMessage(message)
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
    const result = await teamChatDirectMessageModel.isDeleteMessage(message)

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
    const result = await teamChatDirectMessageModel.isEditMessage(message)

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
    const result = await teamChatDirectMessageModel.isReplyMessage(message)
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat_channel_message', 'sendReplyMessage')
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const getNavigationUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  const userList = await organizationUserModel.getUsers(organization.id)
  if (userList.length === 0) return res.status(201).send([])
  try {
    const directMessageUsers = await Promise.all(
      userList.map(async (user) => {
        const messageList = await teamChatDirectMessageModel.getDirectMessage(
          requester.id,
          user.userId,
          organization,
        )
        messageList.sort((a, b) => {
          return a.createdAt.getTime() - b.createdAt.getTime()
        })

        const lastMessageObj =
          messageList.length > 0 ? messageList[messageList.length - 1] : null

        let unread = 0
        const directReadLastest = await teamChatDmSettingModel.getDmLastest(
          requester.id,
          user.userId,
          organization.id,
        )
        if (!directReadLastest) {
          unread = await teamChatDmSettingModel.countDmMessageAfterDateTime(
            requester.createdAt,
            requester.id,
            user.userId,
            organization,
          )
        } else {
          unread = await teamChatDmSettingModel.countDmMessageAfterDateTime(
            directReadLastest.readAt,
            requester.id,
            user.userId,
            organization,
          )
        }

        return {
          id: lastMessageObj ? lastMessageObj.id : null,
          userId: user.userId,
          email: user.user.email,
          display: user.user.display,
          picture: user.user.picture,
          isOnline: user.user.isOnline,
          pictureURL:
            user.user.picture &&
              JSON.parse(user.user.picture) &&
              JSON.parse(user.user.picture).filename
              ? gcsService.getUserProfileURL(
                user.userId,
                JSON.parse(user.user.picture).filename,
              )
              : '',
          createdAt: lastMessageObj
            ? lastMessageObj.createdAt
            : user.user.createdAt,
          unread,
        }
      }),
    )

    const navUserList = directMessageUsers.filter((user) => {
      return user.userId !== requester.id
    })
    navUserList.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
    const limitedNavUserList = [...navUserList.slice(0, 24)]
    return res.status(201).send(limitedNavUserList)
  } catch (error) {
    errorMessage('CONTROLLER', 'directMessage', 'getDirectMessages', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getNavigationUsersforSocket = async (
  params:any
) => {
  const organizationId = params.oid
  const requesterId = params.uid
  const requester = await userModel.getUserWithId(params.uid)
  const userList = await organizationUserModel.getUsers(organizationId)

  const organization = await organizationModel.getOrganizationWithId(params.oid)


  // const organization: OrganizationEntity = req.body.organization
  // const requester: UserEntity = req.body.requester
  // const userList = await organizationUserModel.getUsers(organization.id)
  if (userList.length === 0) return []
  try {
    const directMessageUsers = await Promise.all(
      userList.map(async (user) => {
        const messageList = await teamChatDirectMessageModel.getDirectMessage(
          requesterId,
          user.userId,
          organizationId,
        )
        messageList.sort((a, b) => {
          return a.createdAt.getTime() - b.createdAt.getTime()
        })

        const lastMessageObj =
          messageList.length > 0 ? messageList[messageList.length - 1] : null

        let unread = 0
        const directReadLastest = await teamChatDmSettingModel.getDmLastest(
          requesterId,
          user.userId,
          organizationId,
        )
        if (!directReadLastest) {
          if(requester!=undefined){
            unread = await teamChatDmSettingModel.countDmMessageAfterDateTime(
              requester.createdAt,
              requesterId,
              user.userId,
              organizationId,
            )
          }
        } else {
          unread = await teamChatDmSettingModel.countDmMessageAfterDateTime(
            directReadLastest.readAt,
            requesterId,
            user.userId,
            organizationId
          )
        }

        return {
          id: lastMessageObj ? lastMessageObj.id : null,
          userId: user.userId,
          email: user.user.email,
          display: user.user.display,
          picture: user.user.picture,
          isOnline: user.user.isOnline,
          pictureURL:
            user.user.picture &&
              JSON.parse(user.user.picture) &&
              JSON.parse(user.user.picture).filename
              ? gcsService.getUserProfileURL(
                user.userId,
                JSON.parse(user.user.picture).filename,
              )
              : '',
          createdAt: lastMessageObj
            ? lastMessageObj.createdAt
            : user.user.createdAt,
          unread,
        }
      }),
    )

    const navUserList = directMessageUsers.filter((user) => {
      return user.userId !== requesterId
    })
    navUserList.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
    const limitedNavUserList = [...navUserList.slice(0, 24)]
    return limitedNavUserList
  } catch (error) {
    errorMessage('CONTROLLER', 'directMessage', 'getDirectMessages', error)
    return "error500"
  }
}
