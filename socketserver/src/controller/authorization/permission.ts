import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { roleModel } from '../../model/authorization'

export const getPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { role } = req.params
    if (!role) {
      errorMessage('CONTROLLER', 'permission', 'invalid parameter')
      res.status(400).json({ message: ErrorCode[400] })
    }

    const result = await roleModel.getRole(role)

    if (!result) {
      errorMessage('CONTROLLER', 'permission', 'get permission')
      res.status(400).json({ message: ErrorCode[400] })
    }

    return res.status(200).json(
      result?.permission.reduce(
        (obj, item) =>
          Object.assign(obj, {
            [item.resource.name]: {
              create: item.create,
              update: item.update,
              read: item.read,
              delete: item.delete,
            },
          }),
        {},
      ),
    )
  } catch (error) {
    errorMessage('CONTROLLER', 'permission', 'getPermission', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getPermissionforSocket = async (
  params:string
) => {
  try {
    if (!params) {
      errorMessage('CONTROLLER', 'permission', 'invalid parameter')
      return "error400"
    }

    const result = await roleModel.getRole(params)

    if (!result) {
      errorMessage('CONTROLLER', 'permission', 'get permission')
      return "error400"
    }

    return result?.permission.reduce(
              (obj, item) =>
                Object.assign(obj, {
                  [item.resource.name]: {
                    create: item.create,
                    update: item.update,
                    read: item.read,
                    delete: item.delete,
                  },
                }),
              {},
            )    
  } catch (error) {
    errorMessage('CONTROLLER', 'permission', 'getPermission', error)
    return "error500"
  }
}

