import { Router } from 'express'

import dashboardAPI from './dashboard'

// Channel Router
const dashboardRouter = Router()
dashboardRouter.use('/', dashboardAPI.router)

export default {
  dashboardRouter,
}
