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
import {
  ChatCommentEntity,
  chatModel,
  commentModel,
  mentionModel,
} from '../../model/chat'
import { customerModel } from '../../model/customer'
import { channelModel } from '../../model/channel'
import { gcsService } from '../../service/google'
import { notificationUtil } from '../../util'
import { CHAT_COMMENT_TYPE } from '../../model/chat/comment.entity'
import { sseController } from '../sse'
// import { sseController } from '../sse'
import { MentionEntity } from '../../model/chat/mention.entity'
import { saveMentions } from '../../model/chat/mention.model'

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { message } = req.body

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message || !message.chatId) {
    errorMessage('CONTROLLER', 'comment', 'invalid parameter(chatId)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  if (!message || message.data == null || !message.type || message.id) {
    errorMessage('CONTROLLER', 'comment', 'invalid data(message)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const chatId = message.chatId

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    let commentResponese;
    if (message.data !== '') {
      // Add new message to database
      const newMessage: ChatCommentEntity = {
        ...message,
        createdBy: requester,
        organization,
      }
      const commentMessageResult = await commentModel.saveComment(newMessage)

      // notificationUtil.notificationNewEvent(organization)
      sseController.sendEventToAllSubscriber(
        organization.id,
        JSON.parse(JSON.stringify({ event: 'newEvent' })),
      )

      // get mention user in message
      if (message.type === CHAT_COMMENT_TYPE.TEXT) {
        const textMessage = JSON.parse(message.data).text

        if (textMessage.toLowerCase().indexOf('@[all](all)') >= 0) {
          // All mention
          const _users = await organizationUserModel.getUsers(organization.id)
          const userIds = _users.map((_) => _.userId)
          if (userIds && userIds.length > 0) {
            const mentions = await userIds.map((userId) => {
              return {
                ...new MentionEntity(),
                userId,
                chatId: message.chatId,
                comment: commentMessageResult,
                createdBy: requester,
                organization,
              } as MentionEntity
            })
            // Save mention to database
            mentionModel.saveMentions(mentions)

            notificationUtil.chat.notificationCommentMention(
              userIds,
              message,
              organization,
            )
          }
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
            const _users = await userModel.getUserWithEmailList(mentionEmailList)
            const userIds = _users.map((_) => _.id)

            if (userIds && userIds.length > 0) {
              const mentions = await userIds.map((userId) => {
                return {
                  ...new MentionEntity(),
                  userId,
                  chatId: message.chatId,
                  comment: commentMessageResult,
                  createdBy: requester,
                  organization,
                } as MentionEntity
              })
              // Save mention to database
              mentionModel.saveMentions(mentions)

              notificationUtil.chat.notificationCommentMention(
                userIds,
                message,
                organization,
              )
            }
          }
        }
      }

      const _comment = await commentModel.getCommentWithId(
        commentMessageResult.id,
      )
      if (!_comment) {
        errorMessage('CONTROLLER', 'comment', 'Comment not found')
        return next(new HttpException(500, ErrorCode[500]))
      }
      commentResponese = {
        ..._comment,
        createdBy: {
          id: _comment.createdBy.id,
          display: _comment.createdBy.display,
          pictureURL: _comment.createdBy.picture,
        },
      }
    }

    const content = req.file
    if (content) {
      try {
        const filename = Buffer.from(
          `${chatId}${new Date().getTime()}`,
          'binary',
        ).toString('base64')

        const contentName = await gcsService.uploadCommentMessageFromFileObject(
          organization.id,
          chatId,
          filename,
          { data: content.buffer },
        )

        const url = await gcsService.getCommentMessageContentURL(
          organization.id,
          chatId,
          filename,
        )

        const type = CHAT_COMMENT_TYPE.IMAGE

        message = {
          data: JSON.stringify({ filename: contentName }),
          type,
          chatId,
        }
        const newFileMessage: ChatCommentEntity = {
          ...message,
          createdBy: requester,
          organization,
        }

        const commentMessageResult = await commentModel.saveComment(newFileMessage)

        // notificationUtil.notificationNewEvent(organization)
        sseController.sendEventToAllSubscriber(
          organization.id,
          JSON.parse(JSON.stringify({ event: 'newEvent' })),
        )

        const _comment = await commentModel.getCommentWithId(
          commentMessageResult.id,
        )

        if (!_comment) {
          errorMessage('CONTROLLER', 'comment', 'Comment not found')
          return next(new HttpException(500, ErrorCode[500]))
        }
        commentResponese = {
          ..._comment,
          createdBy: {
            id: _comment.createdBy.id,
            display: _comment.createdBy.display,
            pictureURL: _comment.createdBy.picture,
          },
          data: JSON.stringify({ url }),
        }
      } catch (error) {
        errorMessage('CONTROLLER', 'comment.message', 'uploadContent', error)
        return next(new HttpException(400, ErrorCode[400]))
      }
    }
    return res.json(commentResponese)

    // return res.status(200).send(commentMessageResult)
  } catch (error) {
    errorMessage('CONTROLLER', 'comment.message', 'sendMessage', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const uploadContent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { chatId } = req.params
  if (!chatId) {
    errorMessage('CONTROLLER', 'message', 'invalid parameter(chatId)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const organization: OrganizationEntity = req.body.organization

  const content = req.file
  if (!content) {
    errorMessage('CONTROLLER', 'message', 'invalid file')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const chat = await chatModel.getChatWithId(chatId, organization)
    if (!chat) {
      errorMessage('CONTROLLER', 'comment', 'chat not found')
      return next(new HttpException(404, 'chat not found'))
    }

    const filename = Buffer.from(
      `${chat.id}${new Date().getTime()}`,
      'binary',
    ).toString('base64')

    const contentName = await gcsService.uploadCommentMessageFromFileObject(
      organization.id,
      chat,
      filename,
      { data: content.buffer },
    )

    const url = await gcsService.getCommentMessageContentURL(
      organization.id,
      chat,
      filename,
    )
    return res.status(200).json({
      message: 'Upload was successful',
      fileName: contentName,
      url,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'comment.message', 'uploadContent', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const pinMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { comment } = req.body
  if (typeof comment === 'string') {
    comment = JSON.parse(comment)
  }
  if (!comment.id || !comment) {
    errorMessage('CONTROLLER', 'comment', 'invalid parameter(commentId)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const requester: UserEntity = req.body.requester
  const organization: OrganizationEntity = req.body.organization

  try {
    const _result: ChatCommentEntity = {
      ...comment,
      organization,
      updatedBy: requester,
    }

    const saveResult = await commentModel.saveComment(_result)
    return res.json({
      id: saveResult.id,
      isPin: saveResult.isPin,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'comment', 'markPinned', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const markReaMentions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    const mentionResult = await mentionModel.getMentionsWithUserId(
      requester.id,
      organization,
    )

    const newMention: MentionEntity[] = await mentionResult.map((item) => {
      item.isRead = true
      item.updatedBy = requester
      return item
    })
    return res.status(201).send(await mentionModel.saveMentions(newMention))
  } catch (error) {
    errorMessage('CONTROLLER', 'mention', 'markReaMentions', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const result = await organizationUserModel.getUsers(organization.id)
    if (!result) {
      errorMessage('CONTROLLER', 'user', 'get users')
      return next(new HttpException(500, ErrorCode[500]))
    }

    const convertUser = await Promise.all(
      result.map((orgUserElement) => ({
        id: orgUserElement.userId,
        email: orgUserElement.user.email,
        name:
          orgUserElement.user.firstname && orgUserElement.user.lastname
            ? `${orgUserElement.user.firstname} ${orgUserElement.user.lastname}`
            : '',
        display: orgUserElement.user.display,
        picture: orgUserElement.user.picture,
      })),
    )
    return res.status(200).send(convertUser)
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'getUsers', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getUsersforSocket = async (
  user:any
) => {
  try {
    const organization: OrganizationEntity = user.organization

    const result = await organizationUserModel.getUsers(organization.id)
    if (!result) {
      errorMessage('CONTROLLER', 'user', 'get users')
      return "error500"
    }

    const convertUser = await Promise.all(
      result.map((orgUserElement) => ({
        id: orgUserElement.userId,
        email: orgUserElement.user.email,
        name:
          orgUserElement.user.firstname && orgUserElement.user.lastname
            ? `${orgUserElement.user.firstname} ${orgUserElement.user.lastname}`
            : '',
        display: orgUserElement.user.display,
        picture: orgUserElement.user.picture,
      })),
    )
    return convertUser;
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'getUsers', error)
    return "error500"
  }
}

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    const { chatId } = req.params
    const { page, size } = req.query
    if (!chatId || typeof chatId !== 'string' || !page || !size) {
      errorMessage('CONTROLLER', 'message', 'invalid parameter(chatId)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const chat = await chatModel.getChatWithId(chatId, organization)
    if (!chat) {
      errorMessage('CONTROLLER', 'message', 'Chat not found')
      return next(new HttpException(404, ErrorCode[404]))
    }

    const pageNumber = Number(page)
    const pageSize = Number(size)

    const [_result, _total] = await commentModel.getComments(
      chatId,
      organization.id,
      pageNumber,
      pageSize,
    )

    // Mark Mention true
    mentionModel.markReadMentions(requester.id, chatId)

    // Convert message data
    const convertCommentMessage = await _result.map((message) => {
      if (message.type === CHAT_COMMENT_TYPE.IMAGE) {
        if (!JSON.parse(message.data).url) {
          const url = gcsService.getCommentMessageContentURL(
            organization.id,
            chat,
            JSON.parse(message.data).filename,
          )
          return { ...message, data: JSON.stringify({ url }) }
        } else {
          return message
        }
      } else {
        return message
      }
    })

    return res.json({
      currentPage: pageNumber || null,
      pages: Math.ceil(_total / pageSize),
      currentCount: _result.length,
      totalCount: _total,
      data: convertCommentMessage.map((_) => ({
        ..._,
        createdBy: {
          id: _.createdBy.id,
          display: _.createdBy.display,
          pictureURL: _.createdBy.picture,
        },
      })),
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getChat', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
