import { Router } from 'express'
import { woocommerceController } from '../../controller/webhook'

const router = Router()

router.get('/', woocommerceController.check)
router.post('/:organizationCode', woocommerceController.receiveMessage)

export default {
  router,
}
