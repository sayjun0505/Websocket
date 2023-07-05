import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'

import { RewardEntity, rewardModel } from '../../model/customer'

export const getRewards = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const result = await rewardModel.getRewards(organization)
    if (!result) {
      errorMessage('CONTROLLER', 'reward', 'get rewards')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'reward', 'getRewards', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getReward = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'reward', 'invalid parameter(id)')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await rewardModel.getRewardWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'reward', 'reward not found')
      return next(new HttpException(404, 'reward not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'reward', 'getReward', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createReward = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { reward } = req.body
  if (!reward || reward.id) {
    errorMessage('CONTROLLER', 'reward', 'invalid data(reward)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Add reward to database
    const newReward: RewardEntity = {
      ...reward,
      organization,
      createdBy: requester,
    }
    return res.status(201).send(await rewardModel.saveReward(newReward))
  } catch (error) {
    errorMessage('CONTROLLER', 'reward', 'createReward', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateReward = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { reward } = req.body
  if (!reward || !reward.id) {
    errorMessage('CONTROLLER', 'reward', 'invalid data(reward)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Save reward to database
    const newReward: RewardEntity = {
      ...reward,
      organization,
      updatedBy: requester,
    }
    return res.status(201).send(await rewardModel.saveReward(newReward))
  } catch (error) {
    errorMessage('CONTROLLER', 'reward', 'updateReward', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteReward = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    errorMessage('CONTROLLER', 'reward', 'invalid parameter(id)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    const rewardResult = await rewardModel.getRewardWithId(id, organization)
    if (!rewardResult) {
      errorMessage('CONTROLLER', 'reward', ' Reward not found')
      return next(new HttpException(404, 'reward not found'))
    }
    // Save reward to database
    const newReward: RewardEntity = {
      ...rewardResult,
      isDelete: true,
      updatedBy: requester,
    }
    return res.status(201).send(await rewardModel.saveReward(newReward))
  } catch (error) {
    errorMessage('CONTROLLER', 'reward', 'deleteReward', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
