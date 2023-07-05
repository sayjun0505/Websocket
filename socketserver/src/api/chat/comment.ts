import { Router } from 'express'
import { commentController } from '../../controller/chat'

const router = Router()

router
 .get('/:chatId', commentController.getComments)
  // .get('/getUsers', commentController.getUsers)
  .post('/sendMessage', commentController.sendMessage)
  .put('/read', commentController.markReaMentions)
  .post('/uploads/:chatId', commentController.uploadContent)
  .post('/pinMessage', commentController.pinMessage)

export default {
  router,
}
