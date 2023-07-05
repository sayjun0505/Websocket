import { Router } from 'express'
import { directMessageController } from '../../controller/teamChat'

const router = Router()
router.get(
  '/getDirectMessageUsers/',
  directMessageController.getUsers,
)
router.get(
  '/getContact/:contactId',
  directMessageController.getUser,
)
router.get(
  '/getDirectMessages/:receiveUser',
  directMessageController.getMessages,
)
router.post(
  '/getDirectMessages/getMessageById',
  directMessageController.getMessageById,
)
router.post(
  '/sendDirectMessage/:receiveUser',
  directMessageController.sendDirectMessage,
)
router.post(
  '/uploadsDirectMessage/:receiveUser',
  directMessageController.uploadDirectContent,
)

router.post(
  '/sendDirectMessageAndFile/:receiveUser',
  directMessageController.sendDirectMessageAndFile,
)

router.post(
  '/directMessage/setPin',
  directMessageController.setPin,
)

router.post(
  '/directMessage/setDeleteMessage',
  directMessageController.setDeleteMessage,
)

router.post(
  '/directMessage/setEditMessage',
  directMessageController.setEditMessage,
)

router.post('/directMessage/setReplyMessage', directMessageController.setReplyMessage)

router.get(
  '/getNavigationDirectMessageUsers/',
  directMessageController.getNavigationUsers,
)

// router
export default {
  router,
}
