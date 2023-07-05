import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'

import { AddressEntity, addressModel } from '../../model/customer'

export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const result = await addressModel.getAddresses(organization)
    if (!result) {
      errorMessage('CONTROLLER', 'address', 'get addresses')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'address', 'getAddresses', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'address', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await addressModel.getAddressWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'address', 'address not found')
      return next(new HttpException(404, 'address not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'address', 'getAddress', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { address } = req.body
  if (typeof address === 'string') {
    address = JSON.parse(address)
  }
  if (!address || address.id) {
    errorMessage('CONTROLLER', 'address', 'invalid data(address)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Add address to database
    const newAddress: AddressEntity = {
      ...address,
      organization,
      createdBy: requester,
    }
    return res.status(201).send(await addressModel.saveAddress(newAddress))
  } catch (error) {
    errorMessage('CONTROLLER', 'address', 'createAddress', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { address } = req.body
  if (typeof address === 'string') {
    address = JSON.parse(address)
  }
  if (!address || !address.id) {
    errorMessage('CONTROLLER', 'address', 'invalid data(address)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Save address to database
    const newAddress: AddressEntity = {
      ...address,
      organization,
      updatedBy: requester,
    }
    return res.status(201).send(await addressModel.saveAddress(newAddress))
  } catch (error) {
    errorMessage('CONTROLLER', 'address', 'updateAddress', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    errorMessage('CONTROLLER', 'address', 'invalid parameter')
    return next(new HttpException(400, ErrorCode[400]))
  }
  try {
    return res.status(201).send(await addressModel.deleteAddress(id))
  } catch (error) {
    errorMessage('CONTROLLER', 'address', 'deleteAddress', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
