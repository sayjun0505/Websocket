import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'

import {
  NotificationEntity,
  notificationModel,
  notificationSettingModel,
  NOTIFICATION_EVENT,
  NOTIFICATION_TYPE,
} from '../../model/notification'
import { OrganizationEntity, userModel } from '../../model/organization'
import {
  ScrumboardCardActivityEntity,
  ScrumboardCardEntity,
} from '../../model/scrumboard'
import { NotificationData, sendNotificationToMultiUser } from '.'
import { gcsService } from '../../service/google'

const convertNotificationToData = async (
  notification: NotificationEntity,
  organization: OrganizationEntity,
): Promise<NotificationData> => {
  if (notification.data) {
    const _data = JSON.parse(notification.data)
    let moreData = _data
    if (
      _data &&
      _data.recordType &&
      _data.recordId &&
      _data.requesterId &&
      notification.type === NOTIFICATION_TYPE.SCRUMBOARD
    ) {
      const user = await userModel.getUserWithId(_data.requesterId)
      if (user) {
        moreData = {
          ..._data,
          requester: {
            id: user.id,
            display: user.display,
            pictureURL:
              user.picture &&
              JSON.parse(user.picture) &&
              JSON.parse(user.picture).filename
                ? gcsService.getUserProfileURL(
                    user.id,
                    JSON.parse(user.picture).filename,
                  )
                : '',
          },
        }
      }
    }
    return {
      id: notification.id,
      type: notification.type,
      event: notification.event,
      isRead: notification.isRead ? 'true' : 'false',
      createdAt: notification.createdAt.toString(),
      organization: JSON.stringify({
        id: organization.id,
        name: organization.name,
      }),
      data: moreData ? JSON.stringify(moreData) : undefined,
    } as NotificationData
  }
  throw new HttpException(500, ErrorCode[500])
}

export const notificationScrumboardNewCardMember = async (
  memberIds: string[],
  card: ScrumboardCardEntity,
  organization: OrganizationEntity,
  requesterId: string,
) => {
  // tslint:disable-next-line: no-console
  console.log(`Send notification Scrumboard new Card Member: ${card.id}`)
  try {
    const _userSettings = await notificationSettingModel.getSettingsWithUserIds(
      memberIds,
    )
    const userSettings = _userSettings.filter(
      (setting) => setting.scrumboard.mention && requesterId !== setting.userId,
    )
    if (userSettings.length > 0) {
      const _userIds = userSettings.map((item) => item.userId)
      const newNotifications = await Promise.all(
        _userIds.map(async (userId) => {
          // Create Notification
          return {
            type: NOTIFICATION_TYPE.SCRUMBOARD,
            event: NOTIFICATION_EVENT.NEW_CARD_MEMBER,
            isRead: false,
            userId,
            organizationId: organization.id,
            data: JSON.stringify({
              recordType: 'card',
              recordId: card.id,
              requesterId,
            }),
          } as NotificationEntity
        }),
      )
      const notifications = await notificationModel.saveNotifications(
        newNotifications,
      )
      // send notification to FCM after save data to Database
      const data = await convertNotificationToData(
        notifications[0],
        organization,
      )
      sendNotificationToMultiUser(memberIds, data)
    }
    return
  } catch (error) {
    errorMessage(
      'UTIL',
      'notification',
      'notificationScrumboardNewCardMember',
      error,
    )
    return
  }
}
export const notificationScrumboardNewCardCommentMention = async (
  userIds: string[],
  comment: ScrumboardCardActivityEntity,
  organization: OrganizationEntity,
) => {
  // tslint:disable-next-line: no-console
  console.log(`Send notification Scrumboard new Comment mention: ${comment.id}`)

  try {
    const _userSettings = await notificationSettingModel.getSettingsWithUserIds(
      userIds,
    )
    const userSettings = _userSettings.filter(
      (setting) =>
        setting.scrumboard.mention && comment.memberId !== setting.userId,
    )
    if (userSettings.length > 0) {
      const _userIds = userSettings.map((item) => item.userId)
      const newNotifications = await Promise.all(
        _userIds.map(async (userId) => {
          // Create Notification
          return {
            type: NOTIFICATION_TYPE.SCRUMBOARD,
            event: NOTIFICATION_EVENT.NEW_CARD_MENTION,
            isRead: false,
            userId,
            organizationId: organization.id,
            data: JSON.stringify({
              recordType: 'card',
              recordId: comment.cardId,
              commentId: comment.id,
              requesterId: comment.memberId,
            }),
          } as NotificationEntity
        }),
      )
      const notifications = await notificationModel.saveNotifications(
        newNotifications,
      )
      // send notification to FCM after save data to Database
      const data = await convertNotificationToData(
        notifications[0],
        organization,
      )
      sendNotificationToMultiUser(userIds, data)
    }
    return
  } catch (error) {
    errorMessage('UTIL', 'notification', 'notificationCommentMention', error)
    return
  }
}

export const notificationScrumboardCardNewDueDate = async (
  memberIds: string[],
  card: ScrumboardCardEntity,
  organization: OrganizationEntity,
  requesterId: string,
) => {
  // tslint:disable-next-line: no-console
  console.log(`Send notification Scrumboard new Card Due Date: ${card.id}`)
  try {
    const _userSettings = await notificationSettingModel.getSettingsWithUserIds(
      memberIds,
    )
    const userSettings = _userSettings.filter(
      (setting) => requesterId !== setting.userId,
    )

    if (userSettings.length > 0) {
      const _userIds = userSettings.map((item) => item.userId)
      const newNotifications = await Promise.all(
        _userIds.map(async (userId) => {
          // Create Notification
          return {
            type: NOTIFICATION_TYPE.SCRUMBOARD,
            event: NOTIFICATION_EVENT.NEW_CARD_DUE_DATE,
            isRead: false,
            userId,
            organizationId: organization.id,
            data: JSON.stringify({
              recordType: 'card',
              recordId: card.id,
              requesterId,
              dueDate: card.dueDate,
            }),
          } as NotificationEntity
        }),
      )
      const notifications = await notificationModel.saveNotifications(
        newNotifications,
      )
      // send notification to FCM after save data to Database
      const data = await convertNotificationToData(
        notifications[0],
        organization,
      )
      sendNotificationToMultiUser(memberIds, data)
    }
    return
  } catch (error) {
    errorMessage(
      'UTIL',
      'notification',
      'notificationScrumboardCardNewDueDate',
      error,
    )
    return
  }
}
export const notificationScrumboardCardEditDueDate = async (
  memberIds: string[],
  card: ScrumboardCardEntity,
  organization: OrganizationEntity,
  requesterId: string,
) => {
  // tslint:disable-next-line: no-console
  console.log(`Send notification Scrumboard edit Card Due Date: ${card.id}`)
  try {
    const _userSettings = await notificationSettingModel.getSettingsWithUserIds(
      memberIds,
    )
    const userSettings = _userSettings.filter(
      (setting) => requesterId !== setting.userId,
    )

    if (userSettings.length > 0) {
      const _userIds = userSettings.map((item) => item.userId)
      const newNotifications = await Promise.all(
        _userIds.map(async (userId) => {
          // Create Notification
          return {
            type: NOTIFICATION_TYPE.SCRUMBOARD,
            event: NOTIFICATION_EVENT.EDIT_CARD_DUE_DATE,
            isRead: false,
            userId,
            organizationId: organization.id,
            data: JSON.stringify({
              recordType: 'card',
              recordId: card.id,
              requesterId,
              dueDate: card.dueDate,
            }),
          } as NotificationEntity
        }),
      )
      const notifications = await notificationModel.saveNotifications(
        newNotifications,
      )
      // send notification to FCM after save data to Database
      const data = await convertNotificationToData(
        notifications[0],
        organization,
      )
      sendNotificationToMultiUser(memberIds, data)
    }
    return
  } catch (error) {
    errorMessage(
      'UTIL',
      'notification',
      'notificationScrumboardCardEditDueDate',
      error,
    )
    return
  }
}
