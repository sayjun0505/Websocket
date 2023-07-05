import { Router } from 'express'
import { lineController } from '../../controller/webhook'

const router = Router()

// router.get('/', lineController.webhookValidate)
router.post(
  '/:channelCode',
  lineController.validateRequestHeader,
  lineController.receiveMessage,
)

export default {
  router,
}
