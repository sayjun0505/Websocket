import { Router } from 'express'
import todosAPI from './todos'
import labelAPI from './label'

// Todos Router
const todosRouter = Router()
todosRouter.use('/', todosAPI.router)

// Label Router
const labelRouter = Router()
labelRouter.use('/', labelAPI.router)


export default {
  todosRouter,
  labelRouter,
}
