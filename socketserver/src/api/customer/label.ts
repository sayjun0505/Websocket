import { Router } from 'express'
import { labelController } from '../../controller/customer'

const router = Router()

router.get('/', labelController.getLabel)
router.get('/list', labelController.getLabels)
router.post('/', labelController.createLabels)
router.put('/', labelController.updateLabel)
router.post('/delete', labelController.deleteLabel)

// router
export default {
  router,
}
