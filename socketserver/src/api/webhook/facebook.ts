import { Router } from 'express'
import { facebookController } from '../../controller/webhook'

const router = Router()

router.get('/', facebookController.webhookValidate)
router.post('/', facebookController.receiveMessage)

export default {
  router,
}
