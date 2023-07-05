import { NextFunction, Request, Response, Router } from 'express'
import {
  log,
  logErrors,
  routeDefaultNotFound,
  routeError,
} from '../middleware/exceptions'
import {
  verifyGoogleToken,
  verifyOrganization,
  verifyTriggerToken,
} from '../middleware/authenticate'
import { authorization } from '../middleware/authorization'

import { getConnection } from 'typeorm'

import channel from './channel'
import chat from './chat'
import customer from './customer'
import dashboard from './dashboard'
// import * as eCommerce from './eCommerce'
import notification from './notification'
import organization from './organization'
import reply from './reply'
import user from './user'
import todos from './todos'
import tasks from './tasks'
import scrumboard from './scrumboard'
import webhook from './webhook'
import eCommerce from './eCommerce'
import sse from './sse'
import packageRouter from './monitor/package'
import permissionRouter from './authorization/permission'
import teamChat from './teamChat'

const router = Router()

// Log
router.use(log)

router.get('/status', (req: Request, res: Response, next: NextFunction) => {
  res.json({
    API_Version: process.env.VERSION,
    Database: getConnection().isConnected,
  })
})

// Webhook
router.use('/monitor/package', verifyTriggerToken, packageRouter.router)

// Webhook
router.use('/webhook/', webhook.webhookRouter)

// Server-Sent Events
router.use('/sse/', sse.sseRouter)

//  Authenticate with Google Token
router.use('/', verifyGoogleToken)

router.use('/', permissionRouter.router)

// No Specific Organization
router.use('/', organization.organizationRouter)
router.use('/', organization.packageRouter)
router.use('/', organization.limitationRouter)
// router.use('/', organization.creditCardRouter)
router.use('/', organization.activationRouter)
router.use('/user', user.userNoOrganizationRouter)
router.use('/notification', notification.notificationRouter)

// Specific Organization
router.use('/:organizationId/', verifyOrganization, authorization)
router.use('/:organizationId/user', user.userRouter)
router.use('/:organizationId/', user.teamRouter)

// Channel
router.use('/:organizationId/', channel.channelRouter)

// Comment
router.use('/:organizationId/chat/comment', chat.commentRouter)
// Chat
router.use('/:organizationId/chat', chat.chatRouter)
// router.use('/:organizationId/chat/message', verifyToken, chat.message.router)
// router.use('/:organizationId/chat/reply/', verifyToken, chat.reply.router)

// Customer
router.use('/:organizationId/customer', customer.customerRouter)
router.use('/:organizationId/customer/address', customer.addressRouter)
router.use('/:organizationId/customer/label', customer.labelRouter)
router.use('/:organizationId/customer/pointHistory', customer.pointLogRouter)
router.use('/:organizationId/customer/reward', customer.rewardRouter)
router.use('/:organizationId/customer/rewardHistory', customer.rewardLogRouter)

// Notification
// router.use('/:organizationId/notification', notification.notificationRouter)

// Reply
router.use('/:organizationId/', reply.replyRouter)
router.use('/:organizationId/reply/keyword', reply.keywordRouter)
router.use('/:organizationId/reply/response', reply.responseRouter)

// Todos
router.use('/:organizationId/todo', todos.todosRouter)
router.use('/:organizationId/todo/label', todos.labelRouter)

// Tasks
router.use('/:organizationId/tasks', tasks.tasksRouter)
router.use('/:organizationId/tasks/tags', tasks.tagRouter)

// Scrumboard
router.use('/:organizationId/scrumboard', scrumboard.scrumboardRouter)
// router.use('/:organizationId/todo/label', scrumboard.labelRouter)

// eCommerce
router.use('/:organizationId/eCommerce', eCommerce.ECommerceRouter)

// Dashboard
router.use('/:organizationId/dashboard', dashboard.dashboardRouter)

// TeamChat
router.use('/:organizationId/teamChat', teamChat.teamChatRouter)

// Log Error
router.use(logErrors)
// Response default 404 Not Found
router.use(routeDefaultNotFound)

// Response Error Handle
router.use(routeError)

export default {
  router,
}
