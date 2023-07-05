import cors from 'cors'
import { Router } from 'express'
import { limitationController } from '../../controller/organization'

const router = Router()

router.get('/limitation/:activationId', limitationController.getLimitation)

export default {
  router,
}
