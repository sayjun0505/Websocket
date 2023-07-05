import { NextFunction, Request, Response } from 'express'
import { gcsService } from '../../service/google'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'

import {
  ScrumboardLabelEntity,
  ScrumboardLabelModel
} from '../../model/scrumboard'

export const getLabels = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  const { boardId } = req.params
  if (!boardId) {
    errorMessage('CONTROLLER', 'get Labels', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const rawLabels = await ScrumboardLabelModel.getLabelsWithBoardId(boardId)

  return res
    .status(201)
    .send(rawLabels)
}

export const createLabel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { boardId } = req.params
  const { title } = req.body.data
  if (!boardId || !title) {
    errorMessage('CONTROLLER', 'create board Label', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }
  try {
    // Save new label
    const saveList = await ScrumboardLabelModel.saveLabel({
      ...new ScrumboardLabelEntity(),
      boardId,
      title
    })
    return res
      .status(201)
      .send(
        saveList
      )
  } catch (error) {
    errorMessage('CONTROLLER', 'create board label', 'createLabel', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}