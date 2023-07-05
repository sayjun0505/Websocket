import cors from 'cors'
import { Router } from 'express'
import { paymentModel } from 'src/model/organization'
import {
  activationController,
  packageController,
  paymentController,
} from '../../controller/organization'

const router = Router()

router.get('/activations', activationController.getActivations)
router.get('/activations/invite', activationController.getActivationsInvite)
router.get('/activation/:id', activationController.getActivation)
router.get('/activation/:activationId/package', activationController.getPackage)
router.get('/activation/:id/seat', activationController.getActivationSeat)
router.post('/activation', activationController.createActivation)
router.post(
  '/activation/invite',
  activationController.createActivationWithInvite,
)
router.put('/activation', activationController.updateActivation)

router.get('/activation/:activationId/payments', paymentController.getPayments)
router.get('/activation/payment/:id', paymentController.getPayment)

// Stripe
router.post(
  '/activation/createCustomerPortalSession',
  activationController.createCustomerPortalSession,
)

export default {
  router,
}
