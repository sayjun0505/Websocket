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
  teamChatChannelMemberModel,
  teamChatChannelMessageModel,
  teamChatDirectMessageModel,
  teamChatHQMessageModel,
  TeamChatThreadMemberEntity,
  teamChatThreadMemberModel,
  TeamChatThreadMessageEntity,
  teamChatThreadMessageModel,
} from '../../model/teamChat'
import { gcsService } from '../../service/google'
import { notificationUtil } from '../../util'
import {
  TEAMCHAT_THREAD_TYPE,
  TEAMCHAT_TR_MESSAGE_TYPE,
} from '../../model/teamChat/threadMessage.entity'
import { DR_MESSAGE_TYPE } from '../../model/teamChat/directMessage.entity'
import { sseController } from '../sse'
import { saveMentions } from '../../model/chat/mention.model'

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { message, threadId, threadType } = req.body

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (
    !message ||
    message.data == null ||
    !message.type ||
    message.id ||
    !threadType
  ) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    let teamChatThreadMessageResult: TeamChatThreadMessageEntity

    if (message.data !== '') {
      const countThreadMessage =
        await teamChatThreadMessageModel.getCountMessagesWithThreadId(
          threadId,
          organization.id,
        )

      const newMessage: TeamChatThreadMessageEntity = {
        ...message,
        threadId,
        threadType,
        createdBy: requester,
        organization,
      }

      teamChatThreadMessageResult =
        await teamChatThreadMessageModel.saveMessage(newMessage)

      sseController.sendEventToAllSubscriber(
        organization.id,
        JSON.parse(JSON.stringify({ threadId })),
      )

      // Thread Member management
      console.log('=====  Thread Member management =====', message.type)
      if (message.type === TEAMCHAT_TR_MESSAGE_TYPE.TEXT) {
        const currentThreadMemberIds = (
          await teamChatThreadMemberModel.getThreadMemberIds(
            threadId,
            organization.id,
          )
        ).map((_) => _.memberId)
        const textMessage = JSON.parse(message.data).text
        let threadMemberIds: string[] = []
        // get mention user in message
        if (textMessage.toLowerCase().indexOf('@[all](all)') >= 0) {
          if (threadType === TEAMCHAT_THREAD_TYPE.CHANNEL) {
            const channelMessageData =
              await teamChatChannelMessageModel.getChannelMessagesWithMessageId(
                message.threadId,
              )
            if (
              channelMessageData &&
              channelMessageData.id === message.threadId
            ) {
              threadMemberIds = (
                await teamChatChannelMemberModel.getChannelMembers(
                  channelMessageData.id,
                )
              ).map((_) => _.memberId)
            }
          } else if (threadType === TEAMCHAT_THREAD_TYPE.DIRECT) {
            const dmMessageData =
              await teamChatDirectMessageModel.getDirectMessageWithMessageId(
                message.threadId,
              )
            if (dmMessageData && dmMessageData.id === message.threadId) {
              threadMemberIds = [
                dmMessageData.sendUserId === requester.id
                  ? dmMessageData.receiveUserId
                  : dmMessageData.sendUserId,
              ]
            }
          } else if (threadType === TEAMCHAT_THREAD_TYPE.HQ) {
            threadMemberIds = (
              await organizationUserModel.getUsers(organization.id)
            ).map((_) => _.userId)
          }
        } else {
          const mentionEmailList = textMessage.match(
            /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
          )
          if (
            mentionEmailList &&
            mentionEmailList.length &&
            mentionEmailList.length > 0
          ) {
            const _users = await userModel.getUserWithEmailList(
              mentionEmailList,
            )
            threadMemberIds = _users.map((_) => _.id)
          }
        }

        console.log('Thread Member:', threadMemberIds)
        // Add Thread member
        const threadMembers: TeamChatThreadMemberEntity[] = threadMemberIds
          .filter((x) => !currentThreadMemberIds.includes(x))
          .map((_) => ({
            ...new TeamChatThreadMemberEntity(),
            threadId,
            threadType,
            memberId: _,
            isOwner: countThreadMessage === 0,
            threadMessageId: teamChatThreadMessageResult.id,
            organizationId: organization.id,
          }))
        await teamChatThreadMemberModel.saveThreadMembers(threadMembers)
      }

      if (countThreadMessage === 0) {
        console.log('---- New Thread ----', countThreadMessage)
        // Start New Thread
        await notificationUtil.teamchat.notificationNewThread(
          teamChatThreadMessageResult,
          requester.id,
          organization,
        )
      } else {
        console.log('---- New Thread message ----', countThreadMessage)
        // New Thread Message
        const threadMemberIds = (
          await teamChatThreadMemberModel.getThreadMemberIds(
            threadId,
            organization.id,
          )
        ).map((_) => _.memberId)
        await notificationUtil.teamchat.notificationThreadMessage(
          teamChatThreadMessageResult,
          threadMemberIds,
          requester.id,
          organization,
        )
      }
      return res.status(200).send(teamChatThreadMessageResult)
    }

    const content = req.file
    if (content) {
      try {
        const contentName =
          await gcsService.uploadTeamChatThreadMessageFromFileObject(
            organization.id,
            threadId,
            content.originalname,
            { data: content.buffer },
          )

        const url = await gcsService.getTeamChatThreadMessageContentURL(
          organization.id,
          threadId,
          contentName,
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

        const newFileMessage: TeamChatThreadMessageEntity = {
          ...message,
          threadId,
          createdBy: requester,
          organization,
        }

        teamChatThreadMessageResult =
          await teamChatThreadMessageModel.saveMessage(newFileMessage)
        teamChatThreadMessageResult = {
          ...teamChatThreadMessageResult,
          data: JSON.stringify({ url }),
        }

        sseController.sendEventToAllSubscriber(
          organization.id,
          JSON.parse(JSON.stringify({ threadId })),
        )
        return res.status(200).send(teamChatThreadMessageResult)
      } catch (error) {
        errorMessage('CONTROLLER', 'teamChat.message', 'uploadContent', error)
        return next(new HttpException(400, ErrorCode[400]))
      }
    }

    return res.status(200).send({})
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat.threadMessage', 'sendMessage')
    return next(new HttpException(400, ErrorCode[400]))
  }
}
export const uploadContent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const threadId = req.params.threadId
  const requester: UserEntity = req.body.requester

  const content = req.file
  if (!content) {
    errorMessage('CONTROLLER', 'message', 'invalid file')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const filename = Buffer.from(
      `${threadId}${new Date().getTime()}`,
      'binary',
    ).toString('base64')

    const contentName =
      await gcsService.uploadTeamChatThreadMessageFromFileObject(
        organization.id,
        threadId,
        content.originalname,
        { data: content.buffer },
      )

    const url = await gcsService.getTeamChatThreadMessageContentURL(
      organization.id,
      threadId,
      contentName,
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

export const getMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const threadId = req.params.threadId

    const result = await teamChatThreadMessageModel.getMessagesWithThreadId(
      threadId,
      organization,
    )
    if (!result) {
      errorMessage('CONTROLLER', 'teamchat_thread', 'threadMessage not found')
      return next(new HttpException(404, 'threadMessage not found'))
    }

    // Convert TeamChat message
    const convertTeamChatMessage = await Promise.all(
      result.map(async (message) => {
        if (
          message.type === TEAMCHAT_TR_MESSAGE_TYPE.IMAGE ||
          message.type === TEAMCHAT_TR_MESSAGE_TYPE.AUDIO ||
          message.type === TEAMCHAT_TR_MESSAGE_TYPE.FILE ||
          message.type === TEAMCHAT_TR_MESSAGE_TYPE.VIDEO
        ) {
          const url = await gcsService.getTeamChatThreadMessageContentURL(
            organization.id,
            threadId,
            JSON.parse(message.data).filename,
          )
          message.data = JSON.stringify({ url })
        }
        return {
          id: message.id,
          data: message.data,
          type: message.type,
          createdAt: message.createdAt,
          createdBy: {
            id: message.createdBy.id,
            display: message.createdBy.display,
            picture: message.createdBy.picture,
            pictureURL:
              message.createdBy.picture &&
              JSON.parse(message.createdBy.picture) &&
              JSON.parse(message.createdBy.picture).filename
                ? gcsService.getUserProfileURL(
                    message.createdBy.id,
                    JSON.parse(message.createdBy.picture).filename,
                  )
                : '',
          },
          threadId: message.threadId,
        }
      }),
    )

    if (convertTeamChatMessage && convertTeamChatMessage.length > 1) {
      // tslint:disable-next-line:only-arrow-functions
      convertTeamChatMessage.sort(function (obj1, obj2) {
        const a = obj1 as unknown as TeamChatThreadMessageEntity
        const b = obj2 as unknown as TeamChatThreadMessageEntity
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
    }

    return res.status(200).send(convertTeamChatMessage)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_thread', 'get_teamChat_thread', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getHqReplies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const getHqMessages =
      await teamChatHQMessageModel.getReplyHQMessagesWithOrganizationId(
        organization.id,
      )

    const getThreadMessages = await teamChatThreadMessageModel.getMessages(
      organization,
    )

    const hqMessages = getHqMessages.map((hqMsg) => {
      return {
        id: hqMsg.id,
      }
    })
    const convertThreadMessages = await Promise.all(
      getThreadMessages.map(async (tMsg) => {
        if (
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.IMAGE ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.AUDIO ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.FILE ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.VIDEO
        ) {
          const url = await gcsService.getTeamChatThreadMessageContentURL(
            organization.id,
            tMsg.threadId,
            JSON.parse(tMsg.data).filename,
          )
          tMsg.data = JSON.stringify({ url })
        }
        return {
          id: tMsg.id,
          data: tMsg.data,
          type: tMsg.type,
          createdAt: tMsg.createdAt,
          createdBy: {
            id: tMsg.createdBy.id,
            display: tMsg.createdBy.display,
            picture: tMsg.createdBy.picture,
            pictureURL:
              tMsg.createdBy.picture &&
              JSON.parse(tMsg.createdBy.picture) &&
              JSON.parse(tMsg.createdBy.picture).filename
                ? gcsService.getUserProfileURL(
                    tMsg.createdBy.id,
                    JSON.parse(tMsg.createdBy.picture).filename,
                  )
                : '',
          },
          threadId: tMsg.threadId,
        }
      }),
    )
    const hqThreadMessages: { [index: string]: any } = {}
    hqMessages.map((item1) => {
      hqThreadMessages[item1.id] = convertThreadMessages.filter(
        (item2) => item2.threadId === item1.id,
      )
    })
    return res.status(200).send(hqThreadMessages)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_thread', 'getThreads', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getCmReplies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const getChannelMessages =
      await teamChatChannelMessageModel.getReplyChannelMessagesWithOrganization(
        organization,
      )

    const getThreadMessages = await teamChatThreadMessageModel.getMessages(
      organization,
    )

    const cmMessages = getChannelMessages.map((cmMsg) => {
      return {
        id: cmMsg.id,
      }
    })

    const convertThreadMessages = await Promise.all(
      getThreadMessages.map(async (tMsg) => {
        if (
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.IMAGE ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.AUDIO ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.FILE ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.VIDEO
        ) {
          const url = await gcsService.getTeamChatThreadMessageContentURL(
            organization.id,
            tMsg.threadId,
            JSON.parse(tMsg.data).filename,
          )
          tMsg.data = JSON.stringify({ url })
        }
        return {
          id: tMsg.id,
          data: tMsg.data,
          type: tMsg.type,
          createdAt: tMsg.createdAt,
          createdBy: {
            id: tMsg.createdBy.id,
            display: tMsg.createdBy.display,
            picture: tMsg.createdBy.picture,
            pictureURL:
              tMsg.createdBy.picture &&
              JSON.parse(tMsg.createdBy.picture) &&
              JSON.parse(tMsg.createdBy.picture).filename
                ? gcsService.getUserProfileURL(
                    tMsg.createdBy.id,
                    JSON.parse(tMsg.createdBy.picture).filename,
                  )
                : '',
          },
          threadId: tMsg.threadId,
        }
      }),
    )

    const cmThreadMessages: { [index: string]: any } = {}
    cmMessages.map((item1) => {
      cmThreadMessages[item1.id] = convertThreadMessages.filter(
        (item2) => item2.threadId === item1.id,
      )
    })
    return res.status(200).send(cmThreadMessages)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_thread', 'getThreads', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getDmReplies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const getDmMessages =
      await teamChatDirectMessageModel.getReplyDirectMessagesWithOrganizationId(
        organization,
      )

    const getThreadMessages = await teamChatThreadMessageModel.getMessages(
      organization,
    )

    const dmMessages = getDmMessages.map((dmMsg) => {
      return {
        id: dmMsg.id,
      }
    })

    const convertThreadMessages = await Promise.all(
      getThreadMessages.map(async (tMsg) => {
        if (
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.IMAGE ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.AUDIO ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.FILE ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.VIDEO
        ) {
          const url = await gcsService.getTeamChatThreadMessageContentURL(
            organization.id,
            tMsg.threadId,
            JSON.parse(tMsg.data).filename,
          )
          tMsg.data = JSON.stringify({ url })
        }
        return {
          id: tMsg.id,
          data: tMsg.data,
          type: tMsg.type,
          createdAt: tMsg.createdAt,
          createdBy: {
            id: tMsg.createdBy.id,
            display: tMsg.createdBy.display,
            picture: tMsg.createdBy.picture,
            pictureURL:
              tMsg.createdBy.picture &&
              JSON.parse(tMsg.createdBy.picture) &&
              JSON.parse(tMsg.createdBy.picture).filename
                ? gcsService.getUserProfileURL(
                    tMsg.createdBy.id,
                    JSON.parse(tMsg.createdBy.picture).filename,
                  )
                : '',
          },
          threadId: tMsg.threadId,
        }
      }),
    )

    const dmThreadMessages: { [index: string]: any } = {}
    dmMessages.map((item1) => {
      dmThreadMessages[item1.id] = convertThreadMessages.filter(
        (item2) => item2.threadId === item1.id,
      )
    })
    return res.status(200).send(dmThreadMessages)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_thread', 'getThreads', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getThreads = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const { threadIds } = req.body

    const threadMessages =
      await teamChatThreadMessageModel.getMessagesWithThreadIds(
        threadIds,
        organization,
      )
    if (!threadMessages) {
      errorMessage('CONTROLLER', 'teamchat_thread', 'threadMessage not found')
      return next(new HttpException(404, 'threadMessage not found'))
    }
    const filterTM = threadMessages.map((message) => {
      return {
        threadId: message.threadId,
        createdBy: {
          id: message.createdBy.id,
          display: message.createdBy.display,
          picture: message.createdBy.picture,
          pictureURL:
            message.createdBy.picture &&
            JSON.parse(message.createdBy.picture) &&
            JSON.parse(message.createdBy.picture).filename
              ? gcsService.getUserProfileURL(
                  message.createdBy.id,
                  JSON.parse(message.createdBy.picture).filename,
                )
              : '',
        },
      }
    })
    const threadIdMessages: { [index: string]: any } = {}
    threadIds.map((item1: string) => {
      threadIdMessages[item1] = filterTM.filter(
        (item2) => item2.threadId === item1,
      )
      threadIdMessages[item1] = threadIdMessages[item1].filter(
        (item: { createdBy: any }, index: any) =>
          index ===
          threadIdMessages[item1].findIndex(
            (other: { createdBy: any }) =>
              item.createdBy.id === other.createdBy.id,
          ),
      )
    })
    return res.status(200).send(threadIdMessages)
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_thread', 'get_teamChat_thread', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const sendMessageforsocket = async (
  params:any
) => {
  let { message, threadId, threadType } = params

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (
    !message ||
    message.data == null ||
    !message.type ||
    message.id ||
    !threadType
  ) {
    errorMessage('CONTROLLER', 'teamChat', 'invalid data(message)')
    return "error400"
  }

  const organization: OrganizationEntity = params.organization
  const requester: UserEntity = params.requester

  try {
    let teamChatThreadMessageResult: TeamChatThreadMessageEntity

    if (message.data !== '') {
      const countThreadMessage =
        await teamChatThreadMessageModel.getCountMessagesWithThreadId(
          threadId,
          organization.id,
        )

      const newMessage: TeamChatThreadMessageEntity = {
        ...message,
        threadId,
        threadType,
        createdBy: requester,
        organization,
      }

      teamChatThreadMessageResult =
        await teamChatThreadMessageModel.saveMessage(newMessage)

      sseController.sendEventToAllSubscriber(
        organization.id,
        JSON.parse(JSON.stringify({ threadId })),
      )

      // Thread Member management
      console.log('=====  Thread Member management =====', message.type)
      if (message.type === TEAMCHAT_TR_MESSAGE_TYPE.TEXT) {
        const currentThreadMemberIds = (
          await teamChatThreadMemberModel.getThreadMemberIds(
            threadId,
            organization.id,
          )
        ).map((_) => _.memberId)
        const textMessage = JSON.parse(message.data).text
        let threadMemberIds: string[] = []
        // get mention user in message
        if (textMessage.toLowerCase().indexOf('@[all](all)') >= 0) {
          if (threadType === TEAMCHAT_THREAD_TYPE.CHANNEL) {
            const channelMessageData =
              await teamChatChannelMessageModel.getChannelMessagesWithMessageId(
                message.threadId,
              )
            if (
              channelMessageData &&
              channelMessageData.id === message.threadId
            ) {
              threadMemberIds = (
                await teamChatChannelMemberModel.getChannelMembers(
                  channelMessageData.id,
                )
              ).map((_) => _.memberId)
            }
          } else if (threadType === TEAMCHAT_THREAD_TYPE.DIRECT) {
            const dmMessageData =
              await teamChatDirectMessageModel.getDirectMessageWithMessageId(
                message.threadId,
              )
            if (dmMessageData && dmMessageData.id === message.threadId) {
              threadMemberIds = [
                dmMessageData.sendUserId === requester.id
                  ? dmMessageData.receiveUserId
                  : dmMessageData.sendUserId,
              ]
            }
          } else if (threadType === TEAMCHAT_THREAD_TYPE.HQ) {
            threadMemberIds = (
              await organizationUserModel.getUsers(organization.id)
            ).map((_) => _.userId)
          }
        } else {
          const mentionEmailList = textMessage.match(
            /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
          )
          if (
            mentionEmailList &&
            mentionEmailList.length &&
            mentionEmailList.length > 0
          ) {
            const _users = await userModel.getUserWithEmailList(
              mentionEmailList,
            )
            threadMemberIds = _users.map((_) => _.id)
          }
        }

        console.log('Thread Member:', threadMemberIds)
        // Add Thread member
        const threadMembers: TeamChatThreadMemberEntity[] = threadMemberIds
          .filter((x) => !currentThreadMemberIds.includes(x))
          .map((_) => ({
            ...new TeamChatThreadMemberEntity(),
            threadId,
            threadType,
            memberId: _,
            isOwner: countThreadMessage === 0,
            threadMessageId: teamChatThreadMessageResult.id,
            organizationId: organization.id,
          }))
        await teamChatThreadMemberModel.saveThreadMembers(threadMembers)
      }

      if (countThreadMessage === 0) {
        console.log('---- New Thread ----', countThreadMessage)
        // Start New Thread
        await notificationUtil.teamchat.notificationNewThread(
          teamChatThreadMessageResult,
          requester.id,
          organization,
        )
      } else {
        console.log('---- New Thread message ----', countThreadMessage)
        // New Thread Message
        const threadMemberIds = (
          await teamChatThreadMemberModel.getThreadMemberIds(
            threadId,
            organization.id,
          )
        ).map((_) => _.memberId)
        await notificationUtil.teamchat.notificationThreadMessage(
          teamChatThreadMessageResult,
          threadMemberIds,
          requester.id,
          organization,
        )
      }
      return teamChatThreadMessageResult
    }

    const content = params.file
    if (content) {
      try {
        const contentName =
          await gcsService.uploadTeamChatThreadMessageFromFileObject(
            organization.id,
            threadId,
            content.originalname,
            { data: content.buffer },
          )

        const url = await gcsService.getTeamChatThreadMessageContentURL(
          organization.id,
          threadId,
          contentName,
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

        const newFileMessage: TeamChatThreadMessageEntity = {
          ...message,
          threadId,
          createdBy: requester,
          organization,
        }

        teamChatThreadMessageResult =
          await teamChatThreadMessageModel.saveMessage(newFileMessage)
        teamChatThreadMessageResult = {
          ...teamChatThreadMessageResult,
          data: JSON.stringify({ url }),
        }

        sseController.sendEventToAllSubscriber(
          organization.id,
          JSON.parse(JSON.stringify({ threadId })),
        )
        return teamChatThreadMessageResult
      } catch (error) {
        errorMessage('CONTROLLER', 'teamChat.message', 'uploadContent', error)
        return "error400"
      }
    }

    return {}
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat.threadMessage', 'sendMessage')
    return "errorr400"
  }
}
export const uploadContentforSocket = async (
  params:any
) => {
  const organization: OrganizationEntity = params.organization
  const threadId = params.threadId
  const requester: UserEntity = params.requester

  const content = params.file
  if (!content) {
    errorMessage('CONTROLLER', 'message', 'invalid file')
    return "error400"
  }

  try {
    const filename = Buffer.from(
      `${threadId}${new Date().getTime()}`,
      'binary',
    ).toString('base64')

    const contentName =
      await gcsService.uploadTeamChatThreadMessageFromFileObject(
        organization.id,
        threadId,
        content.originalname,
        { data: content.buffer },
      )

    const url = await gcsService.getTeamChatThreadMessageContentURL(
      organization.id,
      threadId,
      contentName,
    )
    return ({
      message: 'Upload was successful',
      fileName: contentName,
      url,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'teamChat.message', 'uploadContent', error)
    return "error400"
  }
}

export const getMessageforSocket = async (
  params:any
) => {
  try {
    const organization: OrganizationEntity = params.organization
    const threadId = params.threadId

    const result = await teamChatThreadMessageModel.getMessagesWithThreadId(
      threadId,
      organization,
    )
    if (!result) {
      errorMessage('CONTROLLER', 'teamchat_thread', 'threadMessage not found')
      return "error404"
    }

    // Convert TeamChat message
    const convertTeamChatMessage = await Promise.all(
      result.map(async (message) => {
        if (
          message.type === TEAMCHAT_TR_MESSAGE_TYPE.IMAGE ||
          message.type === TEAMCHAT_TR_MESSAGE_TYPE.AUDIO ||
          message.type === TEAMCHAT_TR_MESSAGE_TYPE.FILE ||
          message.type === TEAMCHAT_TR_MESSAGE_TYPE.VIDEO
        ) {
          const url = await gcsService.getTeamChatThreadMessageContentURL(
            organization.id,
            threadId,
            JSON.parse(message.data).filename,
          )
          message.data = JSON.stringify({ url })
        }
        return {
          id: message.id,
          data: message.data,
          type: message.type,
          createdAt: message.createdAt,
          createdBy: {
            id: message.createdBy.id,
            display: message.createdBy.display,
            picture: message.createdBy.picture,
            pictureURL:
              message.createdBy.picture &&
              JSON.parse(message.createdBy.picture) &&
              JSON.parse(message.createdBy.picture).filename
                ? gcsService.getUserProfileURL(
                    message.createdBy.id,
                    JSON.parse(message.createdBy.picture).filename,
                  )
                : '',
          },
          threadId: message.threadId,
        }
      }),
    )

    if (convertTeamChatMessage && convertTeamChatMessage.length > 1) {
      // tslint:disable-next-line:only-arrow-functions
      convertTeamChatMessage.sort(function (obj1, obj2) {
        const a = obj1 as unknown as TeamChatThreadMessageEntity
        const b = obj2 as unknown as TeamChatThreadMessageEntity
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
    }

    return convertTeamChatMessage
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_thread', 'get_teamChat_thread', error)
    return "error500"
  }
}

export const getHqRepliesforSocket = async (
  parms:any
) => {
  try {
    const organization: OrganizationEntity = parms.organization

    const getHqMessages =
      await teamChatHQMessageModel.getReplyHQMessagesWithOrganizationId(
        organization.id,
      )

    const getThreadMessages = await teamChatThreadMessageModel.getMessages(
      organization,
    )

    const hqMessages = getHqMessages.map((hqMsg) => {
      return {
        id: hqMsg.id,
      }
    })
    const convertThreadMessages = await Promise.all(
      getThreadMessages.map(async (tMsg) => {
        if (
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.IMAGE ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.AUDIO ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.FILE ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.VIDEO
        ) {
          const url = await gcsService.getTeamChatThreadMessageContentURL(
            organization.id,
            tMsg.threadId,
            JSON.parse(tMsg.data).filename,
          )
          tMsg.data = JSON.stringify({ url })
        }
        return {
          id: tMsg.id,
          data: tMsg.data,
          type: tMsg.type,
          createdAt: tMsg.createdAt,
          createdBy: {
            id: tMsg.createdBy.id,
            display: tMsg.createdBy.display,
            picture: tMsg.createdBy.picture,
            pictureURL:
              tMsg.createdBy.picture &&
              JSON.parse(tMsg.createdBy.picture) &&
              JSON.parse(tMsg.createdBy.picture).filename
                ? gcsService.getUserProfileURL(
                    tMsg.createdBy.id,
                    JSON.parse(tMsg.createdBy.picture).filename,
                  )
                : '',
          },
          threadId: tMsg.threadId,
        }
      }),
    )
    const hqThreadMessages: { [index: string]: any } = {}
    hqMessages.map((item1) => {
      hqThreadMessages[item1.id] = convertThreadMessages.filter(
        (item2) => item2.threadId === item1.id,
      )
    })
    return hqThreadMessages
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_thread', 'getThreads', error)
    return "error500"
  }
}

export const getCmRepliesforSocket = async (
  params:any
) => {
  try {
    const organization: OrganizationEntity = params.organization

    const getChannelMessages =
      await teamChatChannelMessageModel.getReplyChannelMessagesWithOrganization(
        organization,
      )

    const getThreadMessages = await teamChatThreadMessageModel.getMessages(
      organization,
    )

    const cmMessages = getChannelMessages.map((cmMsg) => {
      return {
        id: cmMsg.id,
      }
    })

    const convertThreadMessages = await Promise.all(
      getThreadMessages.map(async (tMsg) => {
        if (
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.IMAGE ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.AUDIO ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.FILE ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.VIDEO
        ) {
          const url = await gcsService.getTeamChatThreadMessageContentURL(
            organization.id,
            tMsg.threadId,
            JSON.parse(tMsg.data).filename,
          )
          tMsg.data = JSON.stringify({ url })
        }
        return {
          id: tMsg.id,
          data: tMsg.data,
          type: tMsg.type,
          createdAt: tMsg.createdAt,
          createdBy: {
            id: tMsg.createdBy.id,
            display: tMsg.createdBy.display,
            picture: tMsg.createdBy.picture,
            pictureURL:
              tMsg.createdBy.picture &&
              JSON.parse(tMsg.createdBy.picture) &&
              JSON.parse(tMsg.createdBy.picture).filename
                ? gcsService.getUserProfileURL(
                    tMsg.createdBy.id,
                    JSON.parse(tMsg.createdBy.picture).filename,
                  )
                : '',
          },
          threadId: tMsg.threadId,
        }
      }),
    )

    const cmThreadMessages: { [index: string]: any } = {}
    cmMessages.map((item1) => {
      cmThreadMessages[item1.id] = convertThreadMessages.filter(
        (item2) => item2.threadId === item1.id,
      )
    })
    return cmThreadMessages
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_thread', 'getThreads', error)
    return "error500"
  }
}

export const getDmRepliesforSocket = async (
  params:any
) => {
  try {
    const organization: OrganizationEntity = params.organization

    const getDmMessages =
      await teamChatDirectMessageModel.getReplyDirectMessagesWithOrganizationId(
        organization,
      )

    const getThreadMessages = await teamChatThreadMessageModel.getMessages(
      organization,
    )

    const dmMessages = getDmMessages.map((dmMsg) => {
      return {
        id: dmMsg.id,
      }
    })

    const convertThreadMessages = await Promise.all(
      getThreadMessages.map(async (tMsg) => {
        if (
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.IMAGE ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.AUDIO ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.FILE ||
          tMsg.type === TEAMCHAT_TR_MESSAGE_TYPE.VIDEO
        ) {
          const url = await gcsService.getTeamChatThreadMessageContentURL(
            organization.id,
            tMsg.threadId,
            JSON.parse(tMsg.data).filename,
          )
          tMsg.data = JSON.stringify({ url })
        }
        return {
          id: tMsg.id,
          data: tMsg.data,
          type: tMsg.type,
          createdAt: tMsg.createdAt,
          createdBy: {
            id: tMsg.createdBy.id,
            display: tMsg.createdBy.display,
            picture: tMsg.createdBy.picture,
            pictureURL:
              tMsg.createdBy.picture &&
              JSON.parse(tMsg.createdBy.picture) &&
              JSON.parse(tMsg.createdBy.picture).filename
                ? gcsService.getUserProfileURL(
                    tMsg.createdBy.id,
                    JSON.parse(tMsg.createdBy.picture).filename,
                  )
                : '',
          },
          threadId: tMsg.threadId,
        }
      }),
    )

    const dmThreadMessages: { [index: string]: any } = {}
    dmMessages.map((item1) => {
      dmThreadMessages[item1.id] = convertThreadMessages.filter(
        (item2) => item2.threadId === item1.id,
      )
    })
    return dmThreadMessages
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_thread', 'getThreads', error)
    return "error500"
  }
}

export const getThreadsforSocket = async (
  params:any
) => {
  try {
    const organization: OrganizationEntity = params.organization
    const { threadIds } = params

    const threadMessages =
      await teamChatThreadMessageModel.getMessagesWithThreadIds(
        threadIds,
        organization,
      )
    if (!threadMessages) {
      errorMessage('CONTROLLER', 'teamchat_thread', 'threadMessage not found')
      return 'threadMessage not found'
    }
    const filterTM = threadMessages.map((message) => {
      return {
        threadId: message.threadId,
        createdBy: {
          id: message.createdBy.id,
          display: message.createdBy.display,
          picture: message.createdBy.picture,
          pictureURL:
            message.createdBy.picture &&
            JSON.parse(message.createdBy.picture) &&
            JSON.parse(message.createdBy.picture).filename
              ? gcsService.getUserProfileURL(
                  message.createdBy.id,
                  JSON.parse(message.createdBy.picture).filename,
                )
              : '',
        },
      }
    })
    const threadIdMessages: { [index: string]: any } = {}
    threadIds.map((item1: string) => {
      threadIdMessages[item1] = filterTM.filter(
        (item2) => item2.threadId === item1,
      )
      threadIdMessages[item1] = threadIdMessages[item1].filter(
        (item: { createdBy: any }, index: any) =>
          index ===
          threadIdMessages[item1].findIndex(
            (other: { createdBy: any }) =>
              item.createdBy.id === other.createdBy.id,
          ),
      )
    })
    return threadIdMessages
  } catch (error) {
    errorMessage('CONTROLLER', 'teamchat_thread', 'get_teamChat_thread', error)
    return "error500"
  }
}
