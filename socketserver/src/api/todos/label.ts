import { Router } from 'express'
import { labelController } from '../../controller/todos'

const router = Router()

router.get('/', labelController.getLabel)
router.get('/list', labelController.getLabels)
router.post('/', labelController.createLabels)
router.put('/', labelController.updateLabel)

// router
export default {
  router,
}
