import { Router } from 'express'
import { dashboardController } from '../../controller/dashboard'

const router = Router()

router.get('/', dashboardController.getSummary)
// router
export default {
  router,
}
