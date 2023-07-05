import { Router } from 'express'
import { replyController, responseController } from '../../controller/reply'

const router = Router()

router
  .get('/reply/list', replyController.getReplies)
  .get('/reply/list/:type', replyController.getRepliesWithType)
  .get('/reply/:id', replyController.getReply)
  .post('/reply', replyController.createReply)
  .put('/reply', replyController.updateReply)
  .delete('/reply/:id', replyController.deleteReply)

  .put('/reply/:id/:status', replyController.updateReplyStatus)

export default {
  router,
}
