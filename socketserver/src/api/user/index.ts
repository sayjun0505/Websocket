import { Router } from 'express'
import teamAPI from './team'
import userAPI from './user'

// Team Router
const teamRouter = Router()
teamRouter.use('/', teamAPI.router)

// User no Organization Router
const userNoOrganizationRouter = Router()
userNoOrganizationRouter.use('/', userAPI.routerWithoutOrganization)

// User Router
const userRouter = Router()
userRouter.use('/', userAPI.router)

export default {
  teamRouter,
  userNoOrganizationRouter,
  userRouter,
  // team,
  // organization,
}
