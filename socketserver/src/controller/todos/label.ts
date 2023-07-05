import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'

import { TodoLabelEntity, todoLabelModel } from '../../model/todos'

export const getLabels = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const result = await todoLabelModel.getLabels(organization)
    if (!result) {
      errorMessage('CONTROLLER', 'label', 'get labels')
      return next(new HttpException(500, ErrorCode[500]))
    }
    result.sort(function(a, b){
      if(a.title < b.title) { return -1; }
      if(a.title > b.title) { return 1; }
      return 0;
    })
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'label', 'getLabels', error)
    return next(new HttpException(500, ErrorCode[500]))
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

    const result = await todoLabelModel.getLabelWithId(id, organization)
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

  export function stringToColor(text: String) {
    let hash = 0;
    let i;

    for (i = 0; i < text.length; i += 1) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.substr(-2);
    }

    return color;
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
    const newLabels: TodoLabelEntity[] = []
    labels.forEach((element: string) => {
      const newLabel = new TodoLabelEntity()
      newLabel.organization = organization
      newLabel.title = element
      newLabel.color = stringToColor(element)
      newLabel.createdBy = requester
      newLabels.push(newLabel)
    })
    return res.status(201).send(await todoLabelModel.saveLabels(newLabels))
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
    const newLabel: TodoLabelEntity = {
      ...label,
      organization,
      updatedBy: requester,
    }
    return res.status(201).send(await todoLabelModel.saveLabels([newLabel]))
  } catch (error) {
    errorMessage('CONTROLLER', 'label', 'updateLabel', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
