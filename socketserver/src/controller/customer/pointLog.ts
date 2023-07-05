import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'

import { CustomerPointLogEntity, pointLogModel } from '../../model/customer'

export const getPointLogs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const result = await pointLogModel.getPointLogs(organization)
    if (!result) {
      errorMessage('CONTROLLER', 'pointLog', 'get pointLogs')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'pointLog', 'getPointLogs', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getPointLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'pointLog', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await pointLogModel.getPointLogWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'pointLog', 'pointLog not found 1111')
      return next(new HttpException(404, 'pointLog not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'pointLog', 'getPointLog', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createPointLog = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { pointLog, customerId } = req.body
  if (!pointLog || pointLog.id) {
    errorMessage('CONTROLLER', 'pointLog', 'invalid data(pointLog)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  if (!customerId || typeof customerId !== 'string') {
    errorMessage('CONTROLLER', 'pointLog', 'invalid parameter(customerId)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Add team to database
    const newPointLog: CustomerPointLogEntity = {
      ...pointLog,
      organization,
      customer: { id: customerId },
      createdBy: requester,
    }
    return res.status(201).send(await pointLogModel.savePointLog(newPointLog))
  } catch (error) {
    errorMessage('CONTROLLER', 'pointLog', 'createPointLog', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
