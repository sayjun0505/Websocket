import { NextFunction, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { ChatEntity, chatModel } from '../../model/chat'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'
import { ScrumboardListCustomerLabelEntity } from '../../model/scrumboard/listCustomerLabel.entity'

import {
  ScrumboardCardEntity,
  ScrumboardCardModel,
  ScrumboardListChatEntity,
  ScrumboardListChatModel,
  ScrumboardListCustomerLabelModel,
  ScrumboardListEntity,
  ScrumboardListModel,
} from '../../model/scrumboard'
import { gcsService } from '../../service/google'

export const getLists = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  const { boardId } = req.params
  const rawLists = await ScrumboardListModel.getLists(boardId)

  rawLists.sort((a, b) => {
    return a.orderIndex - b.orderIndex
  })

  const lists = await Promise.all(
    rawLists.map(async (list) => {
      let labels = null
      if (list.listCustomerLabel && list.listCustomerLabel.length > 0) {
        labels = list.listCustomerLabel.map((label) => ({
          id: label.labelId,
          label: label.label.label,
        }))
      }

      return {
        // Basic
        id: list.id,
        title: list.title,
        boardId,
        // Fox chat option
        chatType: list.chatType,
        chatLabel: labels,
        // createdAt: saveList.createdAt,
      }
    }),
  )
  return res.status(201).send(lists)
}

export const createList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { boardId } = req.params
  const { title, chatType, chatLabel } = req.body.data
  console.log('[List] ', req.body.data)
  if (!boardId || !title) {
    errorMessage('CONTROLLER', 'create board list', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Get order index for new List
    const maxOrderIndex = await ScrumboardListModel.getMaxOrderIndex(boardId)

    // Save new list
    const saveList = await ScrumboardListModel.saveList({
      ...new ScrumboardListEntity(),
      title,
      chatType,
      // listCustomerLabel: chatLabel,
      orderIndex: maxOrderIndex,
      boardId,
      organization,
      createdBy: requester,
    })

    await ScrumboardListCustomerLabelModel.deleteCustomerLabels(saveList.id)
    // Save Label
    if (chatLabel && chatLabel.length > 0) {
      await ScrumboardListCustomerLabelModel.saveCustomerLabels(
        chatLabel.map(
          (label: { id: string }) =>
            ({
              ...new ScrumboardListCustomerLabelEntity(),
              listId: saveList.id,
              labelId: label.id,
            } as ScrumboardListCustomerLabelEntity),
        ),
      )
    }

    return res
      .status(201)
      .send(
        await convertListToResultObject(
          saveList,
          boardId,
          chatLabel,
          chatType,
          organization,
          requester,
        ),
      )
  } catch (error) {
    errorMessage('CONTROLLER', 'create board list', 'createList', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester
    const { boardId, listId } = req.params
    const { title, chatType, chatLabel } = req.body.data

    console.log('[List] ', req.body.data)

    if (!boardId || !listId || !title) {
      errorMessage('CONTROLLER', 'update board data', 'invalid data')
      return next(new HttpException(400, ErrorCode[400]))
    }

    // Update List
    const saveList = await ScrumboardListModel.saveList({
      ...new ScrumboardListEntity(),
      id: listId,
      title,
      chatType,
      boardId,
      updatedBy: requester,
    })

    await ScrumboardListCustomerLabelModel.deleteCustomerLabels(saveList.id)
    // Save Label
    if (chatLabel && chatLabel.length > 0) {
      await ScrumboardListCustomerLabelModel.saveCustomerLabels(
        chatLabel.map(
          (label: { id: string }) =>
            ({
              ...new ScrumboardListCustomerLabelEntity(),
              listId: saveList.id,
              labelId: label.id,
            } as ScrumboardListCustomerLabelEntity),
        ),
      )
    }

    return res
      .status(201)
      .send(
        await convertListToResultObject(
          saveList,
          boardId,
          chatLabel,
          chatType,
          organization,
          requester,
        ),
      )
  } catch (error) {
    errorMessage('CONTROLLER', 'update board data', 'update board data', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requester: UserEntity = req.body.requester
    const { boardId, listId } = req.params

    if (!boardId || !listId) {
      errorMessage('CONTROLLER', 'update board data', 'invalid data')
      return next(new HttpException(400, ErrorCode[400]))
    }

    await ScrumboardListModel.deleteList(listId, requester)

    const cards = await ScrumboardCardModel.getCardsWithListId(listId)
    cards.forEach((card) => {
      ScrumboardCardModel.deleteCard(card.id, requester)
    })

    const rawLists = await ScrumboardListModel.getLists(boardId)

    // Update Order Index
    rawLists.forEach((list: ScrumboardListEntity) => {
      ScrumboardListModel.updateOrderIndex(list.id, list.orderIndex, requester)
    })

    // Delete List Chat relation
    await ScrumboardListChatModel.deleteListChats(listId)

    return res.status(200).send(listId)
  } catch (error) {
    errorMessage('CONTROLLER', 'update board data', 'update board data', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateListsOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester
    const { boardId } = req.params
    const lists = req.body.data

    if (!boardId || !lists || !lists.length) {
      errorMessage('CONTROLLER', 'update board list order', 'invalid data')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const listsOrder = lists.map((list: { id: any }, index: any) => ({
      id: list.id,
      orderIndex: index,
    }))
    for (const list of listsOrder) {
      await ScrumboardListModel.updateOrderIndex(
        list.id,
        list.orderIndex,
        requester,
      )
    }

    const rawLists = await ScrumboardListModel.getListsAndCards(boardId)
    rawLists.sort((a, b) => {
      return a.orderIndex - b.orderIndex
    })
    const newLists = await Promise.all(
      rawLists.map(async (list) => {
        // convert listChat to Card
        const cardFromListChat = await Promise.all(
          list.listChat.map(async (listChat) => {
            const card = await ScrumboardCardModel.getCardWithChatId(
              listChat.chatId,
            )
            if (!card) {
              // Create new card for Chat
              await ScrumboardCardModel.saveCard({
                ...new ScrumboardCardEntity(),
                title: listChat.chat.customer.display || '',
                description: '',
                orderIndex: 0,
                boardId: list.boardId,
                listId: list.id,
                createdBy: list.createdBy,
                organization: list.organization,
                chatId: listChat.chatId,
              })
              return {
                id: listChat.id,
                orderIndex: listChat.orderIndex,
              }
            } else {
              return {
                id: listChat.id,
                orderIndex: listChat.orderIndex,
              }
            }
          }),
        )

        const cardAndListChat = [...list.cards, ...cardFromListChat]
        cardAndListChat.sort((a, b) => {
          return a.orderIndex - b.orderIndex
        })
        const cardIds = cardAndListChat.map((card) => card.id)
        return { id: list.id, cards: cardIds }
      }),
    )
    return res.status(201).send(newLists)
  } catch (error) {
    errorMessage(
      'CONTROLLER',
      'update board list order',
      'update board data',
      error,
    )
    return next(new HttpException(500, ErrorCode[500]))
  }
}

/**
 * Utils function
 */
const convertListToResultObject = async (
  list: ScrumboardListEntity,
  boardId: string,
  chatLabel: ScrumboardListCustomerLabelEntity[],
  chatType: string,
  organization: OrganizationEntity,
  requester: UserEntity,
) => {
  // Get Customer Label
  const rawCustomerLabels = await ScrumboardListCustomerLabelModel.getCustomerLabels(list.id)
  const labels = rawCustomerLabels.map((label) => ({
    id: label.labelId,
    label: label.label.label,
  }))

  // Get Current Chat record same with Chat list
  let cardIds = null
  if (chatType) {
    const chats = await getChats(chatType, chatLabel, organization, requester)
    const listChatFromChats = await Promise.all(
      chats.map(async (chat, index) => {
        // Check Card with chat
        let card = await ScrumboardCardModel.getCardWithChatId(chat.id)
        if (!card) {
          // Create new card for Chat
          card = await ScrumboardCardModel.saveCard({
            ...new ScrumboardCardEntity(),
            title: chat.customer.display || '',
            description: '',
            orderIndex: 0,
            boardId,
            listId: list.id,
            createdBy: requester,
            organization,
            chatId: chat.id,
          })
        }

        // Check current list Chat
        const currentListChat =
          await ScrumboardListChatModel.getListChatWithListIdChatId(
            list.id,
            chat.id,
          )
        if (currentListChat) {
          return {
            id: currentListChat.id,
            orderIndex: index,
          }
        } else {
          // New ListChat
          const newListChat = await ScrumboardListChatModel.saveListChat({
            ...new ScrumboardListChatEntity(),
            boardId,
            listId: list.id,
            chatId: chat.id,
            orderIndex: index,
          })
          return {
            id: newListChat.id,
            orderIndex: index,
          }
        }
      }),
    )
    cardIds = listChatFromChats.map((card) => card.id)
  }

  const cards = await ScrumboardCardModel.getCardsWithListId(list.id)
  cardIds = [...(cardIds || []), ...cards.map((card) => card.id)]

  return {
    // Basic
    id: list.id,
    title: list.title,
    boardId,
    // Fox chat option
    chatType,
    chatLabel: labels,
    cards: cardIds,
    // createdAt: saveList.createdAt,
  }
}

const getChats = async (
  type: string,
  labels: ScrumboardListCustomerLabelEntity[],
  organization: OrganizationEntity,
  requester: UserEntity,
) => {
  if (!type || typeof type !== 'string') {
    return []
  }

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
    default:
      chats = await chatModel.getChats(organization)
      break
  }

  if (!chats) {
    return []
  }

  // filter Label
  if (labels && labels.length > 0) {
    chats = await chats.filter((chat) => {
      const labelsObj = chat.customer.customerLabel
      // no label
      if (!labelsObj || labelsObj.length <= 0) {
        return false
      }
      // Get Label text from Object
      const labelIds = labelsObj.map((element) => element.id)

      // Return with SOME label
      return labels.some((element) => labelIds.includes(element.id))
    })
  }

  // Convert Chats
  const convertChats = await chats.map((chat) => {
    chat.message.sort((a, b) => {
      return a.createdAt.getTime() - b.createdAt.getTime()
    })

    const lastMessage = chat.message[chat.message.length - 1]
    const unread = chat.message.filter((msg) => !msg.isRead).length

    const newMention =
      chat.mention.filter(
        (mention) => !mention.isRead && mention.user.id === requester.id,
      ).length > 0

    if (chat.customer && chat.customer.picture) {
      const picture = gcsService.getCustomerDisplayURL(
        organization.id,
        chat.channel.id,
        chat.customer.uid,
        chat.customer.picture,
      )

      return {
        ...chat,
        customer: {
          ...chat.customer,
          pictureURL: picture,
        },
        newMention,
        lastMessage,
        unread: unread > 0 ? unread : null,
      }
    } else {
      return {
        ...chat,
        lastMessage,
        newMention,
        unread: unread > 0 ? unread : null,
      }
    }
  })

  const lastMsgUnRead = convertChats.filter(
    (chat) => chat.lastMessage && !chat.lastMessage.isRead,
  )
  const lastMsgRead = convertChats.filter(
    (chat) => chat.lastMessage && chat.lastMessage.isRead,
  )

  lastMsgUnRead.sort((a, b) => {
    return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
  })
  lastMsgRead.sort((a, b) => {
    return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
  })

  return [...lastMsgUnRead, ...lastMsgRead]
}
