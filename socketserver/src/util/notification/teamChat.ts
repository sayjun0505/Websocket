import * as admin from 'firebase-admin'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'

import {
  ChatCommentEntity,
  ChatEntity,
  chatModel,
  CHAT_COMMENT_TYPE,
  MessageEntity,
  MESSAGE_TYPE,
} from '../../model/chat'
import {
  DR_MESSAGE_TYPE,
  TeamChatChannelMemberEntity,
  teamChatChannelMemberModel,
  teamChatChannelMessageModel,
  teamChatChannelModel,
  teamChatDirectMessageModel,
  TeamChatHQMessageEntity,
  teamChatHQMessageModel,
  TeamChatThreadMessageEntity,
  TEAMCHAT_HQ_MESSAGE_TYPE,
  TEAMCHAT_MESSAGE_TYPE,
} from '../../model/teamChat'
import {
  notificationSettingModel,
  NOTIFICATION_EVENT,
  NOTIFICATION_TYPE,
  // NotificationUserEntity,
  // notificationUserModel,
} from '../../model/notification'
import {
  NotificationEntity,
  notificationModel,
  NotificationSettingEntity,
} from '../../model/notification'
import {
  OrganizationEntity,
  organizationModel,
  organizationUserModel,
  UserEntity,
  userModel,
} from '../../model/organization'
import { CHANNEL } from '../../model/channel'
// TeamChat and DirectMessage
import { TeamChatDirectMessageEntity } from '../../model/teamChat'
import { TeamChatChannelMessageEntity } from '../../model/teamChat/message.entity'
import { TeamChatChannelEntity } from '../../model/teamChat/channel.entity'

import { NotificationData, sendNotificationToMultiUser } from '.'
import { gcsService } from '../../service/google'
import thread from 'src/api/teamChat/thread'

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
      notification.type === NOTIFICATION_TYPE.TEAMCHAT
    ) {
      const user = await userModel.getUserWithId(_data.requesterId)
      if (user) {
        moreData = {
          ...moreData,
          requester: {
            id: user.id,
            isOnline: user.isOnline,
            email: user.email,
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

      if (
        notification.event === NOTIFICATION_EVENT.NEW_THREAD ||
        notification.event === NOTIFICATION_EVENT.NEW_THREAD_CHANNEL_MESSAGE ||
        notification.event === NOTIFICATION_EVENT.NEW_THREAD_DIRECT_MESSAGE ||
        notification.event === NOTIFICATION_EVENT.NEW_THREAD_HQ_MESSAGE
      ) {
        if (_data.recordType === 'channel') {
          const channel =
            await teamChatChannelModel.getTeamchatChannelForNotification(
              _data.recordId,
            )
          if (channel) {
            moreData = {
              ...moreData,
              channel: {
                id: channel.id,
                name: channel.name,
              },
            }
          }
        } else if (_data.recordType === 'directChannel') {
          const directUser = await userModel.getUserWithId(_data.recordId)
          if (directUser) {
            moreData = {
              ...moreData,
              user: {
                id: directUser.id,
                display: directUser.display,
              },
            }
          }
        } else if (_data.recordType === 'hq') {
          const _organization = await organizationModel.getOrganizationWithId(
            _data.recordId,
          )
          if (_organization) {
            moreData = {
              ...moreData,
              organization: {
                id: _organization.id,
                name: _organization.name,
              },
            }
          }
        }
      }
    }
    if (
      _data &&
      _data.event &&
      _data.event === NOTIFICATION_EVENT.NEW_THREAD_DIRECT_MESSAGE &&
      _data.messageId
    ) {
      const threadMainData =
        (await teamChatDirectMessageModel.getDirectMessageWithMessageId(
          _data.messageId,
        )) as TeamChatDirectMessageEntity

      moreData = {
        ...moreData,
        messageData: threadMainData
          ? {
              id: threadMainData.id,
              data: threadMainData.data,
              type: threadMainData.type,
              senderName: threadMainData.sendUser.display,
              senderPicture: threadMainData.sendUser.picture,
              senderId: threadMainData.sendUser.id,
              createdAt: threadMainData.createdAt,
            }
          : undefined,
      }
    }

    if (
      _data &&
      _data.event &&
      _data.event === NOTIFICATION_EVENT.NEW_THREAD_CHANNEL_MESSAGE &&
      _data.event === NOTIFICATION_EVENT.NEW_THREAD_HQ_MESSAGE &&
      _data.messageId
    ) {
      let threadMainData
      if (_data.event === NOTIFICATION_EVENT.NEW_THREAD_CHANNEL_MESSAGE) {
        threadMainData =
          (await teamChatChannelMessageModel.getChannelMessagesWithMessageId(
            _data.messageId,
          )) as TeamChatChannelMessageEntity
      } else if (_data.event === NOTIFICATION_EVENT.NEW_THREAD_HQ_MESSAGE) {
        threadMainData =
          (await teamChatHQMessageModel.getHQMessagesWithMessageId(
            _data.messageId,
          )) as TeamChatHQMessageEntity
      }

      moreData = {
        ...moreData,
        messageData: threadMainData
          ? {
              id: threadMainData.id,
              data: threadMainData.data,
              type: threadMainData.type,
              senderName: threadMainData.createdBy.display,
              senderPicture: threadMainData.createdBy.picture,
              senderId: threadMainData.createdBy.id,
              createdAt: threadMainData.createdAt,
            }
          : undefined,
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

export const notificationAddMember = async (
  memberIds: string[],
  channel: TeamChatChannelEntity,
  organization: OrganizationEntity,
  requesterId: string,
) => {
  try {
    console.log(
      `Send notification new Member of Teamchat Channel: ${channel.id}`,
    )
    const _userSettings = await notificationSettingModel.getSettingsWithUserIds(
      memberIds,
    )
    const userSettings = _userSettings.filter(
      (setting) => setting.teamchat.addMember && requesterId !== setting.userId,
    )
    if (userSettings.length > 0) {
      const userIds = userSettings.map((item) => item.userId)
      const newNotifications = await Promise.all(
        userIds.map(async (userId) => {
          // Create Notification
          return {
            type: NOTIFICATION_TYPE.TEAMCHAT,
            event: NOTIFICATION_EVENT.ADD_MEMBER,
            isRead: false,
            userId,
            organizationId: organization.id,
            data: JSON.stringify({
              recordType: 'channel',
              recordId: channel.id,
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
      sendNotificationToMultiUser(userIds, data)
    }
    return
  } catch (error) {
    errorMessage('UTIL', 'notification', 'notificationAddMember', error)
    // throw new HttpException(500, ErrorCode[500])
    return
  }
}
export const notificationHQMessage = async (
  userIds: string[],
  message: TeamChatHQMessageEntity,
  organization: OrganizationEntity,
) => {
  // tslint:disable-next-line: no-console
  console.log(`Send notification new HQ Message: ${message.id}`)

  const _userSettings = await notificationSettingModel.getSettingsWithUserIds(
    userIds,
  )
  const userSettings = _userSettings.filter(
    (setting) =>
      setting.teamchat.newHQMessage && message.createdById !== setting.userId,
  )

  if (userSettings.length > 0) {
    const allNewHQMessageNotification =
      await notificationModel.getUserNewHQMessage(userIds, organization.id)
    const newNotifications = await Promise.all(
      userIds.map(async (userId) => {
        const currentNotification = allNewHQMessageNotification.find((_) => {
          const currentData = JSON.parse(_.data)
          return currentData.recordType === 'hq' && _.userId === userId
        })

        let newMessage = 1
        if (currentNotification) {
          const currentData = JSON.parse(currentNotification.data)
          newMessage = currentData.newMessage + 1
          notificationModel.deleteNotification(currentNotification.id)
        }

        // Create Notification
        return {
          type: NOTIFICATION_TYPE.TEAMCHAT,
          event: NOTIFICATION_EVENT.NEW_HQ_MESSAGE,
          isRead: false,
          userId,
          organizationId: organization.id,
          data: JSON.stringify({
            recordType: 'hq',
            messageId: message.id,
            newMessage,
            requesterId: message.createdBy.id,
          }),
        } as NotificationEntity
      }),
    )
    const notifications = await notificationModel.saveNotifications(
      newNotifications,
    )

    // send notification to FCM after save data to Database
    const data = await convertNotificationToData(notifications[0], organization)
    sendNotificationToMultiUser(userIds, data)
  }
  return
}
export const notificationChannelMessage = async (
  memberIds: string[],
  message: TeamChatChannelMessageEntity,
  organization: OrganizationEntity,
) => {
  // tslint:disable-next-line: no-console
  console.log(`Send notification new Channel Message: ${message.id}`)

  const _userSettings = await notificationSettingModel.getSettingsWithUserIds(
    memberIds,
  )
  const userSettings = _userSettings.filter(
    (setting) =>
      setting.teamchat.newChannelMessage &&
      message.createdById !== setting.userId,
  )

  if (userSettings.length > 0) {
    const userIds = userSettings.map((item) => item.userId)
    const allNewChannelMessageNotification =
      await notificationModel.getUserNewChannelMessage(userIds, organization.id)
    const newNotifications = await Promise.all(
      userIds.map(async (userId) => {
        const currentNotification = allNewChannelMessageNotification.find(
          (_) => {
            const data = JSON.parse(_.data)
            return (
              data.recordType === 'channel' &&
              data.recordId === message.channelId &&
              _.userId === userId
            )
          },
        )

        let newMessage = 1
        if (currentNotification) {
          const currentData = JSON.parse(currentNotification.data)
          newMessage = currentData.newMessage + 1
          notificationModel.deleteNotification(currentNotification.id)
        }

        // Create Notification
        return {
          type: NOTIFICATION_TYPE.TEAMCHAT,
          event: NOTIFICATION_EVENT.NEW_CHANNEL_MESSAGE,
          isRead: false,
          userId,
          organizationId: organization.id,
          data: JSON.stringify({
            recordType: 'channel',
            recordId: message.channelId,
            messageId: message.id,
            newMessage,
            requesterId: message.createdBy.id,
          }),
        } as NotificationEntity
      }),
    )
    const notifications = await notificationModel.saveNotifications(
      newNotifications,
    )
    // send notification to FCM after save data to Database
    const data = await convertNotificationToData(notifications[0], organization)
    sendNotificationToMultiUser(userIds, data)
  }
  return
}
export const notificationDirectMessage = async (
  message: TeamChatDirectMessageEntity,
  receiveUserId: string,
  organization: OrganizationEntity,
) => {
  try {
    const setting =
      await notificationSettingModel.getNotificationSettingWithUserId(
        receiveUserId,
      )
    if (
      setting &&
      setting.teamchat.newDirectMessage &&
      message.sendUserId !== setting.userId
    ) {
      const allNewMessageNotification =
        await notificationModel.getUserNewDirectMessage(
          receiveUserId,
          organization.id,
        )
      const currentNotification = allNewMessageNotification.find((_) => {
        const data = JSON.parse(_.data)
        return (
          data.recordType === 'directChannel' && data.recordId === receiveUserId
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
        type: NOTIFICATION_TYPE.TEAMCHAT,
        event: NOTIFICATION_EVENT.NEW_DIRECT_MESSAGE,
        isRead: false,
        userId: setting.userId,
        organizationId: organization.id,
        data: JSON.stringify({
          recordType: 'directChannel',
          recordId: message.sendUser.id,
          messageId: message.id,
          newMessage,
          requesterId: message.sendUser.id,
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
        sendNotificationToMultiUser([receiveUserId], data)
      }, 300)
    }
    return
  } catch (error) {
    errorMessage('UTIL', 'notification', 'notificationDirectMessage', error)
    // throw new HttpException(500, ErrorCode[500])
    return
  }
}

export const notificationChannelMention = async (
  userIds: string[],
  message: TeamChatChannelMessageEntity,
  organization: OrganizationEntity,
) => {
  // tslint:disable-next-line: no-console
  console.log(`Send notification new Channel Mention: ${message.id}`)

  const _userSettings = await notificationSettingModel.getSettingsWithUserIds(
    userIds,
  )
  const userSettings = _userSettings.filter(
    (setting) =>
      setting.teamchat.mention && message.createdById !== setting.userId,
  )
  if (userSettings.length > 0) {
    const _userIds = userSettings.map((item) => item.userId)
    const newNotifications = await Promise.all(
      _userIds.map(async (userId) => {
        // Create Notification
        return {
          type: NOTIFICATION_TYPE.TEAMCHAT,
          event: NOTIFICATION_EVENT.NEW_CHANNEL_MENTION,
          isRead: false,
          userId,
          organizationId: organization.id,
          data: JSON.stringify({
            recordType: 'channel',
            recordId: message.channelId,
            messageId: message.id,
            requesterId: message.createdBy.id,
          }),
        } as NotificationEntity
      }),
    )
    const notifications = await notificationModel.saveNotifications(
      newNotifications,
    )
    // send notification to FCM after save data to Database
    const data = await convertNotificationToData(notifications[0], organization)
    sendNotificationToMultiUser(userIds, data)
  }
  return
}
export const notificationHQMessageMention = async (
  userIds: string[],
  message: TeamChatHQMessageEntity,
  organization: OrganizationEntity,
) => {
  // tslint:disable-next-line: no-console
  console.log(`Send notification new HQ Mention: ${message.id}`)

  const _userSettings = await notificationSettingModel.getSettingsWithUserIds(
    userIds,
  )
  const userSettings = _userSettings.filter(
    (setting) =>
      setting.teamchat.mention && message.createdById !== setting.userId,
  )
  if (userSettings.length > 0) {
    const _userIds = userSettings.map((item) => item.userId)
    const newNotifications = await Promise.all(
      _userIds.map(async (userId) => {
        // Create Notification
        return {
          type: NOTIFICATION_TYPE.TEAMCHAT,
          event: NOTIFICATION_EVENT.NEW_HQ_MENTION,
          isRead: false,
          userId,
          organizationId: organization.id,
          data: JSON.stringify({
            recordType: 'hq',
            messageId: message.id,
            requesterId: message.createdBy.id,
          }),
        } as NotificationEntity
      }),
    )
    const notifications = await notificationModel.saveNotifications(
      newNotifications,
    )
    // send notification to FCM after save data to Database
    const data = await convertNotificationToData(notifications[0], organization)
    sendNotificationToMultiUser(userIds, data)
  }
  return
}

// export const notificationReplyChannelMessage = async (
//   memberIds: string[],
//   message: TeamChatChannelMessageEntity,
//   organization: OrganizationEntity,
// ) => {
//   // tslint:disable-next-line: no-console
//   console.log(`Send notification new Reply Message: ${message.id}`)

//   const _userSettings = await notificationSettingModel.getSettingsWithUserIds(
//     memberIds,
//   )
//   const userSettings = _userSettings.filter(
//     (setting) =>
//       setting.teamchat.newChannelMessage &&
//       message.createdById !== setting.userId,
//   )

//   if (userSettings.length > 0) {
//     const userIds = userSettings.map((item) => item.userId)
//     const allNewReplyChannelMessageNotification =
//       await notificationModel.getUserNewReplyChannelMessage(
//         userIds,
//         organization.id,
//       )
//     const newNotifications = await Promise.all(
//       userIds.map(async (userId) => {
//         const currentNotification = allNewReplyChannelMessageNotification.find(
//           (_) => {
//             const data = JSON.parse(_.data)
//             return (
//               data.recordType === 'channel' &&
//               data.recordId === message.channelId &&
//               _.userId === userId
//             )
//           },
//         )

//         let newMessage = 1
//         if (currentNotification) {
//           const currentData = JSON.parse(currentNotification.data)
//           newMessage = currentData.newMessage + 1
//           notificationModel.deleteNotification(currentNotification.id)
//         }

//         // Create Notification
//         return {
//           type: NOTIFICATION_TYPE.TEAMCHAT,
//           event: NOTIFICATION_EVENT.NEW_REPLY_CHANNEL_MESSAGE,
//           isRead: false,
//           userId,
//           organizationId: organization.id,
//           data: JSON.stringify({
//             recordType: 'channel',
//             recordId: message.channelId,
//             messageId: message.id,
//             newMessage,
//             requesterId: message.createdBy.id,
//           }),
//         } as NotificationEntity
//       }),
//     )
//     const notifications = await notificationModel.saveNotifications(
//       newNotifications,
//     )
//     // send notification to FCM after save data to Database
//     const data = await convertNotificationToData(notifications[0], organization)
//     sendNotificationToMultiUser(userIds, data)
//   }
//   return
// }

export const notificationNewThread = async (
  message: TeamChatThreadMessageEntity,
  requesterId: string,
  organization: OrganizationEntity,
) => {
  try {
    console.log(`Send notification new Thread: ${message.id}`)

    // Thread in Channel
    const channelMessageData =
      await teamChatChannelMessageModel.getChannelMessagesWithMessageId(
        message.threadId,
      )
    if (channelMessageData && channelMessageData.id === message.threadId) {
      const channelMember = await teamChatChannelMemberModel.getChannelMembers(
        channelMessageData.id,
      )
      const _userSettings =
        await notificationSettingModel.getSettingsWithUserIds(
          channelMember.map((_) => _.memberId),
        )
      const userSettings = _userSettings.filter(
        (setting) =>
          setting.teamchat.newChannelMessage && requesterId !== setting.userId,
      )
      if (userSettings.length > 0) {
        const userIds = userSettings.map((item) => item.userId)
        const newNotifications = await Promise.all(
          userIds.map(async (userId) => {
            // Create Notification
            return {
              type: NOTIFICATION_TYPE.TEAMCHAT,
              event: NOTIFICATION_EVENT.NEW_THREAD,
              isRead: false,
              userId,
              organizationId: organization.id,
              data: JSON.stringify({
                recordType: 'channel',
                recordId: channelMessageData.channelId,
                requesterId,
                threadId: message.id,
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
    }

    // Thread in Direct Message
    const dmMessageData =
      await teamChatDirectMessageModel.getDirectMessageWithMessageId(
        message.threadId,
      )
    if (dmMessageData && dmMessageData.id === message.threadId) {
      const receiveUserId =
        dmMessageData.sendUserId === requesterId
          ? dmMessageData.receiveUserId
          : dmMessageData.sendUserId
      const setting =
        await notificationSettingModel.getNotificationSettingWithUserId(
          receiveUserId,
        )
      if (setting && setting.teamchat.newDirectMessage) {
        const newNotification = {
          type: NOTIFICATION_TYPE.TEAMCHAT,
          event: NOTIFICATION_EVENT.NEW_THREAD,
          isRead: false,
          userId: receiveUserId,
          organizationId: organization.id,
          data: JSON.stringify({
            recordType: 'directChannel',
            recordId: receiveUserId,
            requesterId,
            threadId: message.id,
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
        sendNotificationToMultiUser([receiveUserId], data)
      }
    }

    // Thread in General Chat Chat HQ
    const hqMessageData =
      await teamChatHQMessageModel.getHQMessagesWithMessageId(message.threadId)
    if (hqMessageData && hqMessageData.id === message.threadId) {
      const _users = await organizationUserModel.getUsers(organization.id)
      const _userIds = _users.map((_) => _.userId)
      const _userSettings =
        await notificationSettingModel.getSettingsWithUserIds(_userIds)
      const userSettings = _userSettings.filter(
        (setting) =>
          setting.teamchat.newHQMessage && requesterId !== setting.userId,
      )
      if (userSettings.length > 0) {
        const userIds = userSettings.map((item) => item.userId)
        const newNotifications = await Promise.all(
          userIds.map(async (userId) => {
            // Create Notification
            return {
              type: NOTIFICATION_TYPE.TEAMCHAT,
              event: NOTIFICATION_EVENT.NEW_THREAD,
              isRead: false,
              userId,
              organizationId: organization.id,
              data: JSON.stringify({
                recordType: 'hq',
                recordId: hqMessageData.id,
                requesterId,
                threadId: message.id,
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
    }

    return
  } catch (error) {
    errorMessage('UTIL', 'notification', 'notificationNewThread', error)
    // throw new HttpException(500, ErrorCode[500])
    return
  }
}

export const notificationThreadMessage = async (
  message: TeamChatThreadMessageEntity,
  memberIds: string[],
  requesterId: string,
  organization: OrganizationEntity,
) => {
  try {
    console.log(`Send notification new Thread message: ${message.id}`)

    // Thread in Channel
    const channelMessageData =
      await teamChatChannelMessageModel.getChannelMessagesWithMessageId(
        message.threadId,
      )
    if (channelMessageData && channelMessageData.id === message.threadId) {
      const channelMember = await teamChatChannelMemberModel.getChannelMembers(
        channelMessageData.channelId,
      )
      const _userSettings =
        await notificationSettingModel.getSettingsWithUserIds(
          channelMember.map((_) => _.memberId),
        )
      const userSettings = _userSettings.filter(
        (setting) =>
          setting.teamchat.newChannelMessage &&
          requesterId !== setting.userId &&
          memberIds.includes(setting.userId),
      )

      if (userSettings.length > 0) {
        const userIds = userSettings.map((item) => item.userId)
        const newNotifications = await Promise.all(
          userIds.map(async (userId) => {
            // Create Notification
            return {
              type: NOTIFICATION_TYPE.TEAMCHAT,
              event: NOTIFICATION_EVENT.NEW_THREAD_CHANNEL_MESSAGE,
              isRead: false,
              userId,
              organizationId: organization.id,
              data: JSON.stringify({
                recordType: 'channel',
                recordId: channelMessageData.id,
                requesterId,
                threadId: message.id,
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
    }

    // Thread in Direct Message
    const dmMessageData =
      await teamChatDirectMessageModel.getDirectMessageWithMessageId(
        message.threadId,
      )
    if (dmMessageData && dmMessageData.id === message.threadId) {
      const receiveUserId =
        dmMessageData.sendUser.id === requesterId
          ? requesterId
          : dmMessageData.receiveUser.id
      const setting =
        await notificationSettingModel.getNotificationSettingWithUserId(
          receiveUserId,
        )
      if (
        setting &&
        setting.teamchat.newDirectMessage &&
        requesterId !== setting.userId
      ) {
        const newNotification = {
          type: NOTIFICATION_TYPE.TEAMCHAT,
          event: NOTIFICATION_EVENT.NEW_THREAD_DIRECT_MESSAGE,
          isRead: false,
          userId: receiveUserId,
          organizationId: organization.id,
          data: JSON.stringify({
            recordType: 'directChannel',
            recordId: receiveUserId,
            requesterId,
            threadId: message.id,
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
        sendNotificationToMultiUser([receiveUserId], data)
      }
    }

    // Thread in General Chat Chat HQ
    const hqMessageData =
      await teamChatHQMessageModel.getHQMessagesWithMessageId(message.threadId)
    if (hqMessageData && hqMessageData.id === message.threadId) {
      const _users = await organizationUserModel.getUsers(organization.id)
      const _userIds = _users.map((_) => _.userId)
      const _userSettings =
        await notificationSettingModel.getSettingsWithUserIds(_userIds)
      const userSettings = _userSettings.filter(
        (setting) =>
          setting.teamchat.newHQMessage &&
          requesterId !== setting.userId &&
          memberIds.includes(setting.userId),
      )
      if (userSettings.length > 0) {
        const userIds = userSettings.map((item) => item.userId)
        const newNotifications = await Promise.all(
          userIds.map(async (userId) => {
            // Create Notification
            return {
              type: NOTIFICATION_TYPE.TEAMCHAT,
              event: NOTIFICATION_EVENT.NEW_THREAD_HQ_MESSAGE,
              isRead: false,
              userId,
              organizationId: organization.id,
              data: JSON.stringify({
                recordType: 'hq',
                recordId: organization.id,
                requesterId,
                threadId: message.id,
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
    }

    return
  } catch (error) {
    errorMessage('UTIL', 'notification', 'notificationThreadMessage', error)
    // throw new HttpException(500, ErrorCode[500])
    return
  }
}
