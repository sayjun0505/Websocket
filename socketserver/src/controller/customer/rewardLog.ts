import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'

import { CustomerRewardLogEntity, rewardLogModel } from '../../model/customer'

export const getRewardLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const result = await rewardLogModel.getRewardLogs(organization)
    if (!result) {
      errorMessage('CONTROLLER', 'rewardLog', 'get rewardLogs')
      return next(new HttpException(500, ErrorCode[500]))
    }

    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'rewardLog', 'getRewardLogs', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getRewardLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'rewardLog', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await rewardLogModel.getRewardLogWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'rewardLog', 'rewardLog not found')
      return next(new HttpException(404, 'rewardLog not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'rewardLog', 'getRewardLog', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createRewardLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { rewardLog, customerId } = req.body
  if (!rewardLog || rewardLog.id) {
    errorMessage('CONTROLLER', 'rewardLog', 'invalid data(rewardLog)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  if (!customerId || typeof customerId !== 'string') {
    errorMessage('CONTROLLER', 'rewardLog', 'invalid parameter(customerId)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Add team to database
    const newRewardLog: CustomerRewardLogEntity = {
      ...rewardLog,
      organization,
      customer: { id: customerId },
      createdBy: requester,
    }
    return res
      .status(201)
      .send(await rewardLogModel.saveRewardLog(newRewardLog))
  } catch (error) {
    errorMessage('CONTROLLER', 'rewardLog', 'createRewardLog', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
