import { Router } from 'express'
import { sseController } from '../../controller/sse'

const router = Router()

router.get('/events', sseController.eventsHandler)
router.get('/status',sseController.getSubscribers)
// router.post('/publish', sseController.sendEventToSubscriber)
router.delete('/closes/:id', sseController.closeConnection)

export default {
  router,
}
