// middleware for doing role-based permissions
import { NextFunction, Request, Response } from 'express'
import { permissionModel } from '../model/authorization'
import { ErrorCode, errorMessage, HttpException } from './exceptions'

export const authorization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  const role = req.body.organizationUser.role
  const path = req.path.split('/')
  const resource = path[1]

  const permission = await permissionModel.getPermissions(role, resource)
  if (permission) {
    if (req.method === 'POST' && permission.create) {
      next()
    } else if (req.method === 'PUT' && permission.update) {
      next()
    } else if (req.method === 'GET' && permission.read) {
      next()
    } else if (req.method === 'DELETE' && permission.delete) {
      next()
    } else {
      errorMessage('Middleware', 'authorization', 'Permission Denied')
      res.status(403).json({ message: 'Permission Denied' })
    }
  } else {
    errorMessage('Middleware', 'authorization', 'Permission Denied')
    res.status(403).json({ message: 'Permission Denied' })
  }
}
