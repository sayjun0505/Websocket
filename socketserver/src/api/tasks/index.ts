import { Router } from 'express'
import tasksAPI from './tasks'
import tagAPI from './tag'

// Tasks Router
const tasksRouter = Router()
tasksRouter.use('/', tasksAPI.router)

// Tag Router
const tagRouter = Router()
tagRouter.use('/', tagAPI.router)


export default {
  tasksRouter,
  tagRouter,
}
