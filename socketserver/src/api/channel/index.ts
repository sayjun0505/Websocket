import { Router } from 'express'

import channelAPI from './channel'

// Channel Router
const channelRouter = Router()
channelRouter.use('/', channelAPI.router)

export default {
  channelRouter,
}
