import { Router } from 'express'
import { chatController, messageController } from '../../controller/chat'

const router = Router()

// api for get All chat list
router.get('/', chatController.getChat)
router.get('/list', chatController.getChats)
router.get('/history', chatController.getChatHistory)
router.get('/history/list', chatController.getChatHistories)
router.put('/', chatController.updateChat)
router.put('/owner', chatController.updateChatOwner)
router.put('/status', chatController.updateChatStatus)
router.delete('/', chatController.deleteChat)

router.get('/messages/:chatId', messageController.getMessages)
router.post('/sendMessage', messageController.sendMessage)
router.post('/uploads/:channelId/:customerId', messageController.uploadContent)

router.post('/sendReplyMessage', messageController.sendReplyMessage)

/**
 * API V2
 */
router.get('/userOptions', chatController.getUserOptions)
router.get('/labelOptions', chatController.getLabelOptions)
router.get('/channels', chatController.getChannels)

// router
export default {
  router,
}
