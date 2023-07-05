import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'

import {
  ChatCommentEntity,
  ChatEntity,
  chatModel,
  MessageEntity,
} from '../../model/chat'
import {
  notificationSettingModel,
  NOTIFICATION_EVENT,
  NOTIFICATION_TYPE,
} from '../../model/notification'
import {
  NotificationEntity,
  notificationModel,
} from '../../model/notification/'
import {
  OrganizationEntity,
  organizationUserModel,
  userModel,
} from '../../model/organization'

import { NotificationData, sendNotificationToMultiUser } from './'
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
      _data.recordType === 'chat' &&
      notification.type === NOTIFICATION_TYPE.CHAT
    ) {
      if (
        notification.event === NOTIFICATION_EVENT.NEW_CHAT ||
        notification.event === NOTIFICATION_EVENT.NEW_MESSAGE
      ) {
        const chat = await chatModel.getChatForNotification(_data.recordId)

        if (chat && chat.customer && chat.channel) {
          const pictureURL = gcsService.getCustomerDisplayURL(
            chat.organizationId,
            chat.channelId,
            chat.customer.uid,
            chat.customer.picture,
          )
          let channelName = ''
          if (chat.channel) {
            if (chat.channel.line) {
              channelName = chat.channel.line.name
            }
            if (chat.channel.facebook) {
              channelName = chat.channel.facebook.name
            }
            if (chat.channel.instagram) {
              channelName = chat.channel.instagram.name
            }
          }
          moreData = {
            ..._data,
            customer: {
              id: chat.customer.id,
              display: chat.customer.display,
              pictureURL,
            },
            channel: {
              id: chat.channel.id,
              name: channelName,
            },
          }
        }
      } else if (
        notification.event === NOTIFICATION_EVENT.NEW_MENTION ||
        notification.event === NOTIFICATION_EVENT.NEW_OWNER
      ) {
        if (_data.requesterId) {
          console.log('_data.requesterId', _data.requesterId)
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

export const notificationNewChat = async (
  chat: ChatEntity,
  organization: OrganizationEntity,
) => {
  // tslint:disable-next-line: no-console
  console.log(`Send notification New Chat: ${chat.id}`)
  try {
    const usersInOrganization = await organizationUserModel.getUsers(
      organization.id,
    )
    const _userIds = usersInOrganization.map((el) => el.user.id)
    const _userSettings = await notificationSettingModel.getSettingsWithUserIds(
      _userIds,
    )
    const userSettings = _userSettings.filter((setting) => setting.chat.newChat)
    if (userSettings.length > 0) {
      const userIds = userSettings.map((item) => item.userId)
      const newNotifications = await Promise.all(
        userIds.map(async (userId) => {
          // Create Notification
          return {
            type: NOTIFICATION_TYPE.CHAT,
            event: NOTIFICATION_EVENT.NEW_CHAT,
            isRead: false,
            userId,
            organizationId: organization.id,
            data: JSON.stringify({
              recordType: 'chat',
              recordId: chat.id,
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
    errorMessage('UTIL', 'notification', 'notificationNewChat', error)
    return
  }
}

export const notificationNewMessage = async (
  message: MessageEntity,
  organization: OrganizationEntity,
) => {
  try {
    // tslint:disable-next-line: no-console
    console.log(`Send notification new Message: ${message.id}`)
    if (!message.chat.ownerId) {
      return
    }

    const setting = await notificationSettingModel.getSettingsWithUserId(
      message.chat.ownerId,
    )
    if (setting && setting.chat.newMessage) {
      const allNewMessageNotification =
        await notificationModel.getUserNewMessage(
          message.chat.ownerId,
          organization.id,
        )
      const currentNotification = allNewMessageNotification.find((_) => {
        const data = JSON.parse(_.data)
        return (
          data.recordType === 'chat' &&
          data.recordId === message.chatId &&
          _.userId === setting.userId
        )
      })

      let newMessage = 1

      if (currentNotification) {
        const currentData = JSON.parse(currentNotification.data)
        newMessage = currentData.newMessage + 1
        notificationModel.deleteNotification(currentNotification.id)
      }
      // new notification
      const newNotification = {
        type: NOTIFICATION_TYPE.CHAT,
        event: NOTIFICATION_EVENT.NEW_MESSAGE,
        isRead: false,
        userId: setting.userId,
        organizationId: organization.id,
        data: JSON.stringify({
          recordType: 'chat',
          recordId: message.chatId,
          messageId: message.id,
          newMessage,
        }),
      } as NotificationEntity
      const notifications = await notificationModel.saveNotifications([
        newNotification,
      ])
      // send notification to FCM after save data to Database
      const data = await convertNotificationToData(
        notifications[0],
        organization,
      )
      setTimeout(() => {
        sendNotificationToMultiUser([message.chat.ownerId], data)
      }, 300)
    }
    return
  } catch (error) {
    errorMessage('UTIL', 'notification', 'notificationNewMessage', error)
    return
  }
}

export const notificationCommentMention = async (
  userIds: string[],
  comment: ChatCommentEntity,
  organization: OrganizationEntity,
) => {
  // tslint:disable-next-line: no-console
  console.log(`Send notification new Comment: ${comment.id}`)
  try {
    const _userSettings = await notificationSettingModel.getSettingsWithUserIds(
      userIds,
    )
    const userSettings = _userSettings.filter((setting) => setting.chat.mention)
    if (userSettings.length > 0) {
      const _userIds = userSettings.map((item) => item.userId)
      const newNotifications = await Promise.all(
        _userIds.map(async (userId) => {
          // Create Notification
          return {
            type: NOTIFICATION_TYPE.CHAT,
            event: NOTIFICATION_EVENT.NEW_MENTION,
            isRead: false,
            userId,
            organizationId: organization.id,
            data: JSON.stringify({
              recordType: 'chat',
              recordId: comment.chatId,
              commentId: comment.id,
              requesterId: comment.createdBy.id,
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

export const notificationNewChatOwner = async (
  chat: ChatEntity,
  organization: OrganizationEntity,
) => {
  // tslint:disable-next-line: no-console
  console.log(`Send notification New Chat Owner: ${chat.id}`)
  try {
    if (!chat.ownerId) {
      return
    }
    const setting = await notificationSettingModel.getSettingsWithUserId(
      chat.ownerId,
    )

    if (setting && setting.chat.mention) {
      const newNotification = {
        type: NOTIFICATION_TYPE.CHAT,
        event: NOTIFICATION_EVENT.NEW_OWNER,
        isRead: false,
        userId: setting.userId,
        organizationId: organization.id,
        data: JSON.stringify({
          recordType: 'chat',
          recordId: chat.id,
          requesterId: chat.updatedBy.id,
        }),
      } as NotificationEntity

      const notifications = await notificationModel.saveNotifications([
        newNotification,
      ])

      // send notification to FCM after save data to Database
      const data = await convertNotificationToData(
        notifications[0],
        organization,
      )
      sendNotificationToMultiUser([chat.ownerId], data)
    }
    return
  } catch (error) {
    errorMessage('UTIL', 'notification', 'notificationNewChatOwner', error)
    // throw new HttpException(500, ErrorCode[500])
    return
  }
}
