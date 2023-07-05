import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'
import {
  organizationModel,
} from '../../model/organization'
import {
  CustomerEntity,
  CustomerLabelEntity,
  customerModel,
  labelModel,
} from '../../model/customer'
import { getCustomerWithLabel } from '../../model/customer/label.model'

export const getLabels = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    return res.status(200).send(await labelModel.getLabels(organization))
  } catch (error) {
    errorMessage('CONTROLLER', 'label', 'getLabels', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getLabelsforSocket = async (
  org: any
) => {
  try {
    const organization = await organizationModel.getOrganizationWithId(org)
    if(organization!=undefined){
      return (await labelModel.getLabels(organization))
    }    
  } catch (error) {
    errorMessage('CONTROLLER', 'label', 'getLabels', error)
    return "error500"
  }
}

export const getLabel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'label', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await labelModel.getLabelWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'label', 'label not found')
      return next(new HttpException(404, 'label not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'label', 'getLabel', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getLabelforSocket = async (
  org: any
) => {
  try {
    const organization: OrganizationEntity = org.organization

    const { id } = org.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'label', 'invalid parameter(id)')
      return "error400"
    }

    const result = await labelModel.getLabelWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'label', 'label not found')
      return 'label not found'
    }
    return result
  } catch (error) {
    errorMessage('CONTROLLER', 'label', 'getLabel', error)
    return "error500"
  }
}

export const createLabels = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { labels } = req.body
  if (!labels || labels.length < 1) {
    errorMessage('CONTROLLER', 'label', 'invalid data(label)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Add labels to database
    const newLabels: CustomerLabelEntity[] = []
    labels.forEach((element: string) => {
      const newLabel = new CustomerLabelEntity()
      newLabel.organization = organization
      newLabel.label = element
      newLabel.createdBy = requester
      newLabels.push(newLabel)
    })
    return res.status(201).send(await labelModel.saveLabels(newLabels))
  } catch (error) {
    errorMessage('CONTROLLER', 'label', 'createLabels', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateLabel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { label } = req.body
  if (!label || !label.id) {
    errorMessage('CONTROLLER', 'label', 'invalid data(label)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Save label to database
    const newLabel: CustomerLabelEntity = {
      ...label,
      organization,
      updatedBy: requester,
    }
    return res.status(201).send(await labelModel.saveLabels([newLabel]))
  } catch (error) {
    errorMessage('CONTROLLER', 'label', 'updateLabel', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteLabel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { label } = req.body
  if (!label || !label.label.id) {
    errorMessage('CONTROLLER', 'label', 'invalid data(labelId)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  const customers = await getCustomerWithLabel(organization, label.label.id)
  customers?.map(async (customer: CustomerEntity) => {
    const detailCustomer = await customerModel.getCustomerWithId(
      customer.id,
      organization,
    )
    if (detailCustomer) {
      detailCustomer.customerLabel = detailCustomer.customerLabel.filter(
        (one) => {
          return one.id !== label.label.id
        },
      )
      await customerModel.saveCustomer(detailCustomer)
    }
  })

  try {
    // Save label to database
    const newLabel: CustomerLabelEntity = {
      ...label.label,
      isDelete: true,
      organization,
      updatedBy: requester,
    }
    await labelModel.saveLabels([newLabel])
    return res.status(201).send(await labelModel.getLabels(organization))
  } catch (error) {
    errorMessage('CONTROLLER', 'label', 'updateLabel', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
