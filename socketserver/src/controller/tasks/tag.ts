import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'

import { TaskTagEntity, taskTagModel } from '../../model/tasks'

export const getTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const result = await taskTagModel.getTags(organization)
    if (!result) {
      errorMessage('CONTROLLER', 'tag', 'get tags')
      return next(new HttpException(500, ErrorCode[500]))
    }
    result.sort(function (a, b) {
      if (a.title < b.title) {
        return -1
      }
      if (a.title > b.title) {
        return 1
      }
      return 0
    })
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'tag', 'getTags', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getTag = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'tag', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await taskTagModel.getTagWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'tag', 'tag not found')
      return next(new HttpException(404, 'tag not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'tag', 'getTag', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tags } = req.body
  if (!tags || tags.length < 1) {
    errorMessage('CONTROLLER', 'tag', 'invalid data(tag)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Add tags to database
    const newTags: TaskTagEntity[] = []
    tags.forEach((element: string) => {
      const newTag = new TaskTagEntity()
      newTag.organization = organization
      newTag.title = element
      newTag.createdBy = requester
      newTags.push(newTag)
    })
    await taskTagModel.saveTags(newTags)
    return res.status(201).send(await taskTagModel.getTags(organization))
  } catch (error) {
    errorMessage('CONTROLLER', 'tag', 'createTags', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateTag = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { tag } = req.body
  if (!tag || !tag.id) {
    errorMessage('CONTROLLER', 'tag', 'invalid data(tag)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Save tag to database
    const newTag: TaskTagEntity = {
      ...tag,
      organization,
      updatedBy: requester,
    }
    return res.status(201).send(await taskTagModel.saveTags([newTag]))
  } catch (error) {
    errorMessage('CONTROLLER', 'tag', 'updateTag', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const removeTag = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'tag', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await taskTagModel.removeTagWithId(id, requester)
    if (!result) {
      errorMessage('CONTROLLER', 'tag', 'tag not found')
      return next(new HttpException(404, 'tag not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'tag', 'removeTag', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
