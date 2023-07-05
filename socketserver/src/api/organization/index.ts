import { Router } from 'express'
import activationAPI from './activation'
import limitationAPI from './limitation'
import organizationAPI from './organization'
import packageAPI from './package'
// import creditCardAPI from './creditCard'

// Organization Router
const activationRouter = Router()
activationRouter.use('/', activationAPI.router)

// Organization Router
const organizationRouter = Router()
organizationRouter.use('/', organizationAPI.router)

// Limitation Router
const limitationRouter = Router()
limitationRouter.use('/', limitationAPI.router)

// Package Router
const packageRouter = Router()
packageRouter.use('/', packageAPI.router)

// CreditCard Router
// const creditCardRouter = Router()
// creditCardRouter.use('/', creditCardAPI.router)

export default {
  activationRouter,
  // creditCardRouter,
  limitationRouter,
  organizationRouter,
  packageRouter,
}
