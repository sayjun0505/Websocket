import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { notificationTokenModel } from '../../model/notification'
import { UserEntity } from '../../model/organization'

export const updateNotificationToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { token } = req.body
  if (!token) {
    errorMessage('CONTROLLER', 'NotificationToken', 'invalid data(token)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const requester: UserEntity = req.body.requester
  try {
    const oldToken = await notificationTokenModel.getTokenWithToken(token)
    if (!oldToken) {
      // Save notification token to database
      return res
        .status(201)
        .send(
          await notificationTokenModel.saveNotificationToken(
            token,
            requester.id,
          ),
        )
    } else {
      return res.status(201).send(oldToken)
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'notification', 'updateNotificationToken', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const updateNotificationTokenforSocket = async (
  params:any
) => {
  const token=params.token ;
  const requster=params.requster;
  if (!token) {
    errorMessage('CONTROLLER', 'NotificationToken', 'invalid data(token)')
    return "error400"
  }

  try {
    const oldToken = await notificationTokenModel.getTokenWithToken(token)
    if (!oldToken) {
      // Save notification token to database
      return (
          await notificationTokenModel.saveNotificationToken(
            token,
            params.requster,
          )
        )
    } else {
      return oldToken
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'notification', 'updateNotificationTokenSocket', error)
    return "error500"
  }
}

