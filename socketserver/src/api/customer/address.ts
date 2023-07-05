import { Router } from 'express'
import { addressController } from '../../controller/customer'

const router = Router()

router.get('/', addressController.getAddress)
router.get('/list', addressController.getAddresses)
router.post('/', addressController.createAddress)
router.put('/', addressController.updateAddress)
router.delete('/', addressController.deleteAddress)

// router
export default {
  router,
}
