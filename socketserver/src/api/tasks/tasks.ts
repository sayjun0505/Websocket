import { Router } from 'express'
import {
  tasksController,
} from '../../controller/tasks'

const router = Router()

// api for get All tasks list

router.get('/', tasksController.getTask)
router.get('/list', tasksController.getTasks)
router.post('/', tasksController.createTask)
router.post('/reorder', tasksController.updateTasksOrder)
router.put('/', tasksController.updateTask)
router.delete('/', tasksController.deleteTask)

// router
export default {
  router,
}
