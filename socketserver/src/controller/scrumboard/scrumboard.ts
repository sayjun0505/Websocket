// import e, { NextFunction, Request, Response } from 'express'
// import {
//   ErrorCode,
//   errorMessage,
//   HttpException,
// } from '../../middleware/exceptions'
// import {
//   OrganizationEntity,
//   UserEntity,
//   userModel,
// } from '../../model/organization'
// import { gcsService } from '../../service/google'
// import { lineService } from '../../service/channel'

// import {
//   attachmentModel,
//   BoardEntity,
//   BoardLabelEntity,
//   boardLabelModel,
//   boardModel,
//   CardActivityEntity,
//   cardActivityModel,
//   CardAttachmentEntity,
//   CardEntity,
//   CardMemberEntity,
//   cardMemberModel,
//   cardModel,
//   ChecklistEntity,
//   ChecklistItemEntity,
//   checklistItemModel,
//   checklistModel,
//   commentModel,
//   ListEntity,
//   listModel,
// } from '../../model/scrumboard'

// import {
//   ChatCommentEntity,
//   ChatEntity,
//   chatModel,
//   CHAT_COMMENT_TYPE,
//   CHAT_STATUS,
//   mentionModel,
//   MessageEntity,
//   messageModel,
//   MESSAGE_TYPE,
// } from '../../model/chat'
// import {
//   TodoEntity,
//   TodoLabelEntity,
//   todoLabelModel,
//   todoModel,
// } from '../../model/todos'
// import { CHANNEL } from '../../model/channel'
// import {
//   CustomerEntity,
//   CustomerLabelEntity,
//   customerModel,
//   labelModel,
// } from '../../model/customer'

// const MESSAGE_COUNT: number = 20
// const CARD_COUNT: number = 5

// export const createScrumboard = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { board } = req.body
//   if (!board || board.id) {
//     errorMessage('CONTROLLER', 'board', 'invalid data')
//     return next(new HttpException(400, ErrorCode[400]))
//   }

//   const organization: OrganizationEntity = req.body.organization
//   const requester: UserEntity = req.body.requester

//   try {
//     const newBoard = new BoardEntity()
//     newBoard.title = board.title
//     // newBoard.uri = board.uri
//     newBoard.settings = {
//       color: board.settings.color,
//       subscribed: board.settings.subscribed,
//       cardCoverImages: board.settings.cardCoverImages,
//     }
//     newBoard.organization = organization
//     newBoard.createdBy = requester

//     const saveResult = await boardModel.saveBoard(newBoard)
//     if (!saveResult) {
//       errorMessage('CONTROLLER', 'create board', 'board not create')
//       return next(new HttpException(404, 'board not create'))
//     }
//     // const boardList = await boardModel.getBoards(organization)

//     return res.status(201).send(saveResult)
//   } catch (error) {
//     errorMessage('CONTROLLER', 'board', 'createBoard', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const renameScrumboard = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const boardId = req.body.boardId
//   const boardTitle = req.body.boardTitle

//   if (!boardId || !boardTitle) {
//     errorMessage('CONTROLLER', 'rename board', 'invalid data')
//     return next(new HttpException(400, ErrorCode[400]))
//   }

//   const organization: OrganizationEntity = req.body.organization
//   const requester: UserEntity = req.body.requester

//   try {
//     let boardItem = (await boardModel.getBoardWithId(
//       boardId,
//       organization,
//     )) as BoardEntity
//     if (!boardItem) {
//       errorMessage('CONTROLLER', 'rename board', 'invalid boardId')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     const updateResult = await boardModel.updateBoardName(
//       boardId,
//       boardTitle,
//       requester,
//     )
//     if (!updateResult) {
//       errorMessage('CONTROLLER', 'update board', 'board not update')
//       return next(new HttpException(404, 'board not update'))
//     }

//     return res.status(201).send(boardTitle)
//   } catch (error) {
//     errorMessage('CONTROLLER', 'update board', 'updateBoard', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const renameListTitle = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const boardId = req.body.boardId
//   const listId = req.body.listId
//   const listTitle = req.body.listTitle
//   const chatLabels = req.body.chatLabels
//   const chatType = req.body.chatType

//   if (!boardId || !listId || !listTitle) {
//     errorMessage('CONTROLLER', 'rename List Title', 'invalid data')
//     return next(new HttpException(400, ErrorCode[400]))
//   }

//   const organization: OrganizationEntity = req.body.organization
//   const requester: UserEntity = req.body.requester

//   try {
//     let listItem = (await listModel.getlistWithId(
//       listId,
//       organization,
//     )) as ListEntity
//     if (!listItem) {
//       errorMessage('CONTROLLER', 'rename List Title', 'invalid listId')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     const updateResult = await listModel.updateListName(
//       listId,
//       listTitle,
//       chatType,
//       chatLabels,
//     )
//     if (!updateResult) {
//       errorMessage('CONTROLLER', 'update board', 'board not update')
//       return next(new HttpException(404, 'board not update'))
//     }

//     await listModel.updateListPageNumber(listId, 0)

//     let boardData = await getBoardData(boardId, organization, requester)

//     return res.status(201).send(boardData)
//   } catch (error) {
//     errorMessage('CONTROLLER', 'update List Title', 'renameListTitle', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const getScrumboardList = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const organization: OrganizationEntity = req.body.organization
//   // const requester: UserEntity = req.body.requester
//   const boardList = (await boardModel.getBoards(organization)) as BoardEntity[]

//   for (let i = 0; i < boardList.length; i++) {
//     for (let j = 0; j < boardList[i].lists.length; j++) {
//       await listModel.updateListPageNumber(boardList[i].lists[j].id, 0)
//     }
//   }

//   return res.status(201).send(boardList)
// }

// export const getScrumboardByID = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { boardId } = req.params
//   // const boardID = req.body.params.boardId
//   // const pageNumber = req.body.params.pageNumber
//   // const chagenListId = req.body.params.chagenListId

//   console.log('[Board] ', boardId)
//   if (!boardId || typeof boardId !== 'string') {
//     errorMessage(
//       'CONTROLLER',
//       'getScrumboardByID',
//       'invalid parameter(boardId)',
//     )
//     return next(new HttpException(400, ErrorCode[400]))
//   }
//   const organization: OrganizationEntity = req.body.organization
//   const requester: UserEntity = req.body.requester

//   const board = await getBoardData(
//     boardId,
//     organization,
//     requester,
//     // pageNumber,
//     // chagenListId,
//   )

//   if (!board) {
//     errorMessage('CONTROLLER', 'board', 'board not found')
//     return next(new HttpException(404, 'board not found'))
//   }

//   return res.status(201).send(board)
// }

// export const getBoardData = async (
//   boardID: string,
//   organization: OrganizationEntity,
//   requester: UserEntity,
//   pageNumber: number = 0,
//   chagenListId: string = '',
// ) => {
//   const board = (await boardModel.getBoardWithId(
//     boardID,
//     organization,
//   )) as BoardEntity

//   board.lists.sort(function (a, b) {
//     return a.orderIndex - b.orderIndex
//   })

//   for (let i = 0; i < board.lists.length; i++) {
//     let chatType = board.lists[i].chatType
//     let chatLabels = board.lists[i].chatLabels

//     const oldCards = await cardModel.getChatCardsWithList(
//       board.lists[i],
//       organization,
//     )
//     for (let j = 0; j < oldCards.length; j++) {
//       let item = oldCards[j] as CardEntity
//       item.isDelete = true
//       await cardModel.saveCard(item)
//     }

//     const chats = await getChats(chatType, chatLabels, organization, requester)
//     for (let j = 0; j < chats.length; j++) {
//       let tempCard = await cardModel.getCardWithChatId(
//         chats[j].id,
//         board.lists[i],
//         organization,
//       )
//       if (tempCard) {
//         tempCard.list = board.lists[i]
//         tempCard.isDelete = false
//         await cardModel.saveCard(tempCard)
//       }
//       if (!tempCard) {
//         let cardItem = new CardEntity()
//         cardItem.board = board
//         cardItem.list = board.lists[i]
//         cardItem.chatId = chats[j].id
//         cardItem.organization = organization
//         cardItem.createdBy = requester
//         cardItem.orderIndex =
//           (await cardModel.getMaxOrderIndex(board.lists[i], organization)) + 1
//         await cardModel.saveCard(cardItem)
//       }
//     }

//     let listCards = (await cardModel.getCardsWithListId(
//       board.lists[i],
//       organization,
//     )) as CardEntity[]
//     board.lists[i].idCards = []
//     listCards.map((e) => board.lists[i].idCards.push(e))

//     for (let j = 0; j < board.lists[i].idCards.length; j++) {
//       let cardItem = board.lists[i].idCards[j] as CardEntity
//       let cardData = (await getCardData(
//         cardItem.id,
//         organization,
//       )) as CardEntity
//       if (cardData) {
//         board?.cards.push(cardData)
//       }
//     }

//     let _pageNumber = board.lists[i].pageNumber
//     if (chagenListId.length > 0 && chagenListId == board.lists[i].id) {
//       _pageNumber = pageNumber + 1
//       board.lists[i].pageNumber = _pageNumber
//       await listModel.updateListPageNumber(board.lists[i].id, _pageNumber)
//     }
//     let totalCardCnt = board.lists[i].idCards.length

//     let _listCards = board.lists[i].idCards.slice(
//       0,
//       _pageNumber * CARD_COUNT + CARD_COUNT,
//     )

//     let remainCount = totalCardCnt - _pageNumber * CARD_COUNT
//     board.lists[i].remainCount = remainCount
//     board.lists[i].idCards = _listCards
//   }

//   board.members = (await userModel.getUsers()) as UserEntity[]
//   // board.labels = (await todoLabelModel.getLabels(
//   //   organization,
//   // )) as TodoLabelEntity[]

//   for (let i = 0; i < board.lists.length; i++) {
//     for (let j = 0; j < board.lists[i].idCards.length; j++) {
//       if (board.lists[i].idCards[j].chatId.length > 0) {
//         let _chat = (await getChat(
//           board.lists[i].idCards[j].chatId,
//           organization,
//           requester,
//         )) as ChatEntity
//         // board.chats.push(_chat)
//       }
//     }
//   }

//   return board
// }

// export const getCardData = async (
//   cardID: string,
//   organization: OrganizationEntity,
// ) => {
//   let cardData = (await cardModel.getCardWithId(
//     cardID,
//     organization,
//   )) as CardEntity
//   if (!cardData) {
//     return null
//   }
//   cardData.activities.sort(function (a, b) {
//     return b.createdAt.getTime() - a.createdAt.getTime()
//   })
//   let idMembers = await cardMemberModel.getCardMembers(cardData.id)
//   if (idMembers) {
//     for (let i = 0; i < idMembers.length; i++) {
//       cardData.idMembers.push(idMembers[i].memberId)
//     }
//   }
//   let idLabels = await boardLabelModel.getLabelsWithCardId(cardData.id)
//   for (let i = 0; i < idLabels.length; i++) {
//     cardData.idLabels.push(idLabels[i].labelId)
//   }

//   return cardData
// }

// export const createScrumboardList = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const boardId = req.body.boardId
//   const listTitle = req.body.listTitle
//   const chatType = req.body.chatType
//   const labelSelect = req.body.labelSelect

//   if (!boardId || !listTitle) {
//     errorMessage('CONTROLLER', 'create board list', 'invalid data')
//     return next(new HttpException(400, ErrorCode[400]))
//   }

//   const organization: OrganizationEntity = req.body.organization
//   const requester: UserEntity = req.body.requester

//   try {
//     let boardItem = (await boardModel.getBoardWithId(
//       boardId,
//       organization,
//     )) as BoardEntity
//     let listItem = new ListEntity()
//     listItem.name = listTitle
//     listItem.chatType = chatType
//     listItem.chatLabels = labelSelect
//     listItem.board = boardItem
//     listItem.organization = organization
//     listItem.createdBy = requester
//     listItem.orderIndex =
//       (await listModel.getMaxOrderIndex(organization, boardItem)) + 1

//     const saveResult = (await listModel.savelist(listItem)) as ListEntity

//     if (!saveResult) {
//       errorMessage('CONTROLLER', 'create board list', 'board list not create')
//       return next(new HttpException(404, 'board list not create'))
//     }

//     let chats = await getChats(chatType, labelSelect, organization, requester)

//     for (let i = 0; i < chats.length; i++) {
//       let cardItem = new CardEntity()
//       cardItem.board = boardItem
//       cardItem.list = saveResult
//       cardItem.chatId = chats[i].id
//       cardItem.organization = organization
//       cardItem.createdBy = requester
//       cardItem.orderIndex =
//         (await cardModel.getMaxOrderIndex(saveResult, organization)) + 1
//       await cardModel.saveCard(cardItem)
//     }

//     let boardData = await getBoardData(boardId, organization, requester)

//     return res.status(201).send(boardData.lists)
//   } catch (error) {
//     errorMessage('CONTROLLER', 'create board list', 'createBoardList', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const getChat = async (
//   chatId: string,
//   organization: OrganizationEntity,
//   requester: UserEntity,
// ) => {
//   let chats = (await chatModel.getChatsWithId(
//     chatId,
//     organization,
//   )) as ChatEntity[]

//   if (!chats) {
//     return []
//   }

//   // Convert Chats
//   const convertChats = await chats.map((chat) => {
//     chat.message.sort((a, b) => {
//       return a.createdAt.getTime() - b.createdAt.getTime()
//     })

//     const lastMessage = chat.message[chat.message.length - 1]
//     const unread = chat.message.filter((msg) => !msg.isRead).length

//     const newMention =
//       chat.mention.filter(
//         (mention) => !mention.isRead && mention.user.id === requester.id,
//       ).length > 0

//     if (chat.customer && chat.customer.picture) {
//       const picture = gcsService.getCustomerDisplayURL(
//         organization.id,
//         chat.channel.id,
//         chat.customer.uid,
//         chat.customer.picture,
//       )

//       return {
//         ...chat,
//         customer: {
//           ...chat.customer,
//           pictureURL: picture,
//         },
//         newMention,
//         lastMessage,
//         unread: unread > 0 ? unread : null,
//       }
//     } else {
//       return {
//         ...chat,
//         lastMessage,
//         newMention,
//         unread: unread > 0 ? unread : null,
//       }
//     }
//   })

//   const lastMsgUnRead = convertChats.filter(
//     (chat) => chat.lastMessage && !chat.lastMessage.isRead,
//   )

//   const lastMsgRead = convertChats.filter(
//     (chat) => chat.lastMessage && chat.lastMessage.isRead,
//   )

//   lastMsgUnRead.sort((a, b) => {
//     return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
//   })
//   lastMsgRead.sort((a, b) => {
//     return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
//   })

//   let chatResults = [...lastMsgUnRead, ...lastMsgRead]

//   return chatResults[0]
// }

// export const getChats = async (
//   type: string,
//   label: string,
//   organization: OrganizationEntity,
//   requester: UserEntity,
// ) => {
//   if (!type || typeof type !== 'string') {
//     return []
//   }

//   let chats: ChatEntity[]
//   switch (type.toLowerCase()) {
//     case 'resolve':
//       chats = await chatModel.getChatsAllResolve(organization)
//       break
//     case 'active':
//       chats = await chatModel.getChatsAllActive(organization)
//       break
//     case 'unassign':
//       chats = await chatModel.getChatsAllUnassign(organization)
//       break
//     case 'assignee':
//       chats = await chatModel.getChatsAllMyOwner(requester, organization)
//       break
//     case 'followup':
//       chats = await chatModel.getChatsAllMyFollowup(requester, organization)
//       break
//     case 'spam':
//       chats = await chatModel.getChatsAllSpam(requester, organization)
//       break
//     case 'mention':
//       chats = await chatModel.getChatsAllMyMention(requester, organization)
//       break
//     case 'line':
//       chats = await chatModel.getChatsAllActiveLineChannel(organization)
//       break
//     case 'facebook':
//       chats = await chatModel.getChatsAllActiveFacebookChannel(organization)
//       break
//     default:
//       chats = await chatModel.getChats(organization)
//       break
//   }

//   if (!chats) {
//     return []
//   }

//   // filter Label
//   if (label && typeof label === 'string') {
//     const inputLabel = label.split(',')
//     chats = await chats.filter((chat, index) => {
//       const labelsObj = chat.customer.customerLabel
//       // no label
//       if (!labelsObj || labelsObj.length <= 0) {
//         return false
//       }
//       // Get Label text from Object
//       const labels = labelsObj.map((element) => element.label)

//       // Return with SOME label
//       return inputLabel.some((element) => labels.includes(element))
//     })
//   }

//   // Convert Chats
//   const convertChats = await chats.map((chat) => {
//     chat.message.sort((a, b) => {
//       return a.createdAt.getTime() - b.createdAt.getTime()
//     })

//     const lastMessage = chat.message[chat.message.length - 1]
//     const unread = chat.message.filter((msg) => !msg.isRead).length

//     const newMention =
//       chat.mention.filter(
//         (mention) => !mention.isRead && mention.user.id === requester.id,
//       ).length > 0

//     if (chat.customer && chat.customer.picture) {
//       const picture = gcsService.getCustomerDisplayURL(
//         organization.id,
//         chat.channel.id,
//         chat.customer.uid,
//         chat.customer.picture,
//       )

//       return {
//         ...chat,
//         customer: {
//           ...chat.customer,
//           pictureURL: picture,
//         },
//         newMention,
//         lastMessage,
//         unread: unread > 0 ? unread : null,
//       }
//     } else {
//       return {
//         ...chat,
//         lastMessage,
//         newMention,
//         unread: unread > 0 ? unread : null,
//       }
//     }
//   })

//   const lastMsgUnRead = convertChats.filter(
//     (chat) => chat.lastMessage && !chat.lastMessage.isRead,
//   )

//   const lastMsgRead = convertChats.filter(
//     (chat) => chat.lastMessage && chat.lastMessage.isRead,
//   )

//   lastMsgUnRead.sort((a, b) => {
//     return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
//   })
//   lastMsgRead.sort((a, b) => {
//     return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
//   })

//   let chatResults = [...lastMsgUnRead, ...lastMsgRead]

//   return chatResults
// }

// export const createCard = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const boardId = req.body.boardId
//   const listId = req.body.listId
//   const cardTitle = req.body.cardTitle

//   if (!boardId || !listId || !cardTitle) {
//     errorMessage('CONTROLLER', 'create card', 'invalid data')
//     return next(new HttpException(400, ErrorCode[400]))
//   }

//   const organization: OrganizationEntity = req.body.organization
//   const requester: UserEntity = req.body.requester

//   try {
//     let boardItem = (await boardModel.getBoardWithId(
//       boardId,
//       organization,
//     )) as BoardEntity
//     let listItem = (await listModel.getlistWithId(
//       listId,
//       organization,
//     )) as ListEntity

//     let cardItem = new CardEntity()
//     cardItem.name = cardTitle
//     cardItem.board = boardItem
//     cardItem.list = listItem
//     cardItem.organization = organization
//     cardItem.createdBy = requester
//     // cardItem.orderIndex = await cardModel.getMaxOrderIndex(listItem,organization) + 1
//     cardItem.orderIndex = 0

//     const saveResult = await cardModel.saveCard(cardItem)
//     if (!saveResult) {
//       errorMessage('CONTROLLER', 'create card', 'card not create')
//       return next(new HttpException(404, 'card not create'))
//     }

//     const board = await getBoardData(boardId, organization, requester)
//     return res.status(201).send(board)
//   } catch (error) {
//     errorMessage('CONTROLLER', 'create card', 'createCard', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const createCardComment = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const boardId = req.body.boardId
//   const listId = req.body.listId
//   const cardId = req.body.cardId
//   const cardComment = req.body.cardComment

//   if (!boardId) {
//     errorMessage('CONTROLLER', 'create card comment', 'invalid data boardId')
//     return next(new HttpException(400, ErrorCode[400]))
//   }
//   if (!listId) {
//     errorMessage('CONTROLLER', 'create card comment', 'invalid data listId')
//     return next(new HttpException(400, ErrorCode[400]))
//   }
//   if (!cardId) {
//     errorMessage('CONTROLLER', 'create card comment', 'invalid data cardId')
//     return next(new HttpException(400, ErrorCode[400]))
//   }
//   if (!cardComment) {
//     errorMessage('CONTROLLER', 'create card comment', 'invalid data comment')
//     return next(new HttpException(400, ErrorCode[400]))
//   }

//   const organization: OrganizationEntity = req.body.organization
//   const requester: UserEntity = req.body.requester

//   let commentItem = new CardActivityEntity()
//   commentItem.message = cardComment
//   commentItem.time = new Date()
//   commentItem.card = (await cardModel.getCardWithIdUnRelation(
//     cardId,
//     organization,
//   )) as CardEntity
//   commentItem.organization = organization
//   commentItem.createdBy = requester
//   commentItem.idMember = requester.id
//   commentItem.type = 'comment'
//   let saveResult = await cardActivityModel.saveActivity(commentItem)

//   if (!saveResult) {
//     errorMessage('CONTROLLER', 'create comment', 'comment not create')
//     return next(new HttpException(404, 'comment not create'))
//   }

//   return res.status(201).send(saveResult)
// }

// export const updateScrumboardCard = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization
//     const requester: UserEntity = req.body.requester
//     const card = req.body.card

//     const idMembers = req.body.card.idMembers
//     const idLabels = req.body.card.idLabels

//     if (!card) {
//       errorMessage('CONTROLLER', 'card update', 'invalid data')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     let cardListData = (await listModel.getlistWithId(
//       card.listId,
//       organization,
//     )) as ListEntity
//     let cardBoardData = (await boardModel.getBoardWithId(
//       card.boardId,
//       organization,
//     )) as BoardEntity
//     let udpateCardData = new CardEntity()
//     udpateCardData.id = card.id
//     udpateCardData.name = card.name
//     udpateCardData.subscribed = card.subscribed
//     udpateCardData.checkItems = card.checkItems
//     udpateCardData.checkItemsChecked = card.checkItemsChecked
//     udpateCardData.due = card.due
//     udpateCardData.createdAt = card.createdAt
//     udpateCardData.organization = organization
//     udpateCardData.updatedBy = requester
//     udpateCardData.description = card.description
//     udpateCardData.list = cardListData
//     udpateCardData.board = cardBoardData
//     udpateCardData.createdBy = card.createdBy

//     const updateResult = await cardModel.saveCard(udpateCardData)

//     let newTodoLbls: TodoLabelEntity[] = []
//     if (idLabels) {
//       await boardLabelModel.deleteLabels(card.id)
//       for (let i = 0; i < idLabels.length; i++) {
//         const label = new BoardLabelEntity()
//         label.labelId = idLabels[i]
//         label.cardId = card.id
//         await boardLabelModel.saveLabel(label)

//         let todoLbl = (await todoLabelModel.getLabelWithId(
//           idLabels[i],
//           organization,
//         )) as TodoLabelEntity
//         newTodoLbls.push(todoLbl)
//       }
//     }

//     const oldMembers = (await cardMemberModel.getCardMembers(
//       card.id,
//     )) as CardMemberEntity[]
//     for (let i = 0; i < oldMembers.length; i++) {
//       if (
//         !idMembers.find((element: string) => element == oldMembers[i].memberId)
//       ) {
//         let oldTodo = (await todoModel.getTodoWithCardId(
//           card.id,
//           oldMembers[i].memberId,
//           organization,
//         )) as TodoEntity
//         if (oldTodo) {
//           oldTodo.isDelete = true
//           await todoModel.saveTodo(oldTodo)
//         }
//       }
//     }

//     if (idMembers) {
//       await cardMemberModel.deleteCardMembers(card.id)
//       for (let i = 0; i < idMembers.length; i++) {
//         const memberItem = new CardMemberEntity()
//         memberItem.cardId = card.id
//         memberItem.memberId = idMembers[i]
//         memberItem.createdBy = requester
//         await cardMemberModel.saveCardMember(memberItem)
//       }
//     }

//     const cardMembers = (await cardMemberModel.getCardMembers(
//       card.id,
//     )) as CardMemberEntity[]
//     for (let i = 0; i < cardMembers.length; i++) {
//       let todoItem = (await todoModel.getTodoWithCardId(
//         card.id,
//         cardMembers[i].memberId,
//         organization,
//       )) as TodoEntity
//       if (todoItem) {
//         // todoItem.title = udpateCardData.name ? udpateCardData.name : todoItem.title
//         todoItem.title = cardBoardData.title + ' > ' + cardListData.name
//         todoItem.notes = udpateCardData.description
//           ? udpateCardData.description
//           : todoItem.notes
//         if (udpateCardData.due > 0) {
//           todoItem.dueDate = new Date(udpateCardData.due * 1000)
//         }
//         todoItem.labels = newTodoLbls
//         todoItem.isDelete = false
//         todoItem.chatId = card.chatId
//         await todoModel.saveTodo(todoItem)
//       } else {
//         let newTodo = new TodoEntity()
//         // newTodo.title = udpateCardData.name ? udpateCardData.name : 'Create by Card'
//         newTodo.title = cardBoardData.title + ' > ' + cardListData.name
//         newTodo.notes = udpateCardData.description
//           ? udpateCardData.description
//           : ''
//         if (udpateCardData.due > 0) {
//           newTodo.dueDate = new Date(udpateCardData.due * 1000)
//         }
//         newTodo.labels = newTodoLbls
//         newTodo.userId = cardMembers[i].memberId
//         newTodo.cardId = card.id
//         newTodo.chatId = card.chatId
//         newTodo.organization = organization
//         newTodo.createdBy = requester
//         await todoModel.saveTodo(newTodo)
//       }
//     }

//     const cardData = (await getCardData(card.id, organization)) as CardEntity

//     return res.status(200).send(cardData)
//   } catch (error) {
//     errorMessage('CONTROLLER', 'card update', 'card update', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const removeList = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const organization: OrganizationEntity = req.body.organization
//   const boardId = req.body.boardId
//   const listId = req.body.listId
//   if (!boardId || !listId) {
//     errorMessage('CONTROLLER', 'list remove', 'invalid data')
//     return next(new HttpException(400, ErrorCode[400]))
//   }
//   let oldData = (await listModel.getlistWithId(
//     listId,
//     organization,
//   )) as ListEntity
//   if (!oldData) {
//     errorMessage('CONTROLLER', 'list remove', 'list not found')
//     return next(new HttpException(400, ErrorCode[400]))
//   }

//   for (let i = 0; i < oldData.idCards.length; i++) {
//     let _card = (await getCardData(
//       oldData.idCards[i].id,
//       organization,
//     )) as CardEntity
//     if (!_card) {
//       _card = (await cardModel.getCardWithDelete(
//         oldData.idCards[i].id,
//         organization,
//       )) as CardEntity
//     }
//     if (_card) {
//       await cardMemberModel.deleteCardMembers(_card.id)
//       await cardActivityModel.deleteData(_card)
//       await attachmentModel.deleteDataWithCard(_card)
//       if (_card.checklists) {
//         for (let i = 0; i < _card.checklists.length; i++) {
//           await checklistItemModel.deleteChecklistItemWithChecklist(
//             _card.checklists[i],
//           )
//           await checklistModel.deleteChecklist(_card.checklists[i].id)
//         }
//       }
//       await cardModel.deleteCard(_card.id, true)
//     }
//   }

//   await listModel.deleteData(listId, true)

//   return res.status(200).send(listId)
// }

// export const removeCard = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization
//     const boardId = req.body.boardId
//     const cardId = req.body.cardId

//     if (!boardId || !cardId) {
//       errorMessage('CONTROLLER', 'card remove', 'invalid data')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     const cardData = (await getCardData(cardId, organization)) as CardEntity

//     if (!cardData) {
//       errorMessage('CONTROLLER', 'card remove', 'card not found')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     await cardMemberModel.deleteCardMembers(cardData.id)
//     await cardActivityModel.deleteData(cardData)
//     await attachmentModel.deleteDataWithCard(cardData)
//     if (cardData.checklists) {
//       for (let i = 0; i < cardData.checklists.length; i++) {
//         await checklistItemModel.deleteChecklistItemWithChecklist(
//           cardData.checklists[i],
//         )
//         await checklistModel.deleteChecklist(cardData.checklists[i].id)
//       }
//     }

//     return res.status(200).send(await cardModel.deleteCard(cardId, true))
//   } catch (error) {
//     errorMessage('CONTROLLER', 'card update', 'card update', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const createCardChecklist = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization
//     const requester: UserEntity = req.body.requester

//     const cardId = req.body.cardId
//     const listName = req.body.listName

//     if (!cardId || !listName) {
//       errorMessage('CONTROLLER', 'create card checklist', 'invalid data')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     const checklist = new ChecklistEntity()
//     checklist.name = listName
//     checklist.card = (await cardModel.getCardWithIdUnRelation(
//       cardId,
//       organization,
//     )) as CardEntity
//     checklist.organization = organization
//     checklist.createdBy = requester
//     const saveResult = await checklistModel.saveChecklist(checklist)

//     if (saveResult) {
//       const checklist = await checklistModel.getChecklistWithChatId(
//         saveResult.id,
//         cardId,
//         organization,
//       )
//       return res.status(200).send(checklist)
//     } else {
//       errorMessage(
//         'CONTROLLER',
//         'create card checklist',
//         'checklist not create',
//       )
//       return next(new HttpException(404, 'checklist not create'))
//     }
//   } catch (error) {
//     errorMessage('CONTROLLER', 'create check list', 'create check list', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const createChecklistItem = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization
//     const requester: UserEntity = req.body.requester

//     const checklistId = req.body.checklistId
//     const itemName = req.body.itemName

//     if (!checklistId || !itemName) {
//       errorMessage('CONTROLLER', 'create card checklistItem', 'invalid data')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     const checklistItem = new ChecklistItemEntity()
//     checklistItem.name = itemName
//     checklistItem.checklist = (await checklistModel.getChecklistWithId(
//       checklistId,
//       organization,
//     )) as ChecklistEntity
//     checklistItem.organization = organization
//     checklistItem.createdBy = requester
//     const saveResult = await checklistItemModel.saveChecklistItem(checklistItem)

//     if (saveResult) {
//       return res.status(200).send(checklistItem)
//     } else {
//       errorMessage(
//         'CONTROLLER',
//         'create card checklistItem',
//         'checklistItem not create',
//       )
//       return next(new HttpException(404, 'checklistItem not create'))
//     }
//   } catch (error) {
//     errorMessage(
//       'CONTROLLER',
//       'create check list item',
//       'create check list item',
//       error,
//     )
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const changelistItemStatus = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization
//     const requester: UserEntity = req.body.requester

//     const itemId = req.body.itemId
//     const checkeStatus = req.body.checkeStatus

//     if (!itemId) {
//       errorMessage(
//         'CONTROLLER',
//         'change status of checklistItem',
//         'invalid data',
//       )
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     let checklistItem = (await checklistItemModel.getChecklistItemWithId(
//       itemId,
//       organization,
//     )) as ChecklistItemEntity
//     checklistItem.checked = checkeStatus
//     const saveResult = await checklistItemModel.saveChecklistItem(checklistItem)

//     if (saveResult) {
//       return res.status(200).send(checklistItem)
//     } else {
//       errorMessage(
//         'CONTROLLER',
//         'change status of checklistItem',
//         'status  not change',
//       )
//       return next(new HttpException(404, 'checklistItem not create'))
//     }
//   } catch (error) {
//     errorMessage(
//       'CONTROLLER',
//       'change status of checklistItem',
//       'status  not change',
//       error,
//     )
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const deleteChecklistItem = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization
//     const requester: UserEntity = req.body.requester

//     const itemId = req.body.itemId

//     if (!itemId) {
//       errorMessage('CONTROLLER', 'delete checklistItem', 'invalid data')
//       return next(new HttpException(400, ErrorCode[400]))
//     }
//     const deleteResult = await checklistItemModel.deleteChecklistItem(itemId)

//     if (deleteResult) {
//       return res.status(200).send(deleteResult)
//     } else {
//       errorMessage('CONTROLLER', 'delete checklistItem', 'item  not delete')
//       return next(new HttpException(404, 'item not delete'))
//     }
//   } catch (error) {
//     errorMessage(
//       'CONTROLLER',
//       'delete checklistItem',
//       'delete checklistItem',
//       error,
//     )
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const updateChecklistItem = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization
//     const requester: UserEntity = req.body.requester

//     const item = req.body.item
//     const checklistId = req.body.checklistId

//     if (!item || !checklistId) {
//       errorMessage('CONTROLLER', 'update checklistItem', 'invalid data')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     const checklistItem = new ChecklistItemEntity()
//     checklistItem.id = item.id
//     checklistItem.name = item.name
//     checklistItem.checklist = (await checklistModel.getChecklistWithId(
//       checklistId,
//       organization,
//     )) as ChecklistEntity
//     checklistItem.organization = organization
//     checklistItem.updatedBy = requester
//     const result = await checklistItemModel.saveChecklistItem(checklistItem)

//     if (result) {
//       return res.status(200).send(result)
//     } else {
//       errorMessage('CONTROLLER', 'update checklistItem', 'item  not update')
//       return next(new HttpException(404, 'item not update'))
//     }
//   } catch (error) {
//     errorMessage(
//       'CONTROLLER',
//       'update checklistItem',
//       'update checklistItem',
//       error,
//     )
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const updateChecklist = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization
//     const requester: UserEntity = req.body.requester

//     const _checklist = req.body.checklist
//     const listName = req.body.listName

//     if (!_checklist) {
//       errorMessage('CONTROLLER', 'update checklist', 'invalid data')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     const checklist = new ChecklistEntity()
//     checklist.id = _checklist.id
//     checklist.name = listName
//     checklist.card = (await cardModel.getCardWithIdUnRelation(
//       _checklist.cardId,
//       organization,
//     )) as CardEntity
//     checklist.organization = organization
//     checklist.updatedBy = requester
//     const saveResult = await checklistModel.saveChecklist(checklist)

//     if (saveResult) {
//       return res.status(200).send(saveResult)
//     } else {
//       errorMessage('CONTROLLER', 'update checklist', 'checklist  not update')
//       return next(new HttpException(404, 'checklist not update'))
//     }
//   } catch (error) {
//     errorMessage('CONTROLLER', 'update checklist', 'update checklist', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const removeChecklist = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization
//     const requester: UserEntity = req.body.requester

//     const checklistId = req.body.checklistId

//     if (!checklistId) {
//       errorMessage('CONTROLLER', 'delete checklist', 'invalid data')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     const checklist = (await checklistModel.getChecklistWithId(
//       checklistId,
//       organization,
//     )) as ChecklistEntity
//     await checklistItemModel.deleteChecklistItemWithChecklist(checklist)

//     if (await checklistModel.deleteChecklist(checklistId)) {
//       return res.status(200).send(true)
//     } else {
//       errorMessage('CONTROLLER', 'update checklist', 'checklist  not update')
//       return next(new HttpException(404, 'checklist not update'))
//     }
//   } catch (error) {
//     errorMessage(
//       'CONTROLLER',
//       'delete checklistItem',
//       'delete checklistItem',
//       error,
//     )
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const updateBoardSetting = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization
//     const requester: UserEntity = req.body.requester
//     const boardId = req.body.boardId
//     const settings = req.body.settings

//     if (!boardId || !settings) {
//       errorMessage('CONTROLLER', 'update board setting', 'invalid data')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     let boardData = (await boardModel.getBoardWithId(
//       boardId,
//       organization,
//     )) as BoardEntity
//     if (!boardData) {
//       errorMessage('CONSTROLLER', 'update board setting', 'board not found')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     let updateResult = await boardModel.updateBoardSetting(
//       boardId,
//       settings,
//       requester,
//     )
//     if (updateResult) {
//       return res.status(200).send(settings)
//     }
//     if (!updateResult) {
//       errorMessage('CONSTROLLER', 'update board setting', 'fail board update')
//       return next(new HttpException(400, ErrorCode[400]))
//     }
//   } catch (error) {
//     errorMessage(
//       'CONTROLLER',
//       'update board setting',
//       'update borad setting',
//       error,
//     )
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const deleteBoard = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization
//     const requester: UserEntity = req.body.requester
//     const boardId = req.body.boardId
//     if (!boardId) {
//       errorMessage('CONTROLLER', 'board delete', 'invalid data')
//       return next(new HttpException(400, ErrorCode[400]))
//     }
//     let boardData = (await boardModel.getBoardWithId(
//       boardId,
//       organization,
//     )) as BoardEntity
//     if (!boardData) {
//       errorMessage('CONSTROLLER', 'board delete', 'board not found')
//       return next(new HttpException(400, ErrorCode[400]))
//     }
//     let updateResult = await boardModel.deleteData(boardId, requester)
//     if (updateResult) {
//       return res.status(200).send(true)
//     }
//     if (!updateResult) {
//       errorMessage('CONSTROLLER', 'update board setting', 'fail board update')
//       return next(new HttpException(400, ErrorCode[400]))
//     }
//   } catch (error) {
//     errorMessage('CONTROLLER', 'board delete', 'board delete', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const sendFileAttachment = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { cardId } = req.params
//   const organization: OrganizationEntity = req.body.organization
//   const requester: UserEntity = req.body.requester
//   if (!cardId) {
//     errorMessage('CONSTROLLER', 'card file attachment', 'invalid  card data')
//     return next(new HttpException(400, ErrorCode[400]))
//   }
//   const content = req.file
//   if (!content) {
//     errorMessage('CONTROLLER', 'card file attachment', 'invalid file')
//     return next(new HttpException(400, ErrorCode[400]))
//   }
//   try {
//     const contentName = await gcsService.uploadCardAttachmentFromFileObject(
//       organization.id,
//       cardId,
//       content.originalname,
//       { data: content.buffer },
//     )

//     if (!contentName) {
//       errorMessage('CONTROLLER', 'card file upload', 'fail upload file')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     const url = gcsService.getCardAttachmentContentURL(
//       organization.id,
//       cardId,
//       contentName,
//     )

//     let attachment = new CardAttachmentEntity()
//     attachment.name = contentName
//     attachment.src = url
//     attachment.organization = organization
//     attachment.card = (await cardModel.getCardWithIdUnRelation(
//       cardId,
//       organization,
//     )) as CardEntity
//     attachment.time = Math.floor(new Date().getTime() / 1000)

//     const saveResult = await attachmentModel.saveAttachment(attachment)
//     if (saveResult) {
//       const cardData = (await cardModel.getCardWithIdUnRelation(
//         cardId,
//         organization,
//       )) as CardEntity
//       const attachments = await attachmentModel.getAttachmentWithCard(
//         cardData,
//         organization,
//       )
//       return res.status(200).send(attachments)
//     } else {
//       errorMessage('CONTROLLER', 'card file upload', 'fail save attachment')
//       return next(new HttpException(400, ErrorCode[400]))
//     }
//   } catch (error) {
//     errorMessage('CONTROLLER', 'card file upload', 'uploadContent', error)
//     return next(new HttpException(400, ErrorCode[400]))
//   }
// }

// export const removeAttachmentFile = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization

//     const item = req.body.item

//     if (!item) {
//       errorMessage('CONTROLLER', 'delete attachment', 'invalid data')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     const oldData = (await attachmentModel.getAttachmentWithId(
//       item.id,
//       organization,
//     )) as CardAttachmentEntity

//     if (!oldData) {
//       errorMessage('CONTROLLER', 'delete attachment', 'attachment not found')
//       return next(new HttpException(404, 'checklist not update'))
//     }

//     const result = await attachmentModel.deleteData(oldData.id)

//     return res.status(200).send(result)
//   } catch (error) {
//     errorMessage('CONTROLLER', 'delete attachment', 'delete attachment', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const listOrderInit = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const organization: OrganizationEntity = req.body.organization
//   const requester: UserEntity = req.body.requester
//   const boardId = req.body.boardId
//   const lists = req.body.lists

//   if (!boardId || !lists) {
//     errorMessage('CONTROLLER', 'listOrderInit', 'invalid data')
//     return next(new HttpException(400, ErrorCode[400]))
//   }

//   const boardData = (await boardModel.getBoardWithId(
//     boardId,
//     organization,
//   )) as BoardEntity

//   for (let i = 0; i < lists.length; i++) {
//     await listModel.updateOrderIndex(lists[i].id, i)
//   }

//   const boardResult = await getBoardData(boardId, organization, requester)

//   return res.status(200).send(boardResult.lists)
// }

// export const cardOrderInit = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const organization: OrganizationEntity = req.body.organization
//   const requester: UserEntity = req.body.requester
//   const boardId = req.body.boardId
//   const lists = req.body.lists
//   const sourceCardId = req.body.sourceCardId
//   const sourceListId = req.body.sourceListId

//   if (!boardId || !lists) {
//     errorMessage('CONTROLLER', 'cardOrderInit', 'invalid data')
//     return next(new HttpException(400, ErrorCode[400]))
//   }

//   // const boardData = await boardModel.getBoardWithId(boardId, organization) as BoardEntity

//   for (let i = 0; i < lists.length; i++) {
//     await listModel.updateOrderIndex(lists[i].id, i)
//     for (let j = 0; j < lists[i].idCards.length; j++) {
//       const listItem = (await listModel.getlistWithId(
//         lists[i].id,
//         organization,
//       )) as ListEntity
//       if (sourceCardId == lists[i].idCards[j].id) {
//         let cardData = await cardModel.getCardWithId(sourceCardId, organization)
//         if (
//           cardData &&
//           cardData.chatId.length > 0 &&
//           lists[i].id != cardData.list.id
//         ) {
//           let chatType = lists[i].chatType
//           let chatLabels = lists[i].chatLabels
//           let chatData = (await chatModel.getChatWithId(
//             cardData.chatId,
//             organization,
//           )) as ChatEntity
//           switch (chatType.toLowerCase()) {
//             case 'resolve':
//               chatData.status = CHAT_STATUS.NONE
//               break
//             case 'active':
//               chatData.status = CHAT_STATUS.OPEN
//               break
//             case 'unassign':
//               chatData.status = CHAT_STATUS.OPEN
//               chatData.owner = new UserEntity()
//               break
//             case 'assignee':
//               chatData.status = CHAT_STATUS.OPEN
//               chatData.owner = requester
//               break
//             case 'followup':
//               chatData.status = CHAT_STATUS.OPEN
//               chatData.owner = requester
//               chatData.followup = true
//               break
//             case 'spam':
//               chatData.owner = requester
//               chatData.spam = true
//               break
//             // case 'mention':
//             //   chats = await chatModel.getChatsAllMyMention(requester, organization)
//             //   break
//             case 'line':
//               chatData.channel.channel = CHANNEL.LINE
//               break
//             case 'facebook':
//               chatData.channel.channel = CHANNEL.FACEBOOK
//               break
//             default:
//               break
//           }

//           if (chatLabels.length > 0) {
//             let customer = chatData.customer as CustomerEntity
//             const currentLabels =
//               customer.customerLabel as CustomerLabelEntity[]
//             const sourceList = (await listModel.getlistWithId(
//               sourceListId,
//               organization,
//             )) as ListEntity
//             const sourceLabelsStr = sourceList.chatLabels
//             const sourceLabels = sourceLabelsStr.split(',')
//             for (let k = 0; k < sourceLabels.length; k++) {
//               let oldIndex = currentLabels.findIndex(
//                 (e) => e.label == sourceLabels[k],
//               )
//               if (oldIndex > -1) {
//                 currentLabels.splice(oldIndex, 1)
//               }
//             }

//             const inputLabel = chatLabels.split(',')
//             // let newLabel: CustomerLabelEntity[] = []
//             for (let k = 0; k < inputLabel.length; k++) {
//               let customerLbl = (await labelModel.getLabelWithName(
//                 inputLabel[k],
//                 organization,
//               )) as CustomerLabelEntity
//               if (customerLbl) {
//                 // newLabel.push(customerLbl)
//                 currentLabels.push(customerLbl)
//               }
//             }
//             // customer.customerLabel = newLabel
//             customer.customerLabel = currentLabels
//             await customerModel.saveCustomer(customer)
//           }
//           await chatModel.saveChat(chatData)
//         }
//       }
//       await cardModel.updateOrderIndex(lists[i].idCards[j].id, j, listItem)
//     }
//   }

//   const boardResult = await getBoardData(boardId, organization, requester)

//   return res.status(200).send(boardResult)
// }

// export const getChatMessage = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization

//     const { id, pNum } = req.query
//     let pageNumber: number = 0
//     if (pNum) {
//       pageNumber = Number(pNum)
//     }
//     if (!id || typeof id !== 'string') {
//       errorMessage('CONTROLLER', 'chat', 'invalid parameter(id)')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     const result = await chatModel.getChatWithId(id, organization)
//     if (!result) {
//       errorMessage('CONTROLLER', 'chat', 'chat not found')
//       return next(new HttpException(404, 'chat not found'))
//     }

//     messageModel.markReadMessageList(result.message)

//     // Convert message
//     const convertMessage = await result.message.map((message) => {
//       if (message.type === MESSAGE_TYPE.TEXT) {
//         return message
//       }

//       if (message.type === MESSAGE_TYPE.STICKER) {
//         if (!JSON.parse(message.data).url) {
//           const url = lineService.getStickerUrl(
//             JSON.parse(message.data).sticker,
//           )
//           // message.data =  JSON.stringify({stickerURL})
//           return { ...message, data: JSON.stringify({ url }) }
//         } else {
//           return { ...message }
//         }
//       }

//       if (
//         message.type === MESSAGE_TYPE.IMAGE ||
//         message.type === MESSAGE_TYPE.AUDIO ||
//         message.type === MESSAGE_TYPE.FILE ||
//         message.type === MESSAGE_TYPE.VIDEO
//       ) {
//         if (!JSON.parse(message.data).url) {
//           const url = gcsService.getChatMessageContentURL(
//             organization.id,
//             result.channel.id,
//             result.customer.id,
//             JSON.parse(message.data).filename,
//           )
//           // message.data =  JSON.stringify({url})
//           return { ...message, data: JSON.stringify({ url }) }
//         } else {
//           return { ...message }
//         }
//       }
//     })

//     if (convertMessage && convertMessage.length > 1) {
//       convertMessage.sort((a, b) => {
//         return b && a ? b.createdAt.getTime() - a.createdAt.getTime() : 0
//       })
//     }

//     let totalMsgCnt = convertMessage.length

//     let messages = convertMessage.slice(
//       0,
//       pageNumber * MESSAGE_COUNT + MESSAGE_COUNT,
//     )

//     pageNumber++
//     let remainCount = totalMsgCnt - pageNumber * MESSAGE_COUNT

//     if (messages && messages.length > 1) {
//       messages.sort((a, b) => {
//         return a && b ? a.createdAt.getTime() - b.createdAt.getTime() : 0
//       })
//     }
//     // Convert Comment message
//     const convertCommentMessage = await result.comment.map((message) => {
//       if (message.type === CHAT_COMMENT_TYPE.TEXT) {
//         return message
//       }
//       if (message.type === CHAT_COMMENT_TYPE.IMAGE) {
//         const url = gcsService.getCommentMessageContentURL(
//           organization.id,
//           result,
//           JSON.parse(message.data).filename,
//         )
//         return { ...message, data: JSON.stringify({ url }) }
//       }
//     })
//     if (convertCommentMessage && convertCommentMessage.length > 1) {
//       // tslint:disable-next-line:only-arrow-functions
//       convertCommentMessage.sort((obj1: any, obj2: any) => {
//         const a = obj1 as ChatCommentEntity
//         const b = obj2 as ChatCommentEntity
//         return a.createdAt.getTime() - b.createdAt.getTime()
//       })
//     }

//     // Convert Customer Picture
//     if (result.customer && result.customer.picture) {
//       const picture = gcsService.getCustomerDisplayURL(
//         organization.id,
//         result.channel.id,
//         result.customer.uid,
//         result.customer.picture,
//       )
//       return res.status(200).send({
//         ...result,
//         message: messages,
//         comment: convertCommentMessage,
//         customer: {
//           ...result.customer,
//           pictureURL: picture,
//         },
//         pageNumber: pageNumber,
//         remainCount: remainCount,
//       })
//     }

//     const results = {
//       ...result,
//       message: messages,
//       comment: convertCommentMessage,
//       pageNumber: pageNumber,
//       remainCount: remainCount,
//     }

//     return res.status(200).send(results)
//   } catch (error) {
//     errorMessage('CONTROLLER', 'chat', 'getChat', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }
