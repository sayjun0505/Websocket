import express, { Router } from 'express'
import { stripeController } from '../../controller/webhook'

const router = Router()

router.post(
  '/',
  express.raw({ type: 'application/json' }),
  stripeController.receivePaymentResponse,
)

export default {
  router,
}
