import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'

import { keywordModel, ReplyKeywordEntity } from '../../model/reply'

export const getKeywords = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const result = await keywordModel.getKeywords(organization)
    if (!result) {
      errorMessage('CONTROLLER', 'keyword', 'get keywords')
      return next(new HttpException(500, ErrorCode[500]))
    }

    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'keyword', 'getKeywords', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getKeyword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { replyId } = req.query
    if (!replyId || typeof replyId !== 'string') {
      errorMessage('CONTROLLER', 'keyword', 'invalid parameter(replyId)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await keywordModel.getKeywordsWithReply(
      replyId,
      organization,
    )
    if (!result) {
      errorMessage('CONTROLLER', 'keyword', 'keyword not found')
      return next(new HttpException(404, 'keyword not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'keyword', 'getKeyword', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createKeyword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { keyword, replyId } = req.body
  if (!keyword || keyword.id) {
    errorMessage('CONTROLLER', 'keyword', 'invalid data(keyword)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  if (!replyId || typeof replyId !== 'string') {
    errorMessage('CONTROLLER', 'keyword', 'invalid parameter(replyId)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Add team to database
    const newKeyword: ReplyKeywordEntity = {
      ...keyword,
      organization,
      reply: { id: replyId },
      createdBy: requester,
    }
    return res.status(201).send(await keywordModel.saveKeyword(newKeyword))
  } catch (error) {
    errorMessage('CONTROLLER', 'keyword', 'createKeyword', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateKeyword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { keyword } = req.body
  if (!keyword || !keyword.id) {
    errorMessage('CONTROLLER', 'keyword', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Save team to database
    const newKeyword: ReplyKeywordEntity = {
      ...keyword,
      organization,
      updatedBy: requester,
    }
    return res.status(201).send(await keywordModel.saveKeyword(newKeyword))
  } catch (error) {
    errorMessage('CONTROLLER', 'keyword', 'updateKeyword', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteKeyword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    errorMessage('CONTROLLER', 'keyword', 'invalid parameter')
    return next(new HttpException(400, ErrorCode[400]))
  }
  try {
    return res.status(201).send(await keywordModel.deleteKeyword(id))
  } catch (error) {
    errorMessage('CONTROLLER', 'keyword', 'deleteKeyword', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
