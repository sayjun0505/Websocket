import { NextFunction, Request, Response } from 'express'
import { gcsService } from '../../service/google'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity, organizationModel } from '../../model/organization'

import {
  ScrumboardCardModel,
  ScrumboardListChatModel,
} from '../../model/scrumboard'
import {
  ChatCommentEntity,
  chatModel,
  CHAT_COMMENT_TYPE,
  messageModel,
  MESSAGE_TYPE,
} from '../../model/chat'
import { lineService } from '../../service/channel'

export const getChats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  const { boardId } = req.params
  if (!boardId) {
    errorMessage('CONTROLLER', 'create cards', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const rawListChats = await ScrumboardListChatModel.getListChats(boardId)

  const chats = await Promise.all(
    rawListChats.map(async (listChat, index) => {
      return await getChatData(listChat.chatId, requester, organization)
    }),
  )
  return res.status(201).send(chats)
}

// Get Chat Information for show on Card
const getChatData = async (
  chatId: string,
  requester: UserEntity,
  organization: OrganizationEntity,
) => {
  const chat = await ScrumboardCardModel.getChat(chatId, organization)
  if (!chat) return null

  chat.message.sort((a, b) => {
    return a.createdAt.getTime() - b.createdAt.getTime()
  })

  const lastMessage =
    chat.message && chat.message.length > 0
      ? chat.message[chat.message.length - 1]
      : null
  const unread = chat.message.filter((msg) => !msg.isRead).length

  const newMention =
    chat.mention.filter(
      (mention) => !mention.isRead && mention.user.id === requester.id,
    ).length > 0

  const pictureURL =
    chat.customer && chat.customer.picture
      ? gcsService.getCustomerDisplayURL(
        organization.id,
        chat.channel.id,
        chat.customer.uid,
        chat.customer.picture,
      )
      : null

  return {
    // ...card.chat,
    id: chat.id,
    status: chat.status,
    description: chat.description,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    channel: chat.channel,
    customer: {
      // ...card.chat.customer,
      id: chat.customer.id,
      firstname: chat.customer.firstname,
      lastname: chat.customer.lastname,
      display: chat.customer.display,
      pictureURL,
      customerLabel: chat.customer.customerLabel,
    },
    newMention,
    lastMessage: lastMessage
      ? {
        id: lastMessage.id,
        data: lastMessage.data,
        type: lastMessage.type,
        createdAt: lastMessage.createdAt,
        updatedAt: lastMessage.updatedAt,
      }
      : {},
    unread: unread > 0 ? unread : null,
  }
}

export const getChat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { chatId: id } = req.params
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'chat', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await chatModel.getChatWithIdForScrumboard(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'chat', 'chat not found')
      return next(new HttpException(404, 'chat not found'))
    }

    messageModel.markReadMessageList(result.message)

    // Convert message
    const convertMessage = await result.message.map((message) => {
      if (message.type === MESSAGE_TYPE.TEXT) {
        return message
      }

      if (message.type === MESSAGE_TYPE.STICKER) {
        if (!JSON.parse(message.data).url) {
          const url = lineService.getStickerUrl(
            JSON.parse(message.data).sticker,
          )
          // message.data =  JSON.stringify({stickerURL})
          return { ...message, data: JSON.stringify({ url }) }
        } else {
          return { ...message }
        }
      }

      if (
        message.type === MESSAGE_TYPE.IMAGE ||
        message.type === MESSAGE_TYPE.AUDIO ||
        message.type === MESSAGE_TYPE.FILE ||
        message.type === MESSAGE_TYPE.VIDEO
      ) {
        if (!JSON.parse(message.data).url) {
          const url = gcsService.getChatMessageContentURL(
            organization.id,
            result.channel,
            result.customer.id,
            JSON.parse(message.data).filename,
          )
          // message.data =  JSON.stringify({url})
          return { ...message, data: JSON.stringify({ url }) }
        } else {
          return { ...message }
        }
      }
      if (
        message.type === MESSAGE_TYPE.BUTTONS ||
        message.type === MESSAGE_TYPE.CONFIRM ||
        message.type === MESSAGE_TYPE.CAROUSEL ||
        message.type === MESSAGE_TYPE.FLEX
      ) {
        return { ...message }
      }
    })

    if (convertMessage && convertMessage.length > 1) {
      convertMessage.sort((a, b) => {
        return a && b ? a.createdAt.getTime() - b.createdAt.getTime() : 0
      })
    }
    const convertMessage2 = convertMessage.map((message) => {
      return {
        data: message?.data,
        type: message?.type,
        timestamp: message?.timestamp,
        isError: message?.isError,
        isRead: message?.isRead,
        direction: message?.direction,
        createdAt: message?.createdAt,
        createdBy:
          message && message.createdBy
            ? {
              firstname: message.createdBy.firstname,
              lastname: message.createdBy.lastname,
            }
            : null,
      }
    })
    // Convert Comment message
    const convertCommentMessage = await result.comment.map((message) => {
      if (message.type === CHAT_COMMENT_TYPE.TEXT) {
        return message
      }
      if (message.type === CHAT_COMMENT_TYPE.IMAGE) {
        const url = gcsService.getCommentMessageContentURL(
          organization.id,
          result,
          JSON.parse(message.data).filename,
        )
        return { ...message, data: JSON.stringify({ url }) }
      }
    })

    if (convertCommentMessage && convertCommentMessage.length > 1) {
      // tslint:disable-next-line:only-arrow-functions
      convertCommentMessage.sort(function (obj1, obj2) {
        const a = obj1 as ChatCommentEntity
        const b = obj2 as ChatCommentEntity
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
    }

    // Convert Customer Picture
    if (result.customer && result.customer.picture) {
      const picture = gcsService.getCustomerDisplayURL(
        organization.id,
        result.channel.id,
        result.customer.uid,
        result.customer.picture,
      )
      return res.status(200).send({
        ...result,
        message: convertMessage2,
        comment: convertCommentMessage,
        customer: {
          ...result.customer,
          pictureURL: picture,
        },
      })
    }

    return res.status(200).send({
      ...result,
      message: convertMessage2,
      comment: convertCommentMessage,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getChat', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getChatinScrum = async (
  params: any
) => {
  try {
    const { chatId, bid, reqid, orgId } = params

    const organization = await organizationModel.getOrganizationWithId(orgId)


    const id = chatId
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'chat', 'invalid parameter(id)')
      return "error400"
    }
    if (organization != undefined) {
      const result = await chatModel.getChatWithIdForScrumboard(id, organization)
      if (!result) {
        errorMessage('CONTROLLER', 'chat', 'chat not found')
        return "error400"
      }

      messageModel.markReadMessageList(result.message)

      // Convert message
      const convertMessage = await result.message.map((message) => {
        if (message.type === MESSAGE_TYPE.TEXT) {
          return message
        }

        if (message.type === MESSAGE_TYPE.STICKER) {
          if (!JSON.parse(message.data).url) {
            const url = lineService.getStickerUrl(
              JSON.parse(message.data).sticker,
            )
            // message.data =  JSON.stringify({stickerURL})
            return { ...message, data: JSON.stringify({ url }) }
          } else {
            return { ...message }
          }
        }

        if (
          message.type === MESSAGE_TYPE.IMAGE ||
          message.type === MESSAGE_TYPE.AUDIO ||
          message.type === MESSAGE_TYPE.FILE ||
          message.type === MESSAGE_TYPE.VIDEO
        ) {
          if (!JSON.parse(message.data).url) {
            const url = gcsService.getChatMessageContentURL(
              organization.id,
              result.channel,
              result.customer.id,
              JSON.parse(message.data).filename,
            )
            // message.data =  JSON.stringify({url})
            return { ...message, data: JSON.stringify({ url }) }
          } else {
            return { ...message }
          }
        }
        if (
          message.type === MESSAGE_TYPE.BUTTONS ||
          message.type === MESSAGE_TYPE.CONFIRM ||
          message.type === MESSAGE_TYPE.CAROUSEL ||
          message.type === MESSAGE_TYPE.FLEX
        ) {
          return { ...message }
        }
      })

      if (convertMessage && convertMessage.length > 1) {
        convertMessage.sort((a, b) => {
          return a && b ? a.createdAt.getTime() - b.createdAt.getTime() : 0
        })
      }
      const convertMessage2 = convertMessage.map((message) => {
        return {
          data: message?.data,
          type: message?.type,
          timestamp: message?.timestamp,
          isError: message?.isError,
          isRead: message?.isRead,
          direction: message?.direction,
          createdAt: message?.createdAt,
          createdBy:
            message && message.createdBy
              ? {
                firstname: message.createdBy.firstname,
                lastname: message.createdBy.lastname,
              }
              : null,
        }
      })
      // Convert Comment message
      const convertCommentMessage = await result.comment.map((message) => {
        if (message.type === CHAT_COMMENT_TYPE.TEXT) {
          return message
        }
        if (message.type === CHAT_COMMENT_TYPE.IMAGE) {
          const url = gcsService.getCommentMessageContentURL(
            organization.id,
            result,
            JSON.parse(message.data).filename,
          )
          return { ...message, data: JSON.stringify({ url }) }
        }
      })

      if (convertCommentMessage && convertCommentMessage.length > 1) {
        // tslint:disable-next-line:only-arrow-functions
        convertCommentMessage.sort(function (obj1, obj2) {
          const a = obj1 as ChatCommentEntity
          const b = obj2 as ChatCommentEntity
          return a.createdAt.getTime() - b.createdAt.getTime()
        })
      }

      // Convert Customer Picture
      if (result.customer && result.customer.picture) {
        const picture = gcsService.getCustomerDisplayURL(
          organization.id,
          result.channel.id,
          result.customer.uid,
          result.customer.picture,
        )
        return {
          ...result,
          message: convertMessage2,
          comment: convertCommentMessage,
          customer: {
            ...result.customer,
            pictureURL: picture,
          }
        }
      }

      return {
        ...result,
        message: convertMessage2,
        comment: convertCommentMessage,
      }
    }

  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getChat', error)
    return "error400"
  }
}

