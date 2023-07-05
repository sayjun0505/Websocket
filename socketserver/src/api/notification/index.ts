import { Router } from 'express'
import notificationAPI from './notification'

// Router
const notificationRouter = Router()
notificationRouter.use('/', notificationAPI.router)

export default {
  notificationRouter,
}
