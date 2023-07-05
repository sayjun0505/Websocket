import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { CustomerRewardLogEntity } from '.'

export const getRewardLogs = async (organization: OrganizationEntity) => {
  return await getRepository(CustomerRewardLogEntity).find({
    where: {
      organization,
    },
    relations: ['createdBy', 'customer','reward'],
  })
}

export const getRewardLogWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(CustomerRewardLogEntity).findOne({
    where: {
      id,
      organization,
    },
    relations: ['createdBy', 'customer','reward'],
  })
}

export const saveRewardLog = async (rewardLog: CustomerRewardLogEntity) => {
  try {
    return await getRepository(CustomerRewardLogEntity).save(rewardLog)
  } catch (error) {
    errorMessage('MODEL', 'rewardLog', 'saveRewardLog', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteRewardLog = async (id: string) => {
  try {
    return await getRepository(CustomerRewardLogEntity).delete(id)
  } catch (error) {
    errorMessage('MODEL', 'rewardLog', 'deleteRewardLog', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
