import { Router } from 'express'

import channelAPI from './channel'
import directMessageAPI from './directMessage'
import hqAPI from './hq'
import memberAPI from './member'
import messageAPI from './message'
import threadAPI from './thread'

// Channel Router
const teamChatRouter = Router()
teamChatRouter.use('/', channelAPI.router)
teamChatRouter.use('/', directMessageAPI.router)
teamChatRouter.use('/', hqAPI.router)
teamChatRouter.use('/', memberAPI.router)
teamChatRouter.use('/', messageAPI.router)
teamChatRouter.use('/', threadAPI.router)

export default {
  teamChatRouter,
}
