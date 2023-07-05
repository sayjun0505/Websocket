import { Router } from 'express'
import { tagController } from '../../controller/tasks'

const router = Router()

router.get('/', tagController.getTag)
router.get('/list', tagController.getTags)
router.post('/', tagController.createTags)
router.put('/', tagController.updateTag)
router.delete('/', tagController.removeTag)

// router
export default {
  router,
}
