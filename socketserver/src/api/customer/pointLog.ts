import { Router } from 'express'
import { pointLogController } from '../../controller/customer'

const router = Router()

router.get('/', pointLogController.getPointLog)
router.get('/list', pointLogController.getPointLogs)
router.post('/', pointLogController.createPointLog)

// router
export default {
  router,
}
