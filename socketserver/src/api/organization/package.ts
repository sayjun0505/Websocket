import cors from 'cors'
import { Router } from 'express'
import { packageController } from '../../controller/organization'

const router = Router()

router.get('/package/:id', packageController.getPackage)
router.get('/packages', packageController.getPackages)

export default {
  router,
}
