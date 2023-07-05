import { Router } from 'express'
import { instagramController } from '../../controller/webhook'

const router = Router()

router.get('/', instagramController.webhookValidate)
router.post('/', instagramController.receiveMessage)

export default {
  router,
}
