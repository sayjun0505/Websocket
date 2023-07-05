import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { organizationModel, userModel } from '../../model/organization'
import { v4 as uuidV4 } from 'uuid'
import { gidService } from '../../service/google'
import { getUserWithGUID } from '../../model/organization/organizationUser.model'

export let subscribers: any[] = []
const topic = ['init-connection', 'message', 'new-message']

export const getSubscribers = async (req: Request, res: Response) => {
  res.json({ clients: subscribers.length })
}
// Middleware for GET /events endpoint
export const eventsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { authorization, organizationId } = req.query
  if (!organizationId || typeof organizationId !== 'string') {
    errorMessage('CONTROLLER', 'sse', 'missing organization value')
    return next(new HttpException(400, 'missing organization value'))
  }
  if (!authorization || typeof authorization !== 'string') {
    errorMessage('CONTROLLER', 'sse', 'missing authorization value')
    return next(new HttpException(400, 'missing authorization value'))
  }

  try {
    const decodedToken = await gidService.verifyToken(authorization)
    if (!decodedToken) {
      errorMessage('VERIFY', 'authenticate', 'verify token')
      next(new HttpException(401, ErrorCode[401]))
    }

    const organization = await organizationModel.getOrganizationWithId(
      organizationId,
    )
    if (!organization) {
      errorMessage('CONTROLLER', 'sse', 'Organization not found')
      return next(new HttpException(404, 'Organization not found'))
    }

    if (!decodedToken.email) {
      errorMessage('VERIFY', 'authenticate', 'verify token')
      next(new HttpException(401, ErrorCode[401]))
    }
    // console.log('SSE decodedToken ', decodedToken)
    const user = decodedToken.email
          ? await userModel.getUserWithEmail(decodedToken.email)
          : await userModel.getUserWithGUID(decodedToken.uid)
    // const user = await userModel.getUserWithGUID(decodedToken.uid)
    // console.log('SSE user ', user)
    if (!user) {
      errorMessage('CONTROLLER', 'sse', 'user not found')
      // return next(new HttpException(404, 'user not found'))
      return res.status(200)
    }

    // Mandatory headers and http status to keep connection open
    const headers = {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
    }
    res.writeHead(200, headers)

    // After client opens connection send uuid (process Id)
    const processId = uuidV4().substring(0, 8)
    const initSubscribeData = {
      processId,
      startProcessAt: Date.now(),
      type: topic[0],
    }
    // ! Important: \n\n is so important for send data
    const data = `data: ${JSON.stringify(initSubscribeData)}\n\n`
    res.write(data)

    // Generate subscriber data bind process id with HTTP response object
    const newSubscriber = {
      organizationId: organization.id,
      userId: user.id,
      processId,
      res,
    }
    subscribers.push(newSubscriber)

    // When process closes connection we update the subscriber list
    // avoiding the disconnected one
    req.on('close', () => {
      subscribers = subscribers.filter((s) => s.processId !== processId)
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'sse', 'eventsHandler', error)
    // next(new HttpException(401, ErrorCode[401]))
    return res.status(200)
  }
}

export async function sendEventToSubscriber(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { message, isAllPublish } = req.body
  if (!message) {
    res.status(400).json({ status: 400, message: 'Message is required' })
  }

  // Create message to send data.
  const event = {
    message,
    type: topic[1],
  }

  const { processId } = req.body
  // If Process Id not found, Then check is isAllPublish flag
  if (!processId) {
    if (!isAllPublish) {
      res.status(400).json({
        status: 400,
        message: `Can't send data. some fields are required.`,
      })
    } else {
      // return sendEventToAllSubscriber(JSON.parse(JSON.stringify(event)))
    }
  }

  // Find the subscriber. If not will make Not found response
  const processSubscriber = subscribers.find((s) => s.processId === processId)
  if (!processSubscriber) {
    res.status(404).send({ status: 404, message: 'Process not found' })
  }

  const { res: subscriberResponse } = processSubscriber

  // console.log(
  //   '[SSE] Send to subscriber who match processId: ',
  //   subscriberResponse,
  // )
  // Send to subscriber who match processId
  // ! Important: \n\n is so important for send data
  subscriberResponse.write(`data: ${JSON.stringify(event)}\n\n`)
}

export async function sendEventToAllSubscriber(
  organizationId: string,
  data: JSON,
) {
  // console.log(
  //   '[SSE] Send Event to subscribers size: ',
  //   subscribers.filter((sub) => sub.organizationId === organizationId).length,
  // )
  // ! Important: \n\n is so important for send data
  subscribers
    .filter((sub) => sub.organizationId === organizationId)
    .forEach((s) => s.res.write(`data: ${JSON.stringify(data)}\n\n`))
}

export function closeConnection(req: Request, res: Response) {
  const { id: userId } = req.params
  if (!userId) {
    res.status(400).send({ status: 400, message: 'user Id is required' })
  }
  const processSubscriber = subscribers.find((s) => s.userId === userId)
  if (!processSubscriber) {
    res.status(404).send({ status: 404, message: 'Process not found' })
  }
  subscribers = subscribers.filter((s) => s.userId !== userId)
  res.status(200).json({
    status: 200,
    message: `Close connection on process id : ${userId} success`,
  })
}
