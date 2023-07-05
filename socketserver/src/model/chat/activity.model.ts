import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { ChantActivityEntity } from '.'

export const getActivities = async (organization: OrganizationEntity) => {
  return await getRepository(ChantActivityEntity).find({
    where: {
      organization,
    },
    relations: ['createdBy', 'updatedBy'],
  })
}

export const getActivityWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChantActivityEntity).findOne({
    where: {
      id,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'chat'],
  })
}

export const getActivitiesWithChatId = async (
  chatId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChantActivityEntity).find({
    where: {
      chat: {
        id: chatId,
      },
      organization,
    },
    relations: ['createdBy', 'updatedBy'],
  })
}

export const saveActivity = async (activity: ChantActivityEntity) => {
  try {
    return await getRepository(ChantActivityEntity).save(activity)
  } catch (error) {
    errorMessage('MODEL', 'activity', 'saveActivity', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
