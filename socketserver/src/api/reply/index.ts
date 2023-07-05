import { Router } from 'express'
import keywordAPI from './keyword'
import replyAPI from './reply'
import responseAPI from './response'

// Keyword Router
const keywordRouter = Router()
keywordRouter.use('/', keywordAPI.router)

// Reply Router
const replyRouter = Router()
replyRouter.use('/', replyAPI.router)

// Response Router
const responseRouter = Router()
responseRouter.use('/', responseAPI.router)

export default {
  keywordRouter,
  replyRouter,
  responseRouter,
}
