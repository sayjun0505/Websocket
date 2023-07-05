import { Router } from 'express'

import addressAPI from './address'
import customerAPI from './customer'
import labelAPI from './label'
import pointLogAPI from './pointLog'
import rewardAPI from './reward'
import rewardLogAPI from './rewardLog'

// Address Router
const addressRouter = Router()
addressRouter.use('/', addressAPI.router)

// Customer Router
const customerRouter = Router()
customerRouter.use('/', customerAPI.router)

// Label Router
const labelRouter = Router()
labelRouter.use('/', labelAPI.router)

// PointLog Router
const pointLogRouter = Router()
pointLogRouter.use('/', pointLogAPI.router)

// Reward Router
const rewardRouter = Router()
rewardRouter.use('/', rewardAPI.router)

// RewardLog Router
const rewardLogRouter = Router()
rewardLogRouter.use('/', rewardLogAPI.router)

export default {
  addressRouter,
  customerRouter,
  labelRouter,
  pointLogRouter,
  rewardRouter,
  rewardLogRouter,
}
