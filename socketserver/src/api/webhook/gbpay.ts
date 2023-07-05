import { Router } from 'express'
import { gbpayController } from '../../controller/webhook'

const router = Router()

router.post('/', gbpayController.receivePaymentResponse)

export default {
  router,
}
