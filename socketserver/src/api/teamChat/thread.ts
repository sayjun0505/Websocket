import { Router } from 'express'
import { threadController } from '../../controller/teamChat'

const router = Router()
router.get('/threadMessages/getHqReplies', threadController.getHqReplies)
router.get('/threadMessages/getCmReplies', threadController.getCmReplies)
router.get('/threadMessages/getDmReplies', threadController.getDmReplies)
router.post('/threadMessages/getThreads', threadController.getThreads)

router.post('/threadMessage', threadController.sendMessage)
router.get('/threadMessage/:threadId', threadController.getMessage)
router.post('/threadMessage/uploads/:threadId', threadController.uploadContent)

// router
export default {
  router,
}
