import { Router } from 'express'
import chatAPI from './chat'
import commentAPI from './comment'

// Chat Router
const chatRouter = Router()
chatRouter.use('/', chatAPI.router)

// Comment Router
const commentRouter = Router()
commentRouter.use('/', commentAPI.router)

export default {
  chatRouter,
  commentRouter,
}
