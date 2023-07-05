import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'

import {
  replyModel,
  ReplyResponseEntity,
  responseModel,
} from '../../model/reply'
import { gcsService } from '../../service/google'

export const getResponses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const result = await responseModel.getResponses(organization)
    if (!result) {
      errorMessage('CONTROLLER', 'response', 'get responses')
      return next(new HttpException(500, ErrorCode[500]))
    }

    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'response', 'getResponses', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getResponse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { replyId } = req.query
    if (!replyId || typeof replyId !== 'string') {
      errorMessage('CONTROLLER', 'response', 'invalid parameter(replyId)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await responseModel.getResponseWithReplyId(
      replyId,
      organization,
    )
    if (!result) {
      errorMessage('CONTROLLER', 'response', 'response not found')
      return next(new HttpException(404, 'response not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'response', 'getResponse', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createResponse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { response, replyId } = req.body
  if (!response || response.id) {
    errorMessage('CONTROLLER', 'response', 'invalid data(response)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  if (!replyId || typeof replyId !== 'string') {
    errorMessage('CONTROLLER', 'response', 'invalid parameter(replyId)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Add response to database
    const newResponse: ReplyResponseEntity = {
      ...response,
      organization,
      reply: { id: replyId },
      createdBy: requester,
    }
    return res.status(201).send(await responseModel.saveResponse(newResponse))
  } catch (error) {
    errorMessage('CONTROLLER', 'response', 'createResponse', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateResponse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { response } = req.body
  if (!response || !response.id) {
    errorMessage('CONTROLLER', 'response', 'invalid data(response)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Save response to database
    const newResponse: ReplyResponseEntity = {
      ...response,
      organization,
      updatedBy: requester,
    }
    return res.status(201).send(await responseModel.saveResponse(newResponse))
  } catch (error) {
    errorMessage('CONTROLLER', 'response', 'updateResponse', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteResponse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    errorMessage('CONTROLLER', 'response', 'invalid parameter')
    return next(new HttpException(400, ErrorCode[400]))
  }
  try {
    return res.status(201).send(await responseModel.deleteResponse(id))
  } catch (error) {
    errorMessage('CONTROLLER', 'response', 'deleteResponse', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const uploadContent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { replyId } = req.params
  if (!replyId) {
    errorMessage('CONTROLLER', 'response', 'invalid parameter(replyId)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const organization: OrganizationEntity = req.body.organization

  // const reply = await replyModel.getReplyWithId(replyId, organization)
  // if (!reply) {
  //   errorMessage('CONTROLLER', 'reply', 'reply not found')
  //   return next(new HttpException(404, ErrorCode[404]))
  // }

  const content = req.file
  if (!content) {
    errorMessage('CONTROLLER', 'reply', 'invalid file')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const contentName = await gcsService.uploadImageReplyTemplate(
      replyId,
      organization.id,
      content.originalname,
      { data: content.buffer },
    )

    const url = await gcsService.getReplyContentURL(
      replyId,
      organization.id,
      contentName,
    )

    return res.status(200).json({
      message: 'Upload was successful',
      filename: contentName,
      url,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'reply', 'uploadContent', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}
