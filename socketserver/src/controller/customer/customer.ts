import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { gcsService } from '../../service/google'
import { OrganizationEntity, UserEntity } from '../../model/organization'
import {
  organizationModel,
} from '../../model/organization'
import { CustomerEntity, customerModel } from '../../model/customer'
import { getLabelWithName } from '../../model/customer/label.model'

export const getCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("ssssssssssssssssssssssss")
    const organization: OrganizationEntity = req.body.organization
    const _customers = await customerModel.getCustomers(organization)
    return res.status(200).send(
      _customers.map((customer) => {
        const pictureURL = customer.picture
          ? gcsService.getCustomerDisplayURL(
            organization.id,
            customer.channelId,
            customer.uid,
            customer.picture,
          )
          : null
        return {
          id: customer.id,
          uid: customer.uid,
          firstname: customer.firstname,
          lastname: customer.lastname,
          display: customer.display,
          channelId: customer.channelId,
          pictureURL,
        }
      }),
    )
  } catch (error) {
    errorMessage('CONTROLLER', 'customer', 'getCustomers', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getCustomersforSocket = async (
  params: any
) => {
  try {
    const organization = await organizationModel.getOrganizationWithId(params)
    if (organization != undefined) {
      const _customers = await customerModel.getCustomers(organization)
      return _customers.map((customer) => {
        if (organization != undefined) {
          const pictureURL = customer.picture
            ? gcsService.getCustomerDisplayURL(
              organization.id,
              customer.channelId,
              customer.uid,
              customer.picture,
            )
            : null
          return {
            id: customer.id,
            uid: customer.uid,
            firstname: customer.firstname,
            lastname: customer.lastname,
            display: customer.display,
            channelId: customer.channelId,
            pictureURL,
          }
        }

      }
      )
      
    }

  } catch (error) {
    errorMessage('CONTROLLER', 'customer', 'getCustomers', error)
    return "error500"
  }
}

export const getCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'customer', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await customerModel.getCustomerWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'customer', 'customer not found')
      return next(new HttpException(404, 'customer not found'))
    }

    if (result && result.picture) {
      const picture = gcsService.getCustomerDisplayURL(
        organization.id,
        result.channel.id,
        result.uid,
        result.picture,
      )
      return res.status(200).send({
        ...result,
        pictureURL: picture,
      })
    }

    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'customer', 'getCustomer', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { customer } = req.body
  if (!customer || customer.id) {
    errorMessage('CONTROLLER', 'customer', 'invalid data(customer)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Add customer to database
    const newCustomer: CustomerEntity = {
      ...customer,
      organization,
      createdBy: requester,
    }
    return res.status(201).send(await customerModel.saveCustomer(newCustomer))
  } catch (error) {
    errorMessage('CONTROLLER', 'customer', 'createCustomer', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { customer } = req.body

  if (typeof customer === 'string') {
    customer = JSON.parse(customer);
  }
  if (!customer || !customer.id) {
    errorMessage('CONTROLLER', 'customer', 'invalid data(customer)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  let newLabel = customer.customerLabel
  if (typeof newLabel === 'string') {
    newLabel = JSON.parse(newLabel)
    customer.customerLabel = JSON.parse(customer.customerLabel)
  }

  if (customer && customer.customerLabel && customer.customerLabel.length > 0) {
    let existLabel = customer.customerLabel.pop()
    newLabel = await customer.customerLabel.map((label: any) => {
      if (!label.id) {
        label.organization = organization
        label.createdBy = requester
      }
      return label
    })

    if (!existLabel.id) {
      const label = await getLabelWithName(existLabel.label, organization)
      if (label) {
        existLabel.id = label.id
        existLabel.isDelete = false
        existLabel.updatedBy = requester
        existLabel.organization = organization
      } else {
        existLabel.organization = organization
        existLabel.createdBy = requester
      }
    }
    newLabel.push(existLabel)
  }

  try {
    // Save customer to database
    if (customer.customerLabel) {
      const newCustomer: CustomerEntity = {
        ...customer,
        customerLabel: newLabel,
        organization,
        updatedBy: requester,
      }
      return res.status(201).send(await customerModel.saveCustomer(newCustomer))
    } else {
      const newCustomer: CustomerEntity = {
        ...customer,
        organization,
        updatedBy: requester,
      }
      return res.status(201).send(await customerModel.saveCustomer(newCustomer))
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'customer', 'updateCustomer', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    errorMessage('CONTROLLER', 'customer', 'invalid parameter(id)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    const customerResult = await customerModel.getCustomerWithId(
      id,
      organization,
    )
    if (!customerResult) {
      errorMessage('CONTROLLER', 'customer', ' customer not found')
      return next(new HttpException(404, 'customer not found'))
    }
    // Save customer to database
    const newCustomer: CustomerEntity = {
      ...customerResult,
      isDelete: true,
      updatedBy: requester,
    }
    return res.status(201).send(await customerModel.saveCustomer(newCustomer))
  } catch (error) {
    errorMessage('CONTROLLER', 'customer', 'deleteCustomer', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
