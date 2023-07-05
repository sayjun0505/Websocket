import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { RewardEntity } from '.'

export const getRewards = async (organization: OrganizationEntity) => {
  return await getRepository(RewardEntity).find({
    where: {
      isDelete: false,
      organization,
    },
    relations: ['createdBy', 'updatedBy'],
  })
}

export const getRewardWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(RewardEntity).findOne({
    where: {
      id,
      isDelete: false,
      organization,
    },
    relations: ['createdBy', 'updatedBy'],
  })
}

export const saveReward = async (reward: RewardEntity) => {
  try {
    return await getRepository(RewardEntity).save(reward)
  } catch (error) {
    errorMessage('MODEL', 'reward', 'saveReward', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
