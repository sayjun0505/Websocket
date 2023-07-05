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
} from '../../model/organization'
import { gcsService } from '../../service/google'
import {
  organizationModel,
  userModel
} from '../../model/organization'
import {
  ChatCommentEntity,
  ChatEntity,
  chatModel,
  CHAT_COMMENT_TYPE,
  mentionModel,
  MessageEntity,
  messageModel,
  MESSAGE_TYPE,
} from '../../model/chat'
import { customerModel, labelModel } from '../../model/customer'
import { lineService } from '../../service/channel'
import { notificationUtil } from '../../util'
import { CHANNEL, channelModel } from '../../model/channel'
import { sseController } from '../sse'

export const getChats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { type, label } = req.query
    if (!type || typeof type !== 'string') {
      errorMessage('CONTROLLER', 'chat', 'invalid parameter(type)')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    let chats: ChatEntity[]
    switch (type.toLowerCase()) {
      case 'resolve':
        chats = await chatModel.getChatsAllResolve(organization)
        break
      case 'active':
        chats = await chatModel.getChatsAllActive(organization)
        break
      case 'unassign':
        chats = await chatModel.getChatsAllUnassign(organization)
        break
      case 'assignee':
        chats = await chatModel.getChatsAllMyOwner(requester, organization)
        break
      case 'followup':
        chats = await chatModel.getChatsAllMyFollowup(requester, organization)
        break
      case 'spam':
        chats = await chatModel.getChatsAllSpam(requester, organization)
        break
      case 'mention':
        chats = await chatModel.getChatsAllMyMention(requester, organization)
        break
      case 'line':
        chats = await chatModel.getChatsAllActiveLineChannel(organization)
        break
      case 'facebook':
        chats = await chatModel.getChatsAllActiveFacebookChannel(organization)
        break
      case 'instagram':
        chats = await chatModel.getChatsAllActiveInstagramChannel(organization)
        break
      default:
        chats = await chatModel.getChats(organization)
        break
    }
    if (!chats) {
      errorMessage('CONTROLLER', 'chat', 'get chats')
      return next(new HttpException(500, ErrorCode[500]))
    }
    // filter Chat list with Label
    if (label && typeof label === 'string') {
      const inputLabel = label.split(',')
      chats = await chats.filter((chat, index) => {
        const labelsObj = chat.customer.customerLabel
        // no label
        if (!labelsObj || labelsObj.length <= 0) {
          return false
        }
        // Get Label text from Object
        const labels = labelsObj.map((element) => element.label)

        // Return with SOME label
        return inputLabel.some((element) => labels.includes(element))

        // Return with ALL label
        // return inputLabel.every(element => labels.includes(element));
        // return false
      })
    }

    // Convert Chats
    const convertChats = await chats.map((chat) => {
      chat.message.sort((a, b) => {
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
      let lastMessage = chat.message[chat.message.length - 1]
      const unread = chat.message.filter((msg) => !msg.isRead).length

      const newMention =
        chat.mention.filter(
          (mention) => !mention.isRead && mention.user.id === requester.id,
        ).length > 0

      let picture = null
      if (chat.customer && chat.customer.picture) {
        picture = gcsService.getCustomerDisplayURL(
          organization.id,
          chat.channel.id,
          chat.customer.uid,
          chat.customer.picture,
        )
      }

      // let channelName = ''
      // if (chat.channel) {
      //   if (chat.channel.line) {
      //     channelName = chat.channel.line.name
      //   }
      //   if (chat.channel.facebook) {
      //     channelName = chat.channel.facebook.name
      //   }
      //   if (chat.channel.instagram) {
      //     channelName = chat.channel.instagram.name
      //   }
      // }

      if (
        lastMessage &&
        lastMessage.type &&
        (lastMessage.type === MESSAGE_TYPE.IMAGE ||
          lastMessage.type === MESSAGE_TYPE.AUDIO ||
          lastMessage.type === MESSAGE_TYPE.FILE ||
          lastMessage.type === MESSAGE_TYPE.VIDEO)
      ) {
        if (!JSON.parse(lastMessage.data).url) {
          const url = gcsService.getChatMessageContentURL(
            organization.id,
            chat.channel,
            chat.customer.id,
            JSON.parse(lastMessage.data).filename,
          )
          // message.data =  JSON.stringify({url})
          lastMessage = { ...lastMessage, data: JSON.stringify({ url }) }
        } else {
          lastMessage = { ...lastMessage }
        }
      }

      return {
        id: chat.id,
        // status: chat.status,
        // description: chat.description,
        // followup: chat.followup,
        // archived: chat.archived,
        // spam: chat.spam,
        // createdAt: chat.createdAt,
        newMention,
        unread,
        channelId: chat.channelId,
        customerId: chat.customerId,
        // channel: chat.channel
        //   ? {
        //       channel: chat.channel.channel,
        //       name: channelName,
        //     }
        //   : null,
        customer: chat.customer
          ? {
            display: chat.customer.display,
            pictureURL: picture,
            customerLabel:
              chat.customer.customerLabel &&
                chat.customer.customerLabel.length
                ? chat.customer.customerLabel.map((element) => ({
                  id: element.id,
                  label: element.label,
                }))
                : [],
          }
          : null,

        lastMessage: lastMessage
          ? {
            id: lastMessage.id,
            data: lastMessage.data,
            type: lastMessage.type,
            createdAt: lastMessage.createdAt,
            isRead: lastMessage.isRead,
          }
          : null,
      }
      //   } else {
      //     return {
      //       id: chat.id,
      //       status: chat.status,
      //       description: chat.description,
      //       followup: chat.followup,
      //       archived: chat.archived,
      //       spam: chat.spam,
      //       createdAt: chat.createdAt,
      //       channel: chat.channel,
      //       lastMessage,
      //       newMention,
      //       unread: unread > 0 ? unread : null,
      //     }
      //   }
    })

    const noLastMsg = convertChats.filter((chat) => !chat.lastMessage)
    const chatHaveLastMsg = convertChats.filter((chat) => chat.lastMessage)
    const lastMsgUnRead = chatHaveLastMsg.filter(
      (chat) => chat.lastMessage && !chat.lastMessage.isRead,
    )
    const lastMsgRead = chatHaveLastMsg.filter(
      (chat) => chat.lastMessage && chat.lastMessage.isRead,
    )

    lastMsgUnRead.sort((a: any, b: any) => {
      return (
        b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
      )
    })
    lastMsgRead.sort((a: any, b: any) => {
      return (
        b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
      )
    })

    // Pagination
    const chatListResult = [...lastMsgUnRead, ...lastMsgRead, ...noLastMsg]
    const { page, size } = req.query
    if (!page && !size) {
      return res.json({
        currentPage: null,
        pages: null,
        currentCount: chatListResult.length,
        totalCount: chatListResult.length,
        data: chatListResult,
      })
    } else {
      const pageNumber = Number(page)
      const pageSize = Number(size)
      const data = chatListResult.slice(
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize,
      )

      return res.json({
        currentPage: pageNumber,
        pages: Math.ceil(chatListResult.length / pageSize),
        currentCount: data.length,
        totalCount: chatListResult.length,
        data,
      })
    }

    // return res.status(200).send([...lastMsgUnRead, ...lastMsgRead, ...noLastMsg])
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getChats', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getChatsinTabforSocket = async (
  params: any
) => {
  try {
    const { orgId, type, label, reqid, page, size } = params
    if (!type || typeof type !== 'string') {
      console.log(type)
      errorMessage('CONTROLLER', 'chat', 'invalid parameter(type)')
      return "error400"
    }
    const organization = await organizationModel.getOrganizationWithId(orgId)
    const requester = await userModel.getUserWithId(reqid)

    let chats: ChatEntity[]
    if ((organization != undefined) && (requester != undefined)) {
      switch (type.toLowerCase()) {
        case 'resolve':
          chats = await chatModel.getChatsAllResolve(organization)
          break
        case 'active':
          chats = await chatModel.getChatsAllActive(organization)
          break
        case 'unassign':
          chats = await chatModel.getChatsAllUnassign(organization)
          break
        case 'assignee':
          chats = await chatModel.getChatsAllMyOwner(requester, organization)
          break
        case 'followup':
          chats = await chatModel.getChatsAllMyFollowup(requester, organization)
          break
        case 'spam':
          chats = await chatModel.getChatsAllSpam(requester, organization)
          break
        case 'mention':
          chats = await chatModel.getChatsAllMyMention(requester, organization)
          break
        case 'line':
          chats = await chatModel.getChatsAllActiveLineChannel(organization)
          break
        case 'facebook':
          chats = await chatModel.getChatsAllActiveFacebookChannel(organization)
          break
        case 'instagram':
          chats = await chatModel.getChatsAllActiveInstagramChannel(organization)
          break
        default:
          chats = await chatModel.getChats(organization)
          break
      }
      if (!chats) {
        errorMessage('CONTROLLER', 'chat', 'get chats')
        return "error500"
      }
      if (label && typeof label === 'string') {
        const inputLabel = label.split(',')
        chats = await chats.filter((chat, index) => {
          const labelsObj = chat.customer.customerLabel
          if (!labelsObj || labelsObj.length <= 0) {
            return false
          }
          const labels = labelsObj.map((element) => element.label)
          return inputLabel.some((element) => labels.includes(element))
        })
      }

      const convertChats = await chats.map((chat) => {
        chat.message.sort((a, b) => {
          return a.createdAt.getTime() - b.createdAt.getTime()
        })
        let lastMessage = chat.message[chat.message.length - 1]
        const unread = chat.message.filter((msg) => !msg.isRead).length
        const newMention =
          chat.mention.filter(
            (mention) => !mention.isRead && mention.user.id === requester.id,
          ).length > 0
        let picture = null
        if (chat.customer && chat.customer.picture) {
          picture = gcsService.getCustomerDisplayURL(
            organization.id,
            chat.channel.id,
            chat.customer.uid,
            chat.customer.picture,
          )
        }
        if (
          lastMessage &&
          lastMessage.type &&
          (lastMessage.type === MESSAGE_TYPE.IMAGE ||
            lastMessage.type === MESSAGE_TYPE.AUDIO ||
            lastMessage.type === MESSAGE_TYPE.FILE ||
            lastMessage.type === MESSAGE_TYPE.VIDEO)
        ) {
          if (!JSON.parse(lastMessage.data).url) {
            const url = gcsService.getChatMessageContentURL(
              organization.id,
              chat.channel,
              chat.customer.id,
              JSON.parse(lastMessage.data).filename,
            )
            lastMessage = { ...lastMessage, data: JSON.stringify({ url }) }
          } else {
            lastMessage = { ...lastMessage }
          }
        }
        return {
          id: chat.id,
          newMention,
          unread,
          channelId: chat.channelId,
          customerId: chat.customerId,
          customer: chat.customer
            ? {
              display: chat.customer.display,
              pictureURL: picture,
              customerLabel:
                chat.customer.customerLabel &&
                  chat.customer.customerLabel.length
                  ? chat.customer.customerLabel.map((element) => ({
                    id: element.id,
                    label: element.label,
                  }))
                  : [],
            }
            : null,
          lastMessage: lastMessage
            ? {
              id: lastMessage.id,
              data: lastMessage.data,
              type: lastMessage.type,
              createdAt: lastMessage.createdAt,
              isRead: lastMessage.isRead,
            }
            : null,
        }
      })
      const noLastMsg = convertChats.filter((chat) => !chat.lastMessage)
      const chatHaveLastMsg = convertChats.filter((chat) => chat.lastMessage)
      const lastMsgUnRead = chatHaveLastMsg.filter(
        (chat) => chat.lastMessage && !chat.lastMessage.isRead,
      )
      const lastMsgRead = chatHaveLastMsg.filter(
        (chat) => chat.lastMessage && chat.lastMessage.isRead,
      )
      lastMsgUnRead.sort((a: any, b: any) => {
        return (
          b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
        )
      })
      lastMsgRead.sort((a: any, b: any) => {
        return (
          b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
        )
      })
      // Pagination
      const chatListResult = [...lastMsgUnRead, ...lastMsgRead, ...noLastMsg]
      // const { page, size } = params.query
      if (!page && !size) {
        return ({
          currentPage: null,
          pages: null,
          currentCount: chatListResult.length,
          totalCount: chatListResult.length,
          data: chatListResult
        })
      } else {
        const pageNumber = Number(page)
        const pageSize = Number(size)
        const data = chatListResult.slice(
          (pageNumber - 1) * pageSize,
          pageNumber * pageSize,
        )
        return ({
          currentPage: pageNumber,
          pages: Math.ceil(chatListResult.length / pageSize),
          currentCount: data.length,
          totalCount: chatListResult.length,
          data
        })
      }
    }

  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getChats', error)
    return "error500"
  }
  return params
}


export const getChatHistories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    const customers = await customerModel.getChatHistories(organization.id)
    if (!customers) {
      errorMessage('CONTROLLER', 'chat', 'get chat history')
      return next(new HttpException(500, ErrorCode[500]))
    }

    const convertHistories = customers.map((customer) => {
      const lastChat =
        customer.chat.length > 0
          ? customer.chat.reduce((a, b) => (a.createdAt > b.createdAt ? a : b))
          : null
      return {
        id: customer.id,
        display: customer.display,
        firstname: customer.firstname,
        lastname: customer.lastname,
        channelId: customer.channelId,
        createdAt: customer.createdAt,
        pictureURL: customer.picture
          ? gcsService.getCustomerDisplayURL(
            organization.id,
            customer.channelId,
            customer.uid,
            customer.picture,
          )
          : null,
        lastChat: lastChat
          ? {
            id: lastChat.id,
            description: lastChat.description,
            createdAt: lastChat.createdAt,
          }
          : null,
        // chat:
        //   customer.chat && customer.chat.length
        //     ? customer.chat.map((_) => ({
        //         id: _.id,
        //         description: _.description,
        //         createdAt: _.createdAt,
        //       }))
        //     : [],
        totalChat: customer.chat.length,
        customerLabel:
          customer.customerLabel && customer.customerLabel.length
            ? customer.customerLabel.map((_) => ({
              id: _.id,
              label: _.label,
            }))
            : [],
      }
    })
    return res.status(200).send(convertHistories)
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getChatHistories', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getChat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'chat', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const chat = await chatModel.getChatWithId(id, organization)
    if (!chat) {
      errorMessage('CONTROLLER', 'chat', 'chat not found')
      return next(new HttpException(404, 'chat not found'))
    }

    const history = await chatModel.getChatHistoryWithCustomerId(
      chat.customerId,
      organization.id,
    )

    let picture = null
    if (chat.customer && chat.customer.picture) {
      picture = gcsService.getCustomerDisplayURL(
        organization.id,
        chat.channelId,
        chat.customer.uid,
        chat.customer.picture,
      )
    }

    return res.json({
      ...chat,
      history,
      customer: chat.customer
        ? {
          display: chat.customer.display,
          pictureURL: picture,
          customerLabel:
            chat.customer.customerLabel && chat.customer.customerLabel.length
              ? chat.customer.customerLabel.map((element) => ({
                id: element.id,
                label: element.label,
              }))
              : [],
        }
        : null,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getChat', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getChatinChatforSocket = async (
  params: any
) => {
  const { page, size, chatId, reqid, orgId } = params
  const requester = await userModel.getUserWithId(reqid)
  const organization = await organizationModel.getOrganizationWithId(orgId)
  try {
    const id = chatId
    if (organization != undefined) {
      if (!id || typeof id !== 'string') {
        errorMessage('CONTROLLER', 'chat', 'invalid parameter(id)')
        return "error400"
      }
      const chat = await chatModel.getChatWithId(id, organization)
      if (!chat) {
        errorMessage('CONTROLLER', 'chat', 'chat not found')
        return "error400"
      }
      const history = await chatModel.getChatHistoryWithCustomerId(
        chat.customerId,
        organization.id,
      )
      let picture = null
      if (chat.customer && chat.customer.picture) {
        picture = gcsService.getCustomerDisplayURL(
          organization.id,
          chat.channelId,
          chat.customer.uid,
          chat.customer.picture,
        )
      }
      return {
        ...chat,
        history,
        customer: chat.customer
          ? {
            display: chat.customer.display,
            pictureURL: picture,
            customerLabel:
              chat.customer.customerLabel && chat.customer.customerLabel.length
                ? chat.customer.customerLabel.map((element) => ({
                  id: element.id,
                  label: element.label,
                }))
                : [],
          }
          : null,
      }
    }

  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getChat', error)
    return "error400"
  }
}

export const updateChat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { chat } = req.body

  if (typeof chat === 'string') {
    chat = JSON.parse(chat)
  }

  if (!chat || !chat.id) {
    errorMessage('CONTROLLER', 'chat', 'invalid data(chat)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Save chat to database
    const newChat: ChatEntity = {
      ...chat,
      organization,
      updatedBy: requester,
    }
    await chatModel.saveChat(newChat)
    // return res.status(201).send(await chatModel.saveChat(newChat))

    const saveChat = await chatModel.getChatWithId(chat.id, organization)
    if (!saveChat) {
      errorMessage('CONTROLLER', 'chat', 'chat not found')
      return next(new HttpException(404, 'chat not found'))
    }

    const history = await chatModel.getChatHistoryWithCustomerId(
      saveChat.customerId,
      organization.id,
    )

    let picture = null
    if (saveChat.customer && saveChat.customer.picture) {
      picture = gcsService.getCustomerDisplayURL(
        organization.id,
        saveChat.channelId,
        saveChat.customer.uid,
        saveChat.customer.picture,
      )
    }

    const responseResult = {
      ...saveChat,
      history,
      customer: saveChat.customer
        ? {
          display: saveChat.customer.display,
          pictureURL: picture,
          customerLabel:
            saveChat.customer.customerLabel &&
              saveChat.customer.customerLabel.length
              ? saveChat.customer.customerLabel.map((element) => ({
                id: element.id,
                label: element.label,
              }))
              : [],
        }
        : null,
    }
    return res.json(responseResult)
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'updateChat', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateChatStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { chat } = req.body
  if (!chat || !chat.id) {
    errorMessage('CONTROLLER', 'chat', 'invalid data(chat)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    await chatModel.updateStatus(chat.id, chat.status, requester)
    // Send notification to owner
    // const saveChat = await chatModel.getChatWithId(chat.id, organization)

    sseController.sendEventToAllSubscriber(
      organization.id,
      JSON.parse(JSON.stringify({ event: 'newEvent' })),
    )

    return res.status(201).send(chat)
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'updateChatOwner', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateChatOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { chat } = req.body
  if (!chat || !chat.id) {
    errorMessage('CONTROLLER', 'chat', 'invalid data(chat)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Save chat to database
    // const newChat: ChatEntity = {
    //   ...chat,
    //   organization,
    //   updatedBy: requester,
    // }

    await chatModel.updateOwner(chat.id, chat.ownerId, requester)
    // Send notification to owner
    const saveChat = await chatModel.getChatWithId(chat.id, organization)
    if (
      saveChat &&
      saveChat.ownerId &&
      requester &&
      saveChat.ownerId !== requester.id
    ) {
      notificationUtil.chat.notificationNewChatOwner(saveChat, organization)
    }

    return res.status(201).send(saveChat)
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'updateChatOwner', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteChat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    errorMessage('CONTROLLER', 'reply', 'invalid parameter(id)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    const result = await chatModel.getChatWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'chat', 'chat not found')
      return next(new HttpException(404, 'chat not found'))
    }
    // Save chat to database
    const newChat: ChatEntity = {
      ...result,
      isDelete: true,
      updatedBy: requester,
    }
    return res.status(201).send(await chatModel.saveChat(newChat))
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'deleteChat', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getChatHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const { id } = req.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'customer', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const result = await customerModel.getCustomerWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'customer', 'customer not found')
      return next(new HttpException(404, 'customer not found'))
    }

    // Convert chat
    const convertChat = await result.chat.map((chat) => {
      const convertMessages = chat.message
        .map((message) => {
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
                result.id,
                JSON.parse(message.data).filename,
              )
              // message.data =  JSON.stringify({url})
              return { ...message, data: JSON.stringify({ url }) }
            } else {
              return { ...message }
            }
          }
        })
        .sort((a, b) => {
          return a && b ? a.createdAt.getTime() - b.createdAt.getTime() : 0
        })
      return { ...chat, message: convertMessages }
    })

    if (result && result.picture) {
      const pictureURL = gcsService.getCustomerDisplayURL(
        organization.id,
        result.channel.id,
        result.uid,
        result.picture,
      )
      return res.status(200).send({
        ...result,
        pictureURL,
        chat: convertChat,
      })
    }

    return res.status(200).send({
      ...result,
      chat: convertChat,
    })

    // return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'customer', 'getCustomer', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

/**
 * API V2
 *
 */

export const getUserOptions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const organizationUser = await organizationUserModel.getUsers(
      organization.id,
    )

    // Convert to User option object
    const userOptions = organizationUser.map((_) => ({
      id: _.userId,
      role: _.role,
      teamId: _.teamId,
      email: _.user.email,
      firstname: _.user.firstname,
      lastname: _.user.lastname,
      display: _.user.display,
      pictureURL: _.user.picture,
    }))
    return res.status(200).send(userOptions)
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getUserOptions', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getUserOptionsforSocket = async (
  params: string
) => {
  try {
    const organizationUser = await organizationUserModel.getUsers(
      params
    )
    const userOptions = organizationUser.map((_) => ({
      id: _.userId,
      role: _.role,
      teamId: _.teamId,
      email: _.user.email,
      firstname: _.user.firstname,
      lastname: _.user.lastname,
      display: _.user.display,
      pictureURL: _.user.picture,
    }))
    return userOptions
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getUserOptions', error)
    return "error500"
  }
}

export const getChannels = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const channels = await channelModel.getChannels(organization)

    // Convert to channel  object
    const result = channels.map((_) => {
      let data = null
      if (_.channel) {
        switch (_.channel) {
          case CHANNEL.LINE:
            data = _.line
            break
          case CHANNEL.FACEBOOK:
            data = _.facebook
            break
          case CHANNEL.INSTAGRAM:
            data = _.instagram
            break
          default:
            break
        }
      }
      return {
        id: _.id,
        channel: _.channel,
        createdAt: _.createdAt,
        createdById: _.createdById,
        name: data?.name,
      }
    })
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getChannels', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getLabelOptions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const labels = await labelModel.getLabels(organization)
    return res.status(200).send(labels)
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getUserOptions', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getLabelOptionsforSocket = async (
  params: string
) => {
  const _organization = await organizationModel.getOrganizationWithId(params)
  try {
    if (_organization != undefined) {
      const labels = await labelModel.getLabels(_organization)
      return labels
    }
    else return "error500"
  } catch (error) {
    errorMessage('CONTROLLER', 'chat', 'getUserOptions', error)
    return "error500"
  }
}