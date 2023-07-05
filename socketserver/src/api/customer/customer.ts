import { Router } from 'express'
import { customerController } from '../../controller/customer'

const router = Router()

router.get('/', customerController.getCustomer)
router.get('/list', customerController.getCustomers)

// Disable create customer with api
// router.post('/', customerController.createCustomer)

router.put('/', customerController.updateCustomer)
router.delete('/', customerController.deleteCustomer)

// router
export default {
  router,
}
