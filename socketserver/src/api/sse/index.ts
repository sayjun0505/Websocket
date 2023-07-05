import { Router } from 'express'
import sseAPI from './sse'

// Team Router
const sseRouter = Router()
sseRouter.use('/', sseAPI.router)

export default {
  sseRouter
}
