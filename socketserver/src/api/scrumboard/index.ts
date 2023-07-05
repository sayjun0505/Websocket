import { Router } from 'express'
import boardAPI from './board'

// Scrumboard Router
const scrumboardRouter = Router()
scrumboardRouter.use('/', boardAPI.router)

export default {
  scrumboardRouter,
}
