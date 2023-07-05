import { Router } from 'express'
import { rewardLogController } from '../../controller/customer'

const router = Router()

router.get('/', rewardLogController.getRewardLog)
router.get('/list', rewardLogController.getRewardLogs)
router.post('/', rewardLogController.createRewardLog)

// router
export default {
  router,
}
