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
  UserEntity,
  USER_ROLE,
} from '../../model/organization'

export const getPackages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await packageModel.getPackages()
    if (!result) {
      errorMessage('CONTROLLER', 'package', 'get packages')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'package', 'getPackages', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getPackagesforSocket = async (
  ) => {
  try {
    const result = await packageModel.getPackages()
    if (!result) {
      errorMessage('CONTROLLER', 'package', 'get packages')
      return "error500"
    }
    return result
  } catch (error) {
    errorMessage('CONTROLLER', 'package', 'getPackages', error)
    return "error500"
  }
}

export const getPackage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'package', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await packageModel.getPackageWithId(id)
    if (!result) {
      errorMessage('CONTROLLER', 'package', 'package not found')
      return next(new HttpException(404, 'package not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'package', 'getPackage', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
