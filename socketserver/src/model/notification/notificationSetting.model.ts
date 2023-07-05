import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '../organization'
import { NotificationSettingEntity } from '.'

/**
 * Controller
 */

export const getNotificationSettingWithUserId = async (
  userId: string,
  // organization: OrganizationEntity,
) => {
  return await getRepository(NotificationSettingEntity).findOne({
    where: {
      userId,
    },
  })
}

export const saveNotificationSetting = async (
  notificationSetting: NotificationSettingEntity,
) => {
  try {
    return await getRepository(NotificationSettingEntity).save(
      notificationSetting,
    )
  } catch (error) {
    errorMessage(
      'MODEL',
      'notificationSetting',
      'saveNotificationSetting',
      error,
    )
    throw new HttpException(500, ErrorCode[500])
  }
}

/**
 * Util
 */
export const getSettingsWithUserIds = async (
  userIds: string[],
  // organization: OrganizationEntity,
) => {
  return await getRepository(NotificationSettingEntity).find({
    where: {
      userId: In(userIds),
    },
    relations: ['user'],
  })
}

export const getSettingsWithUserId = async (
  userId: string,
  // organization: OrganizationEntity,
) => {
  return await getRepository(NotificationSettingEntity).findOne({
    where: {
      userId,
    },
    relations: ['user'],
  })
}

export const getMentionNotificationSettingsWithEmailList = async (
  emailList: string[],
  // organization: OrganizationEntity,
) => {
  return await getRepository(NotificationSettingEntity).find({
    where: {
      // organization,
      user: {
        email: In(emailList),
      },
    },
    relations: ['user'],
  })
}
