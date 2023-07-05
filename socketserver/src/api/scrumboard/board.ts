import { Router } from 'express'
import {
  attachmentController,
  boardController,
  cardController,
  chatController,
  labelController,
  listController,
} from '../../controller/scrumboard'

const router = Router()

// Board
router.get('/boards', boardController.getBoards)
router.get('/board/:boardId', boardController.getBoard)
router.post('/board', boardController.createBoard)
router.put('/board/:boardId', boardController.updateBoard)
router.delete('/board/:boardId', boardController.deleteBoard)

router.get('/board/:boardId/members', boardController.getMembers)
router.get('/board/:boardId/chats', chatController.getChats)
router.get('/board/:boardId/chat/:chatId', chatController.getChat)

// List
router.get('/board/:boardId/lists', listController.getLists)
router.put('/board/:boardId/lists/reorder', listController.updateListsOrder)
router.post('/board/:boardId/list', listController.createList)
router.put('/board/:boardId/list/:listId', listController.updateList)
router.delete('/board/:boardId/list/:listId', listController.deleteList)

// Card
router.get('/board/:boardId/cards', cardController.getCards)
router.put('/board/:boardId/cards/reorder', cardController.updateCardsOrder)
router.post('/board/:boardId/list/:listId/card', cardController.createCard)
router.put('/board/:boardId/card/:cardId', cardController.updateCard)
router.delete('/board/:boardId/card/:cardId', cardController.deleteCard)

router.post(
  '/board/:boardId/card/:cardId/upload',
  attachmentController.sendFileAttachment,
)

// Label
router.get('/board/:boardId/labels', labelController.getLabels)
router.post('/board/:boardId/label', labelController.createLabel)

// router
export default {
  router,
}
