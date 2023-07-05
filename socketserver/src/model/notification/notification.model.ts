import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In } from 'typeorm'
import { NotificationEntity, NOTIFICATION_EVENT, NOTIFICATION_TYPE } from '.'
import { UserEntity } from '../organization'

/**
 * Controller
 */

export const getNotifications = async (
  userId: string,
  page: number = 0,
  size: number = 0,
) => {
  if (page !== 0 && size !== 0) {
    return await getRepository(NotificationEntity).findAndCount({
      where: {
        userId,
      },
      select: [
        'id',
        'type',
        'event',
        'isRead',
        'organization',
        'createdAt',
        'data',
      ],
      relations: ['organization'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * size,
      take: size,
    })
  } else {
    return await getRepository(NotificationEntity).findAndCount({
      where: {
        userId,
      },
      select: [
        'id',
        'type',
        'event',
        'isRead',
        'organization',
        'createdAt',
        'data',
      ],
      relations: ['organization'],
      order: { createdAt: 'ASC' },
    })
  }
}

export const getNotificationsforSocket = async (
  userId: string,
  page: number = 0,
  size: number = 0,
) => {
  console.log("aaaaa")
  if (page !== 0 && size !== 0) {
    return await getRepository(NotificationEntity).findAndCount({
      where: {
        userId,
      },
      select: [
        'id',
        'type',
        'event',
        'isRead',
        'organization',
        'createdAt',
        'data',
      ],
      relations: ['organization'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * size,
      take: size,
    })
  } else {
    return await getRepository(NotificationEntity).findAndCount({
      where: {
        userId,
      },
      select: [
        'id',
        'type',
        'event',
        'isRead',
        'organization',
        'createdAt',
        'data',
      ],
      relations: ['organization'],
      order: { createdAt: 'ASC' },
    })
  }
}
export const getAllNotifications = async (userId: string) => {
  return await getRepository(NotificationEntity).find({
    where: {
      userId,
    },
    select: ['id'],
  })
}

export const getNotificationsWithIds = async (notificationIds: string[]) => {
  return await getRepository(NotificationEntity).find({
    where: {
      id: In(notificationIds),
    },
    relations: ['organization'],
  })
}

export const markReadWithNotificationIds = async (
  notificationIds: string[],
) => {
  try {
    return await Promise.all(
      notificationIds.map((notificationId) => {
        return getRepository(NotificationEntity).update(
          { id: notificationId },
          { isRead: true },
        )
      }),
    )
  } catch (error) {
    errorMessage('MODEL', 'notification', 'markReadWithNotificationIds', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const saveNotifications = async (
  notifications: NotificationEntity[],
) => {
  try {
    return await getRepository(NotificationEntity).save(notifications)
  } catch (error) {
    errorMessage('MODEL', 'notification', 'saveNotifications', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteNotificationIds = async (notificationIds: string[]) => {
  try {
    return getRepository(NotificationEntity).delete(notificationIds)
  } catch (error) {
    errorMessage('MODEL', 'notification', 'deleteNotificationIds', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getUserUnreadCount = async (userId: string) => {
  try {
    return await getRepository(NotificationEntity).count({
      where: {
        userId,
        isRead: false,
      },
    })
  } catch (error) {
    errorMessage('MODEL', 'notification', 'getUserUnreadCount', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const getOrganizationUnreadCount = async (organizationId: string) => {
  try {
    return await getRepository(NotificationEntity).count({
      where: {
        organizationId,
        isRead: false,
      },
    })
  } catch (error) {
    errorMessage('MODEL', 'notification', 'getOrganizationUnreadCount', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteNotification = async (id: string) => {
  try {
    return await getRepository(NotificationEntity).delete(id)
  } catch (error) {
    errorMessage('MODEL', 'notification', 'deleteNotification', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

/**
 * Chat Notification
 */
export const getUserNewMessage = async (
  userId: string,
  organizationId: string,
) => {
  try {
    return await getRepository(NotificationEntity).find({
      where: {
        userId,
        isRead: false,
        type: NOTIFICATION_TYPE.CHAT,
        event: NOTIFICATION_EVENT.NEW_MESSAGE,
        organizationId,
      },
    })
  } catch (error) {
    errorMessage('MODEL', 'notification', 'getUserNewMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

/**
 * Teamchat Notification
 */
export const getUserNewHQMessage = async (
  userIds: string[],
  organizationId: string,
) => {
  try {
    return await getRepository(NotificationEntity).find({
      where: {
        userId: In(userIds),
        isRead: false,
        type: NOTIFICATION_TYPE.TEAMCHAT,
        event: NOTIFICATION_EVENT.NEW_HQ_MESSAGE,
        organizationId,
      },
    })
  } catch (error) {
    errorMessage('MODEL', 'notification', 'getUserNewHQMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const getUserNewChannelMessage = async (
  userIds: string[],
  organizationId: string,
) => {
  try {
    return await getRepository(NotificationEntity).find({
      where: {
        userId: In(userIds),
        isRead: false,
        type: NOTIFICATION_TYPE.TEAMCHAT,
        event: NOTIFICATION_EVENT.NEW_CHANNEL_MESSAGE,
        organizationId,
      },
    })
  } catch (error) {
    errorMessage('MODEL', 'notification', 'getUserNewChannelMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
// export const getUserNewReplyChannelMessage = async (
//   userIds: string[],
//   organizationId: string,
// ) => {
//   try {
//     return await getRepository(NotificationEntity).find({
//       where: {
//         userId: In(userIds),
//         isRead: false,
//         type: NOTIFICATION_TYPE.TEAMCHAT,
//         event: NOTIFICATION_EVENT.NEW_REPLY_CHANNEL_MESSAGE,
//         organizationId,
//       },
//     })
//   } catch (error) {
//     errorMessage('MODEL', 'notification', 'getUserNewChannelMessage', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }
export const getUserNewDirectMessage = async (
  userId: string,
  organizationId: string,
) => {
  try {
    return await getRepository(NotificationEntity).find({
      where: {
        userId,
        isRead: false,
        type: NOTIFICATION_TYPE.TEAMCHAT,
        event: NOTIFICATION_EVENT.NEW_DIRECT_MESSAGE,
        organizationId,
      },
    })
  } catch (error) {
    errorMessage('MODEL', 'notification', 'getUserNewDirectMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
