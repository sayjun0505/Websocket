import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '../organization'
import { NotificationTokenEntity } from '.'

export const getTokenWithUserIds = async (userIds: string[]) => {
  return await getRepository(NotificationTokenEntity).find({
    where: {
      userId: In(userIds),
    },
    // relations: ['user'],
  })
}

export const getTokenWithUserId = async (userId: string) => {
  return await getRepository(NotificationTokenEntity).findOne({
    where: {
      userId,
    },
    // relations: ['user'],
  })
}

export const getTokensWithUserId = async (userId: string) => {
  return await getRepository(NotificationTokenEntity).find({
    where: {
      userId,
    },
    // relations: ['user'],
  })
}

export const getTokenWithToken = async (token: string) => {
  return await getRepository(NotificationTokenEntity).findOne({
    where: {
      token,
    },
  })
}

export const saveNotificationToken = async (token: string, userId: string) => {
  try {
    return await getRepository(NotificationTokenEntity).save({
      token,
      userId,
    } as NotificationTokenEntity)
  } catch (error) {
    errorMessage('MODEL', 'NotificationToken', 'saveNotificationToken', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteToken = async (token: string) => {
  return await getRepository(NotificationTokenEntity).delete(token)
}
