import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  OrganizationEntity,
  organizationUserModel,
  organizationModel,
  UserEntity,
  userModel
} from '../../model/organization'

import {
  ScrumboardBoardEntity,
  ScrumboardBoardModel,
  ScrumboardCardEntity,
  ScrumboardCardLabelEntity,
  ScrumboardCardModel,
  ScrumboardLabelEntity,
  ScrumboardListChatEntity,
  ScrumboardListChatModel,
  ScrumboardListCustomerLabelEntity,
  ScrumboardListEntity,
  ScrumboardListModel,
} from '../../model/scrumboard'
import { gcsService } from '../../service/google'
import { ChatEntity, chatModel } from '../../model/chat'

export const getBoards = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  // const requester: UserEntity = req.body.requester
  const rawBoards = await ScrumboardBoardModel.getBoards(organization)

  const boards = await Promise.all(
    rawBoards.map((board) => {
      const members = board.boardMembers.map(
        (boardMember) => boardMember.memberId,
      )
      return {
        id: board.id,
        title: board.title,
        description: board.description,
        settings: board.settings,
        lastActivity: board.createdAt || board.updatedAt,
        members,
      }
    }),
  )

  return res.status(201).send(boards)
}
export const getBoardsforSocket = async (
  orgId: string
) => {
  const organization = await organizationModel.getOrganizationWithId(orgId)

  // const requester: UserEntity = req.body.requester
  if (organization != undefined) {
    const rawBoards = await ScrumboardBoardModel.getBoards(organization)

    const boards = await Promise.all(
      rawBoards.map((board) => {
        const members = board.boardMembers.map(
          (boardMember) => boardMember.memberId,
        )
        return {
          id: board.id,
          title: board.title,
          description: board.description,
          settings: board.settings,
          lastActivity: board.createdAt || board.updatedAt,
          members,
        }
      }),
    )

    return boards
  }
  else return ""

}

export const getBoard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { boardId } = req.params

  if (!boardId || typeof boardId !== 'string') {
    errorMessage('CONTROLLER', 'getBoard', 'invalid parameter(boardId)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  // Get board detail with Id
  const board = await ScrumboardBoardModel.getBoardWithId(boardId, organization)
  if (!board) {
    errorMessage('CONTROLLER', 'board', 'board not found')
    return next(new HttpException(404, 'board not found'))
  }

  return res
    .status(201)
    .send(await convertBoardToResultObject(board, requester))
}

export const createBoard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { board } = req.body
  if (!board || board.id) {
    errorMessage('CONTROLLER', 'board', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    const newBoard = new ScrumboardBoardEntity()
    newBoard.title = board.title
    newBoard.description = board.description
    newBoard.settings = {
      subscribed: board.settings.subscribed,
      cardCoverImages: board.settings.cardCoverImages,
    }
    newBoard.organization = organization
    newBoard.createdBy = requester

    const saveResult = await ScrumboardBoardModel.saveBoard(newBoard)
    if (!saveResult) {
      errorMessage('CONTROLLER', 'create board', 'board not create')
      return next(new HttpException(404, 'board not create'))
    }

    return res.status(201).send({ id: saveResult.id })
  } catch (error) {
    errorMessage('CONTROLLER', 'board', 'createBoard', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const createBoardforSocket = async (
  params: any
) => {
  const { board, reqid, orgId } = params
  if (!board || board.id) {
    errorMessage('CONTROLLER', 'board', 'invalid data')
    return "error400"
  }

  const requester = await userModel.getUserWithId(reqid)
  const organization = await organizationModel.getOrganizationWithId(orgId)


  try {
    const newBoard = new ScrumboardBoardEntity()
    newBoard.title = board.title
    newBoard.description = board.description
    newBoard.settings = {
      subscribed: board.settings.subscribed,
      cardCoverImages: board.settings.cardCoverImages,
    }
    if ((organization != undefined) && (requester != undefined)) {
      newBoard.organization = organization
      newBoard.createdBy = requester

      const saveResult = await ScrumboardBoardModel.saveBoard(newBoard)
      if (!saveResult) {
        errorMessage('CONTROLLER', 'create board', 'board not create')
        return "error400"
      }

      return { id: saveResult.id }
    }

  } catch (error) {
    errorMessage('CONTROLLER', 'board', 'createBoard', error)
    return "error400"
  }
}

export const updateBoard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester
    const boardId = req.params.boardId
    const { data } = req.body

    if (!boardId || !data) {
      errorMessage('CONTROLLER', 'update board data', 'invalid data')
      return next(new HttpException(400, ErrorCode[400]))
    }

    await ScrumboardBoardModel.saveBoard({
      ...data,
      id: boardId,
      updatedBy: requester,
    } as ScrumboardBoardEntity)

    // Get board detail with Id
    const board = await ScrumboardBoardModel.getBoardWithId(
      boardId,
      organization,
    )
    if (!board) {
      errorMessage('CONTROLLER', 'board', 'board not found')
      return next(new HttpException(404, 'board not found'))
    }

    return res
      .status(201)
      .send(await convertBoardToResultObject(board, requester))
  } catch (error) {
    errorMessage('CONTROLLER', 'update board data', 'update board data', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteBoard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester
    const { boardId } = req.params
    if (!boardId) {
      errorMessage('CONTROLLER', 'board delete', 'invalid data')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const boardData = (await ScrumboardBoardModel.getBoardWithId(
      boardId,
      organization,
    )) as ScrumboardBoardEntity
    if (!boardData) {
      errorMessage('CONTROLLER', 'board delete', 'board not found')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const updateResult = await ScrumboardBoardModel.deleteBoard(
      boardId,
      requester,
    )
    if (updateResult) {
      return res.status(200).send(true)
    }
    if (!updateResult) {
      errorMessage('CONTROLLER', 'update board setting', 'fail board update')
      return next(new HttpException(400, ErrorCode[400]))
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'board delete', 'board delete', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

// Members
export const getMembers = async (
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
    return res.status(200).send(
      result.map((userOrg) => ({
        id: userOrg.userId,
        display: userOrg.user.display,
        email: userOrg.user.email,
        isOnline: userOrg.user.isOnline,
        pictureURL:
          userOrg.user.picture &&
            JSON.parse(userOrg.user.picture) &&
            JSON.parse(userOrg.user.picture).filename
            ? gcsService.getUserProfileURL(
              userOrg.user.id,
              JSON.parse(userOrg.user.picture).filename,
            )
            : undefined,
      })),
    )
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'getUsers', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

/**
 * Utils function
 */
const convertBoardToResultObject = async (
  board: ScrumboardBoardEntity,
  requester: UserEntity,
) => {
  // Get board members
  const members = board.boardMembers.map((boardMember) => boardMember.memberId)

  // Get All list on board
  const rawLists = await ScrumboardListModel.getLists(board.id)

  // Convert list and card to ListId and CardId
  const lists = await Promise.all(
    rawLists.map(async (list) => {
      // Create new ListChat from chat update date
      const chats = await getChats(
        list.chatType,
        list.listCustomerLabel,
        list.organization,
        requester,
      )

      // console.log('chat ',chats.map((chat) => chat.id))

      const listChatFromChats = await Promise.all(
        chats.map(async (chat, index) => {
          // Check Card with chat
          let card = await ScrumboardCardModel.getCardWithChatId(chat.id)
          if (!card) {
            // Create new card for Chat
            card = await ScrumboardCardModel.saveCard({
              ...new ScrumboardCardEntity(),
              title: '',
              description: '',
              orderIndex: index,
              boardId: list.boardId,
              listId: list.id,
              createdBy: requester,
              organization: list.organization,
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
              orderIndex: currentListChat.orderIndex,
            }
          } else {
            // New ListChat
            const newListChat = await ScrumboardListChatModel.saveListChat({
              ...new ScrumboardListChatEntity(),
              boardId: board.id,
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

      const cardNoChat = list.cards.filter((card) => card.chatId === null)
      // console.log('[listChatFromChats] ',listChatFromChats.map((el)=> el.id))
      // console.log('[cardNoChat] ',cardNoChat.map((el)=> el.id))
      const allCards = [...listChatFromChats, ...cardNoChat]
      allCards.sort((a, b) => {
        return a.orderIndex - b.orderIndex
      })

      const cardIds = allCards.map((card) => card.id)
      return { id: list.id, cards: cardIds }
    }),
  )

  return {
    id: board.id,
    title: board.title,
    description: board.description,
    settings: board.settings,
    lastActivity: board.createdAt || board.updatedAt,
    lists,
    members,
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
      return labels.some((element) => labelIds.includes(element.labelId))
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
