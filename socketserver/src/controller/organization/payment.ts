import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  OrganizationEntity,
  organizationUserModel,
  PackageEntity,
  packageModel,
  paymentModel,
  UserEntity,
  USER_ROLE,
} from '../../model/organization'

export const getPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { activationId } = req.params
    const result = await paymentModel.getPaymentWithActivationId(activationId)
    if (!result) {
      errorMessage('CONTROLLER', 'payments', 'getPayments')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'payments', 'getPayments', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}



export const getPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params
    const result = await paymentModel.getPaymentWithId(id)
    if (!result) {
      errorMessage('CONTROLLER', 'payments', 'getPayment')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'payments', 'getPayment', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
