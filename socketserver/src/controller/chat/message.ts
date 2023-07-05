import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'
import {
  chatModel,
  MessageEntity,
  messageModel,
  MESSAGE_DIRECTION,
  MESSAGE_TYPE,
} from '../../model/chat'
import * as channelService from '../../service/channel'
import { CHANNEL, channelModel } from '../../model/channel'
import { gcsService } from '../../service/google'
import { customerModel } from '../../model/customer'
import { replyModel, RESPONSE_TYPE } from '../../model/reply'
import { lineService } from '../../service/channel'
import { sseController } from '../sse'
import {
  organizationModel,
  userModel
} from '../../model/organization'

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  let { chatId, message } = req.body
  if (!chatId || typeof chatId !== 'string') {
    errorMessage('CONTROLLER', 'message', 'invalid parameter(chatId)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }

  if (!message || message.data == null || !message.type || message.id) {
    errorMessage('CONTROLLER', 'message', 'invalid data(message)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    const chat = await chatModel.getChatWithId(chatId, organization)
    if (!chat) {
      errorMessage('CONTROLLER', 'message', 'chat not found')
      return next(new HttpException(404, 'chat not found'))
    }

    // Auto set owner
    if (!chat.ownerId) {
      chatModel.updateOwner(chatId, requester.id, requester)
    }

    // Send message to customer
    const channel = await channelModel.getChannelWithId(
      chat.channelId,
      organization,
    )
    if (!channel) {
      errorMessage('CONTROLLER', 'message', 'channel not found')
      return next(new HttpException(404, ErrorCode[404]))
    }
    const customer = await customerModel.getCustomerWithId(
      chat.customerId,
      organization,
    )
    if (!customer) {
      errorMessage('CONTROLLER', 'message', 'customer not found')
      return next(new HttpException(404, ErrorCode[404]))
    }

    let messageResult
    if (message.data !== '') {
      // Add new message to database
      const newMessage: MessageEntity = {
        ...message,
        direction: MESSAGE_DIRECTION.OUTBOUND,
        chatId,
        channelId: chat.channelId,
        isRead: true,
        timestamp: new Date(),
        organization,
        createdBy: requester,
      }

      switch (message.type) {
        case 'text':
          newMessage.type = MESSAGE_TYPE.TEXT
          //   newMessage.data = JSON.parse(JSON.stringify({ text: message }))
          break
        case 'image':
          newMessage.type = MESSAGE_TYPE.IMAGE
          //   newMessage.data = JSON.parse(JSON.stringify({ filename: message }))
          break
        case 'video':
          newMessage.type = MESSAGE_TYPE.VIDEO
          //   newMessage.data = JSON.parse(JSON.stringify({ filename: message }))
          break
        case 'file':
          newMessage.type = MESSAGE_TYPE.FILE
          //   newMessage.data = JSON.parse(JSON.stringify({ filename: message }))
          break
        default:
          errorMessage('CONTROLLER', 'message', 'invalid message type')
          return next(new HttpException(400, ErrorCode[400]))
      }

      const sendMessageResult = await channelService.sendMessage(
        organization.id,
        channel,
        customer,
        newMessage,
      )
      if (!sendMessageResult) {
        errorMessage('CONTROLLER', 'message', 'channel send message')
        return next(new HttpException(404, ErrorCode[404]))
      }
      newMessage.mid = sendMessageResult.message_id
      messageResult = await messageModel.saveMessage(newMessage)
    }

    const content = req.file
    if (content) {
      const customerId = chat.customerId
      try {
        const contentName = await gcsService.uploadChatMessageFromFileObject(
          organization.id,
          channel,
          customerId,
          content.originalname,
          { data: content.buffer },
        )

        const url = gcsService.getChatMessageContentURL(
          organization.id,
          channel,
          customerId,
          contentName,
        )

        const fileExt = contentName.split('.').pop()
        let type = MESSAGE_TYPE.IMAGE
        if (fileExt) {
          if (
            fileExt.toLowerCase() === 'jpg' ||
            fileExt.toLowerCase() === 'jpeg' ||
            fileExt.toLowerCase() === 'gif' ||
            fileExt.toLowerCase() === 'png'
          ) {
            type = MESSAGE_TYPE.IMAGE
          } else if (
            fileExt.toLowerCase() === 'mp4' ||
            fileExt.toLowerCase() === 'avi' ||
            fileExt.toLowerCase() === '3gp'
          ) {
            type = MESSAGE_TYPE.VIDEO
          } else {
            type = MESSAGE_TYPE.FILE
          }
        }

        message = {
          data: JSON.stringify({ filename: contentName }),
          type,
        }

        const newFileMessage: MessageEntity = {
          ...message,
          direction: MESSAGE_DIRECTION.OUTBOUND,
          chatId,
          channelId: chat.channelId,
          isRead: true,
          timestamp: new Date(),
          organization,
          createdBy: requester,
        }

        const sendMessageResult = await channelService.sendMessage(
          organization.id,
          channel,
          customer,
          newFileMessage,
        )
        if (!sendMessageResult) {
          errorMessage('CONTROLLER', 'message', 'channel send message')
          return next(new HttpException(404, ErrorCode[404]))
        }
        newFileMessage.mid = sendMessageResult.message_id
        messageResult = await messageModel.saveMessage(newFileMessage)
        messageResult = {
          ...messageResult,
          data: JSON.stringify({ url }),
        }
      } catch (error) {
        errorMessage('CONTROLLER', 'message', 'uploadContent', error)
        return next(new HttpException(400, ErrorCode[400]))
      }
    }
    sseController.sendEventToAllSubscriber(
      organization.id,
      JSON.parse(JSON.stringify({ event: 'newEvent' })),
    )
    return res.status(200).send(messageResult)
  } catch (error) {
    errorMessage('CONTROLLER', 'message', 'sendMessage')
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const sendMessageinChatforSocket = async (
  params: any
) => {
  let { message, chatId, reqid, orgId } = params
  if (!chatId || typeof chatId !== 'string') {
    errorMessage('CONTROLLER', 'message', 'invalid parameter(chatId)')
    return "error400"
  }

  if (typeof message === 'string') {
    message = JSON.parse(message)
  }
  if (!message || message.data == null || !message.type || message.id) {
    errorMessage('CONTROLLER', 'message', 'invalid data(message)')
    return "error400"
  }

  const requester = await userModel.getUserWithId(reqid)
  const organization = await organizationModel.getOrganizationWithId(orgId)
  if ((organization != undefined) && (requester != undefined)) {
    try {

      const chat = await chatModel.getChatWithId(chatId, organization)
      if (!chat) {
        errorMessage('CONTROLLER', 'message', 'chat not found')
        return "error400"
      }

      if (!chat.ownerId) {
        chatModel.updateOwner(chatId, requester.id, requester)
      }
      const channel = await channelModel.getChannelWithId(
        chat.channelId,
        organization,
      )
      if (!channel) {
        errorMessage('CONTROLLER', 'message', 'channel not found')
        return "error400"
      }
      const customer = await customerModel.getCustomerWithId(
        chat.customerId,
        organization,
      )
      if (!customer) {
        errorMessage('CONTROLLER', 'message', 'customer not found')
        return "error400"
      }

      let messageResult
      if (message.data !== '') {
        const newMessage: MessageEntity = {
          ...message,
          direction: MESSAGE_DIRECTION.OUTBOUND,
          chatId,
          channelId: chat.channelId,
          isRead: true,
          timestamp: new Date(),
          organization,
          createdBy: requester,
        }

        switch (message.type) {
          case 'text':
            newMessage.type = MESSAGE_TYPE.TEXT
            break
          case 'image':
            newMessage.type = MESSAGE_TYPE.IMAGE
            break
          case 'video':
            newMessage.type = MESSAGE_TYPE.VIDEO
            break
          case 'file':
            newMessage.type = MESSAGE_TYPE.FILE
            break
          default:
            errorMessage('CONTROLLER', 'message', 'invalid message type')
            return "error400"
        }

        const sendMessageResult = await channelService.sendMessage(
          organization.id,
          channel,
          customer,
          newMessage,
        )
        if (!sendMessageResult) {
          errorMessage('CONTROLLER', 'message', 'channel send message')
          return "error400"
        }
        newMessage.mid = sendMessageResult.message_id
        messageResult = await messageModel.saveMessage(newMessage)
      }

      if (params.file != undefined) {
        const content = params.file

        const customerId = chat.customerId
        try {
          const contentName = await gcsService.uploadChatMessageFromFileObject(
            organization.id,
            channel,
            customerId,
            content.originalname,
            { data: content.buffer },
          )

          const url = gcsService.getChatMessageContentURL(
            organization.id,
            channel,
            customerId,
            contentName,
          )

          const fileExt = contentName.split('.').pop()
          let type = MESSAGE_TYPE.IMAGE
          if (fileExt) {
            if (
              fileExt.toLowerCase() === 'jpg' ||
              fileExt.toLowerCase() === 'jpeg' ||
              fileExt.toLowerCase() === 'gif' ||
              fileExt.toLowerCase() === 'png'
            ) {
              type = MESSAGE_TYPE.IMAGE
            } else if (
              fileExt.toLowerCase() === 'mp4' ||
              fileExt.toLowerCase() === 'avi' ||
              fileExt.toLowerCase() === '3gp'
            ) {
              type = MESSAGE_TYPE.VIDEO
            } else {
              type = MESSAGE_TYPE.FILE
            }
          }

          message = {
            data: JSON.stringify({ filename: contentName }),
            type,
          }

          const newFileMessage: MessageEntity = {
            ...message,
            direction: MESSAGE_DIRECTION.OUTBOUND,
            chatId,
            channelId: chat.channelId,
            isRead: true,
            timestamp: new Date(),
            organization,
            createdBy: requester,
          }

          const sendMessageResult = await channelService.sendMessage(
            organization.id,
            channel,
            customer,
            newFileMessage,
          )
          if (!sendMessageResult) {
            errorMessage('CONTROLLER', 'message', 'channel send message')
            return "error400"
          }
          newFileMessage.mid = sendMessageResult.message_id
          messageResult = await messageModel.saveMessage(newFileMessage)
          messageResult = {
            ...messageResult,
            data: JSON.stringify({ url }),
          }
        } catch (error) {
          errorMessage('CONTROLLER', 'message', 'uploadContent', error)
          return "error400"
        }
      }
      return messageResult
    } catch (error) {
      errorMessage('CONTROLLER', 'message', 'sendMessage')
      return "error400"
    }
  }

}

export const sendReplyMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { chatId, replyId } = req.body
  if (
    !chatId ||
    typeof chatId !== 'string' ||
    !replyId ||
    typeof replyId !== 'string'
  ) {
    errorMessage('CONTROLLER', 'message', 'invalid parameter(chatId/replyId)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    const chat = await chatModel.getChatWithId(chatId, organization)
    if (!chat) {
      errorMessage('CONTROLLER', 'message', 'chat not found')
      return next(new HttpException(404, 'chat not found'))
    }
    const reply = await replyModel.getReplyWithId(replyId, organization)
    if (!reply) {
      errorMessage('CONTROLLER', 'message', 'reply not found')
      return next(new HttpException(404, 'reply not found'))
    }

    const channel = await channelModel.getChannelWithId(
      chat.channelId,
      organization,
    )
    if (!channel) {
      errorMessage('CONTROLLER', 'message', 'channel not found')
      return next(new HttpException(404, ErrorCode[404]))
    }

    for await (const response of reply.response) {
      // Add new message to database
      const newMessage: MessageEntity = {
        ...new MessageEntity(),
        direction: MESSAGE_DIRECTION.OUTBOUND,
        chat,
        channelId: chat.channelId,
        isRead: true,
        timestamp: new Date(),
        organization,
        createdBy: requester,
      }

      switch (response.type) {
        case RESPONSE_TYPE.TEXT:
          // Replace TEXT Keyword
          let templateMessage: string = JSON.parse(response.data).text
          templateMessage = templateMessage.replace(
            '{{displayName}}',
            `${chat.customer.display}`,
          )
          templateMessage = templateMessage.replace(
            '{{accountName}}',
            `${requester.firstname} ${requester.lastname}`,
          )
          newMessage.type = MESSAGE_TYPE.TEXT
          newMessage.data = JSON.stringify({ text: templateMessage })

          // await sendMessage(
          //   channel,
          //   channelId,
          //   userId,
          //   MESSAGE_TYPE.TEXT,
          //   templateMessage,
          // )
          break
        case RESPONSE_TYPE.IMAGE:
          newMessage.type = MESSAGE_TYPE.IMAGE
          newMessage.data = JSON.stringify({
            filename: JSON.parse(response.data).image.filename,
          })
          await gcsService.copyReplyResponseContentToMessage(
            organization.id,
            chat.channelId,
            chat.customerId,
            reply.id,
            JSON.parse(response.data).image.filename,
          )
          break

        case RESPONSE_TYPE.BUTTONS:
          newMessage.type = MESSAGE_TYPE.BUTTONS
          newMessage.data = response.data
          break
        case RESPONSE_TYPE.CONFIRM:
          newMessage.type = MESSAGE_TYPE.CONFIRM
          newMessage.data = response.data
          break
        case RESPONSE_TYPE.CAROUSEL:
          newMessage.type = MESSAGE_TYPE.CAROUSEL
          newMessage.data = response.data
          break
        case RESPONSE_TYPE.FLEX:
          newMessage.type = MESSAGE_TYPE.FLEX
          newMessage.data = response.data
          break

        default:
          errorMessage('CONTROLLER', 'message', 'templates not support')
          return next(new HttpException(400, ErrorCode[400]))
      }

      const sendMessageResult = await channelService.sendMessage(
        organization.id,
        channel,
        chat.customer,
        newMessage,
      )
      if (!sendMessageResult) {
        errorMessage('CONTROLLER', 'message', 'channel send message')
        return next(new HttpException(404, ErrorCode[404]))
      }
      newMessage.mid = sendMessageResult.message_id
      await messageModel.saveMessage(newMessage)

      // Send Notification Event
      //
      //
      //
      if (response.type === RESPONSE_TYPE.IMAGE) {
        setTimeout(() => {
          sseController.sendEventToAllSubscriber(
            organization.id,
            JSON.parse(JSON.stringify({ event: 'newEvent' })),
          )
        }, 1000)
      } else {
        sseController.sendEventToAllSubscriber(
          organization.id,
          JSON.parse(JSON.stringify({ event: 'newEvent' })),
        )
      }
    }
    return res.status(200).send({ success: true })
  } catch (error) {
    errorMessage('CONTROLLER', 'message', 'sendMessage')
    return next(new HttpException(400, ErrorCode[400]))
  }
}
export const sendReplyMessageforSocket = async (
  params: any
) => {
  const { chatId, replyId } = params
  if (
    !chatId ||
    typeof chatId !== 'string' ||
    !replyId ||
    typeof replyId !== 'string'
  ) {
    errorMessage('CONTROLLER', 'message', 'invalid parameter(chatId/replyId)')
    return "error400"
  }

  const organization: OrganizationEntity = params.organization
  const requester: UserEntity = params.requester

  try {
    const chat = await chatModel.getChatWithId(chatId, organization)
    if (!chat) {
      errorMessage('CONTROLLER', 'message', 'chat not found')
      return 'chat not found'
    }
    const reply = await replyModel.getReplyWithId(replyId, organization)
    if (!reply) {
      errorMessage('CONTROLLER', 'message', 'reply not found')
      return 'reply not found'
    }

    const channel = await channelModel.getChannelWithId(
      chat.channelId,
      organization,
    )
    if (!channel) {
      errorMessage('CONTROLLER', 'message', 'channel not found')
      return "error404"
    }

    for await (const response of reply.response) {
      // Add new message to database
      const newMessage: MessageEntity = {
        ...new MessageEntity(),
        direction: MESSAGE_DIRECTION.OUTBOUND,
        chat,
        channelId: chat.channelId,
        isRead: true,
        timestamp: new Date(),
        organization,
        createdBy: requester,
      }

      switch (response.type) {
        case RESPONSE_TYPE.TEXT:
          // Replace TEXT Keyword
          let templateMessage: string = JSON.parse(response.data).text
          templateMessage = templateMessage.replace(
            '{{displayName}}',
            `${chat.customer.display}`,
          )
          templateMessage = templateMessage.replace(
            '{{accountName}}',
            `${requester.firstname} ${requester.lastname}`,
          )
          newMessage.type = MESSAGE_TYPE.TEXT
          newMessage.data = JSON.stringify({ text: templateMessage })

          break
        case RESPONSE_TYPE.IMAGE:
          newMessage.type = MESSAGE_TYPE.IMAGE
          newMessage.data = JSON.stringify({
            filename: JSON.parse(response.data).image.filename,
          })
          await gcsService.copyReplyResponseContentToMessage(
            organization.id,
            chat.channelId,
            chat.customerId,
            reply.id,
            JSON.parse(response.data).image.filename,
          )
          break

        case RESPONSE_TYPE.BUTTONS:
          newMessage.type = MESSAGE_TYPE.BUTTONS
          newMessage.data = response.data
          break
        case RESPONSE_TYPE.CONFIRM:
          newMessage.type = MESSAGE_TYPE.CONFIRM
          newMessage.data = response.data
          break
        case RESPONSE_TYPE.CAROUSEL:
          newMessage.type = MESSAGE_TYPE.CAROUSEL
          newMessage.data = response.data
          break
        case RESPONSE_TYPE.FLEX:
          newMessage.type = MESSAGE_TYPE.FLEX
          newMessage.data = response.data
          break

        default:
          errorMessage('CONTROLLER', 'message', 'templates not support')
          return "error400"
      }

      const sendMessageResult = await channelService.sendMessage(
        organization.id,
        channel,
        chat.customer,
        newMessage,
      )
      if (!sendMessageResult) {
        errorMessage('CONTROLLER', 'message', 'channel send message')
        return "error404"
      }
      newMessage.mid = sendMessageResult.message_id
      await messageModel.saveMessage(newMessage)

      if (response.type === RESPONSE_TYPE.IMAGE) {
        setTimeout(() => {
          sseController.sendEventToAllSubscriber(
            organization.id,
            JSON.parse(JSON.stringify({ event: 'newEvent' })),
          )
        }, 1000)
      } else {
        sseController.sendEventToAllSubscriber(
          organization.id,
          JSON.parse(JSON.stringify({ event: 'newEvent' })),
        )
      }
    }
    return ({ success: true })
  } catch (error) {
    errorMessage('CONTROLLER', 'message', 'sendMessage')
    return "error400"
  }
}

export const uploadContent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { channelId, customerId } = req.params
  if (!channelId || !customerId) {
    errorMessage('CONTROLLER', 'message', 'invalid parameter(channel/uid)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const organization: OrganizationEntity = req.body.organization
  const channel = await channelModel.getChannelWithId(channelId, organization)
  if (!channel) {
    errorMessage('CONTROLLER', 'message', 'channel not found')
    return next(new HttpException(404, ErrorCode[404]))
  }

  const customer = await customerModel.getCustomerWithId(
    customerId,
    organization,
  )
  if (!customer) {
    errorMessage('CONTROLLER', 'message', 'customer not found')
    return next(new HttpException(404, ErrorCode[404]))
  }

  const content = req.file
  if (!content) {
    errorMessage('CONTROLLER', 'message', 'invalid file')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const contentName = await gcsService.uploadChatMessageFromFileObject(
      organization.id,
      channel,
      customerId,
      content.originalname,
      { data: content.buffer },
    )

    // console.log('💾 [uploadContent] contentName', contentName)

    const url = gcsService.getChatMessageContentURL(
      organization.id,
      channel,
      customerId,
      contentName,
    )
    // console.log('💾 [uploadContent] url', url)

    return res.status(200).json({
      message: 'Upload was successful',
      fileName: contentName,
      url,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'message', 'uploadContent', error)
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
    const requester: UserEntity = req.body.requester

    const { chatId } = req.params
    const { page, size } = req.query
    // if (chatId!='' || typeof chatId !== 'string' || !page || !size) {
    //   errorMessage('CONTROLLER', 'message', 'invalid parameter(chatId)')
    //   return next(new HttpException(400, ErrorCode[400]))
    // }

    const chat = await chatModel.getChatWithId(chatId, organization)
    if (!chat) {
      errorMessage('CONTROLLER', 'message', 'Chat not found')
      return next(new HttpException(404, ErrorCode[404]))
    }

    const pageNumber = Number(page)
    const pageSize = Number(size)

    const [_result, _total] = await messageModel.getMessages(
      chatId,
      organization.id,
      pageNumber,
      pageSize,
    )

    // Mark isRead true
    messageModel.markReadWithMessageIds(
      _result.map((mgs) => mgs.id),
      requester,
    )

    // Convert message data
    const convertMessage = await _result.map((message) => {
      // Convert replyTo
      if (message.replyTo) {
        const _replyTo = message.replyTo
        if (_replyTo.type === MESSAGE_TYPE.STICKER && _replyTo.data) {
          const data = JSON.parse(_replyTo.data)
          if (!data.url && data.sticker) {
            const url = lineService.getStickerUrl(data.sticker)
            message.replyTo = { ..._replyTo, data: JSON.stringify({ url }) }
          }
        } else if (
          _replyTo.data &&
          (_replyTo.type === MESSAGE_TYPE.IMAGE ||
            _replyTo.type === MESSAGE_TYPE.AUDIO ||
            _replyTo.type === MESSAGE_TYPE.FILE ||
            _replyTo.type === MESSAGE_TYPE.VIDEO ||
            _replyTo.type === MESSAGE_TYPE.STORY_MENTION)
        ) {
          const data = JSON.parse(_replyTo.data)
          if (!data.url && data.filename) {
            const url = gcsService.getChatMessageContentURL(
              organization.id,
              chat.channel,
              chat.customerId,
              data.filename,
            )
            message.replyTo = { ..._replyTo, data: JSON.stringify({ url }) }
          }
        }
      }

      // if (message.type === MESSAGE_TYPE.TEXT) {
      //   return message
      // }

      if (
        chat.channel &&
        chat.channel.channel === CHANNEL.LINE &&
        message.type === MESSAGE_TYPE.STICKER
      ) {
        if (!JSON.parse(message.data).url) {
          const url = lineService.getStickerUrl(
            JSON.parse(message.data).sticker,
          )
          // message.data =  JSON.stringify({stickerURL})
          return { ...message, data: JSON.stringify({ url }) }
        }
      }

      if (
        message.type === MESSAGE_TYPE.IMAGE ||
        message.type === MESSAGE_TYPE.AUDIO ||
        message.type === MESSAGE_TYPE.FILE ||
        message.type === MESSAGE_TYPE.VIDEO ||
        message.type === MESSAGE_TYPE.STORY_MENTION ||
        (message.type === MESSAGE_TYPE.STICKER &&
          chat.channel.channel !== CHANNEL.LINE)
      ) {
        if (!JSON.parse(message.data).url) {
          const url = gcsService.getChatMessageContentURL(
            organization.id,
            chat.channel,
            chat.customerId,
            JSON.parse(message.data).filename,
          )
          // message.data =  JSON.stringify({url})
          return { ...message, data: JSON.stringify({ url }) }
        }
      }
      return message
    })

    return res.json({
      currentPage: pageNumber || null,
      pages: Math.ceil(_total / pageSize),
      currentCount: _result.length,
      totalCount: _total,
      data: convertMessage.map((message) => ({
        ...message,
        replyTo:
          message && message.replyTo
            ? {
              id: message.replyTo.id,
              data: message.replyTo.data,
              type: message.replyTo.type,
              createdAt: message.replyTo.createdAt,
            }
            : null,
        createdBy:
          message && message.createdBy
            ? {
              firstname: message.createdBy.firstname,
              lastname: message.createdBy.lastname,
              display: message.createdBy.display,
            }
            : null,
      })),
    })

    // if (convertMessage && convertMessage.length > 1) {
    //   convertMessage.sort((a, b) => {
    //     return a && b ? a.createdAt.getTime() - b.createdAt.getTime() : 0
    //   })
    // }
    // const convertMessage2 = convertMessage.map((message) => {
    //   return {
    //     data: message?.data,
    //     type: message?.type,
    //     timestamp: message?.timestamp,
    //     isError: message?.isError,
    //     isRead: message?.isRead,
    //     direction: message?.direction,
    //     createdAt: message?.createdAt,
    //     createdBy:
    //       message && message.createdBy
    //         ? {
    //             firstname: message.createdBy.firstname,
    //             lastname: message.createdBy.lastname,
    //           }
    //         : null,
    //   }
    // })
    // // Convert Comment message
    // const convertCommentMessage = await result.comment.map((message) => {
    //   if (message.type === CHAT_COMMENT_TYPE.TEXT) {
    //     return message
    //   }
    //   if (message.type === CHAT_COMMENT_TYPE.IMAGE) {
    //     const url = gcsService.getCommentMessageContentURL(
    //       organization.id,
    //       result,
    //       JSON.parse(message.data).filename,
    //     )
    //     return { ...message, data: JSON.stringify({ url }) }
    //   }
    // })

    // if (convertCommentMessage && convertCommentMessage.length > 1) {
    //   // tslint:disable-next-line:only-arrow-functions
    //   convertCommentMessage.sort(function (obj1, obj2) {
    //     const a = obj1 as ChatCommentEntity
    //     const b = obj2 as ChatCommentEntity
    //     return a.createdAt.getTime() - b.createdAt.getTime()
    //   })
    // }

    // // Convert Customer Picture
    // if (result.customer && result.customer.picture) {
    //   const picture = gcsService.getCustomerDisplayURL(
    //     organization.id,
    //     result.channel.id,
    //     result.customer.uid,
    //     result.customer.picture,
    //   )
    //   return res.status(200).send({
    //     ...result,
    //     message: convertMessage2,
    //     comment: convertCommentMessage,
    //     customer: {
    //       ...result.customer,
    //       pictureURL: picture,
    //     },
    //   })
    // }

    // return res.status(200).send({
    //   ...result,
    //   message: convertMessage2,
    //   comment: convertCommentMessage,
    // })
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getChat', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getMessagesinChatforSocket = async (
  params: any
) => {
  try {
    const { page, size, chatId, reqid, orgId } = params
    const requester = await userModel.getUserWithId(reqid)
    const organization = await organizationModel.getOrganizationWithId(orgId)
    // if (!chatId || typeof chatId !== 'string' || !page || !size) {
    //   errorMessage('CONTROLLER1', 'message', 'invalid parameter(chatId)')
    //   return "error400"
    // }
    if (organization != undefined && requester != undefined) {
      const chat = await chatModel.getChatWithId(chatId, organization)
      if (!chat) {
        errorMessage('CONTROLLER', 'message', 'Chat not found')
        return "error400"
      }

      const pageNumber = Number(page)
      const pageSize = Number(size)

      const [_result, _total] = await messageModel.getMessages(
        chatId,
        organization.id,
        pageNumber,
        pageSize,
      )

      // Mark isRead true
      messageModel.markReadWithMessageIds(
        _result.map((mgs) => mgs.id),
        requester,
      )

      // Convert message data
      const convertMessage = await _result.map((message) => {
        // Convert replyTo
        if (message.replyTo) {
          const _replyTo = message.replyTo
          if (_replyTo.type === MESSAGE_TYPE.STICKER && _replyTo.data) {
            const data = JSON.parse(_replyTo.data)
            if (!data.url && data.sticker) {
              const url = lineService.getStickerUrl(data.sticker)
              message.replyTo = { ..._replyTo, data: JSON.stringify({ url }) }
            }
          } else if (
            _replyTo.data &&
            (_replyTo.type === MESSAGE_TYPE.IMAGE ||
              _replyTo.type === MESSAGE_TYPE.AUDIO ||
              _replyTo.type === MESSAGE_TYPE.FILE ||
              _replyTo.type === MESSAGE_TYPE.VIDEO ||
              _replyTo.type === MESSAGE_TYPE.STORY_MENTION)
          ) {
            const data = JSON.parse(_replyTo.data)
            if (!data.url && data.filename) {
              const url = gcsService.getChatMessageContentURL(
                organization.id,
                chat.channel,
                chat.customerId,
                data.filename,
              )
              message.replyTo = { ..._replyTo, data: JSON.stringify({ url }) }
            }
          }
        }

        if (
          chat.channel &&
          chat.channel.channel === CHANNEL.LINE &&
          message.type === MESSAGE_TYPE.STICKER
        ) {
          if (!JSON.parse(message.data).url) {
            const url = lineService.getStickerUrl(
              JSON.parse(message.data).sticker,
            )
            return { ...message, data: JSON.stringify({ url }) }
          }
        }

        if (
          message.type === MESSAGE_TYPE.IMAGE ||
          message.type === MESSAGE_TYPE.AUDIO ||
          message.type === MESSAGE_TYPE.FILE ||
          message.type === MESSAGE_TYPE.VIDEO ||
          message.type === MESSAGE_TYPE.STORY_MENTION ||
          (message.type === MESSAGE_TYPE.STICKER &&
            chat.channel.channel !== CHANNEL.LINE)
        ) {
          if (!JSON.parse(message.data).url) {
            const url = gcsService.getChatMessageContentURL(
              organization.id,
              chat.channel,
              chat.customerId,
              JSON.parse(message.data).filename,
            )
            // message.data =  JSON.stringify({url})
            return { ...message, data: JSON.stringify({ url }) }
          }
        }
        return message
      })

      return {
        currentPage: pageNumber || null,
        pages: Math.ceil(_total / pageSize),
        currentCount: _result.length,
        totalCount: _total,
        data: convertMessage.map((message) => ({
          ...message,
          replyTo:
            message && message.replyTo
              ? {
                id: message.replyTo.id,
                data: message.replyTo.data,
                type: message.replyTo.type,
                createdAt: message.replyTo.createdAt,
              }
              : null,
          createdBy:
            message && message.createdBy
              ? {
                firstname: message.createdBy.firstname,
                lastname: message.createdBy.lastname,
                display: message.createdBy.display,
              }
              : null,
        })),
      }
    }
  }
  catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getChat', error)
    return "error400"
  }
}
