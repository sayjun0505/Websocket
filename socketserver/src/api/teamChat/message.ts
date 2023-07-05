import { Router } from 'express'
import { messageController } from '../../controller/teamChat'

const router = Router()

router.post('/message', messageController.sendMessage)
router.post('/uploads/:channelId', messageController.uploadContent)
router.get('/message/:channelId', messageController.getMessages)
router.post('/message/setPin', messageController.setPin)
router.post('/message/setEditMessage', messageController.setEditMessage)
router.post('/message/setDeleteMessage', messageController.setDeleteMessage)
router.post('/message/setReplyMessage', messageController.setReplyMessage)

// router
export default {
  router,
}
