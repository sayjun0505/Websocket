import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  NotificationEntity,
  notificationModel,
  NotificationSettingEntity,
  notificationSettingModel,
} from '../../model/notification'
import { OrganizationEntity, UserEntity } from '../../model/organization'

export const getNotificationSetting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    const result =
      await notificationSettingModel.getNotificationSettingWithUserId(
        requester.id,
      )
    if (!result) {
      errorMessage('CONTROLLER', 'notification', 'getNotificationSetting')
      return next(new HttpException(500, ErrorCode[500]))
    }

    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'notification', 'getNotificationSetting', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const updateNotificationSetting = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { setting } = req.body
  if (typeof setting === 'string') {
    setting = JSON.parse(setting)
  }
  if (!setting) {
    errorMessage(
      'CONTROLLER',
      'updateNotificationSetting',
      'invalid data(setting)',
    )
    return next(new HttpException(400, ErrorCode[400]))
  }
  const requester: UserEntity = req.body.requester
  try {
    const oldSetting =
      await notificationSettingModel.getNotificationSettingWithUserId(
        requester.id,
      )
    if (!oldSetting) {
      // Save notification setting to database
      const newSetting: NotificationSettingEntity = {
        ...setting,
        user: requester,
      }
      return res
        .status(201)
        .send(
          await notificationSettingModel.saveNotificationSetting(newSetting),
        )
    } else {
      // Update notification setting to database
      const newSetting: NotificationSettingEntity = {
        ...oldSetting,
        ...setting,
      }
      return res
        .status(201)
        .send(
          await notificationSettingModel.saveNotificationSetting(newSetting),
        )
    }
  } catch (error) {
    errorMessage(
      'CONTROLLER',
      'notification',
      'updateNotificationSetting',
      error,
    )
    return next(new HttpException(500, ErrorCode[500]))
  }
}
