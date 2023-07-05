import { Router } from 'express'
import { rewardController } from '../../controller/customer'

const router = Router()

router.get('/', rewardController.getReward)
router.get('/list', rewardController.getRewards)
router.post('/', rewardController.createReward)
router.put('/', rewardController.updateReward)
router.delete('/', rewardController.deleteReward)

// router
export default {
  router,
}
