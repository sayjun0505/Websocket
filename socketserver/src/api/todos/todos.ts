import { Router } from 'express'
import {
  todosController,
} from '../../controller/todos'

const router = Router()

// api for get All todos list

router.get('/', todosController.getTodo)
router.get('/list', todosController.getTodos)
router.post('/', todosController.createTodo)
router.put('/', todosController.updateTodo)
router.delete('/', todosController.deleteTodo)

// router
export default {
  router,
}
