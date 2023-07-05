import { Router } from 'express'
import { hqController } from '../../controller/teamChat'

const router = Router()
router.get('/hq', hqController.getHQData)
router.get('/hq/messages', hqController.getHQMessages)
router.post('/hq/message', hqController.sendMessage)
router.post('/hq/uploads', hqController.uploadContent)
router.post('/hq/setPin', hqController.setPin)
// router.put('/channel', channelController.updateChannel)
router.post('/hq/setDeleteMessage', hqController.setDeleteMessage)
router.post('/hq/setEditMessage', hqController.setEditMessage)
router.post('/hq/setReplyMessage', hqController.setReplyMessage)
// router
export default {
  router,
}
