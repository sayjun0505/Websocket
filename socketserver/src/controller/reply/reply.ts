import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'

import {
  ReplyEntity,
  ReplyKeywordEntity,
  replyModel,
  ReplyResponseEntity,
  REPLY_STATUS,
} from '../../model/reply'

export const getReplies = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const result = await replyModel.getReplies(organization)
    if (!result) {
      errorMessage('CONTROLLER', 'reply', 'get replies')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'reply', 'getReplies', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getRepliesWithType = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { type } = req.params
  if (!type || typeof type !== 'string') {
    errorMessage('CONTROLLER', 'reply', 'invalid parameter(type)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const organization: OrganizationEntity = req.body.organization
    const result = await replyModel.getRepliesWithType(type, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'reply', 'get replies')
      return next(new HttpException(500, ErrorCode[500]))
    }

    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'reply', 'getRepliesWithType', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getReply = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { id } = req.params
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'reply', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await replyModel.getReplyWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'reply', 'reply not found')
      return next(new HttpException(404, 'reply not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'reply', 'getReply', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createReply = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { reply } = req.body
  if (!reply) {
    errorMessage('CONTROLLER', 'reply', 'invalid data(reply)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    if (reply.keyword && reply.keyword.length > 0) {
      const keywords = reply.keyword.map((element: any) => {
        return {
          ...element,
          organization,
        } as ReplyKeywordEntity
      })
      reply.keyword = keywords
    }
    if (reply.response && reply.response.length > 0) {
      const responses = reply.response.map((element: any) => {
        return {
          ...element,
          organization,
        } as ReplyResponseEntity
      })
      reply.response = responses
    }
    // Add reply to database
    const newReply: ReplyEntity = {
      ...reply,
      organization,
      createdBy: requester,
    }
    return res.status(201).send(await replyModel.saveReply(newReply))
  } catch (error) {
    errorMessage('CONTROLLER', 'reply', 'createReply', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateReply = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { reply } = req.body
  if (!reply) {
    errorMessage('CONTROLLER', 'reply', 'invalid data(reply)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    if (reply.keyword && reply.keyword.length > 0) {
      const keywords = reply.keyword.map((element: any) => {
        return {
          ...element,
          organization,
        } as ReplyKeywordEntity
      })
      reply.keyword = keywords
    }
    if (reply.response && reply.response.length > 0) {
      const responses = reply.response.map((element: any) => {
        return {
          ...element,
          organization,
        } as ReplyResponseEntity
      })
      reply.response = responses
    }
    // Save reply to database
    const newReply: ReplyEntity = {
      ...reply,
      organization,
      updatedBy: requester,
    }
    return res.status(201).send(await replyModel.saveReply(newReply))
  } catch (error) {
    console.error('[updateReply][ERROR] ', error)
    errorMessage('CONTROLLER', 'reply', 'updateReply', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteReply = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params
  if (!id || typeof id !== 'string') {
    errorMessage('CONTROLLER', 'reply', 'invalid parameter(id)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    await replyModel.deleteReply(id, requester.id)
    return res.status(201).send(id)
  } catch (error) {
    errorMessage('CONTROLLER', 'reply', 'deleteReply', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateReplyStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, status } = req.params
  if (!id || typeof id !== 'string' || !status) {
    errorMessage('CONTROLLER', 'reply', 'invalid parameter(id, status)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    return res
      .status(201)
      .send(
        await replyModel.updateStatus(id, status as REPLY_STATUS, requester.id),
      )
  } catch (error) {
    console.error('[updateReply][ERROR] ', error)
    errorMessage('CONTROLLER', 'reply', 'updateReplyStatus', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
