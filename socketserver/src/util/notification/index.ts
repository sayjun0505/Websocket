import * as admin from 'firebase-admin'
import { errorMessage } from '../../middleware/exceptions'

import {
  NotificationTokenEntity,
  notificationTokenModel,
} from '../../model/notification'

export * as chat from './chat'
export * as teamchat from './teamChat'
export * as scrumboard from './scrumboard'

export interface NotificationData {
  [key: string]: string
}

// Send messages to specific devices
// export const sendNotificationToSpecificUser = async (
//   userId: string,
//   data: NotificationData,
// ) => {
//   const _tokens = await notificationTokenModel.getTokensWithUserId(userId)
//   _tokens.map(async (el) => {
//     if (el.token) {
//       const message: admin.messaging.Message = {
//         data,
//         notification: {
//           title: 'FoxConnect',
//           body: 'You have a new notification.',
//         },
//         token: el.token,
//       }
//       try {
//         await admin.messaging().send(message)
//       } catch (error) {
//         errorMessage(
//           'UTIL',
//           'notification',
//           'sendNotificationToSpecificUser',
//           error,
//         )
//       }
//     }
//   })
//   return
// }

const spliceTokenIntoChunks = (tokens: NotificationTokenEntity[]) => {
  const res = []
  while (tokens.length > 0) {
    const chunk = tokens.splice(0, 500)
    res.push(chunk)
  }
  return res
}

// Send messages to multiple devices
export const sendNotificationToMultiUser = async (
  userIds: string[],
  data: NotificationData,
) => {
  // Create a list containing up to 500 registration tokens.
  const _tokens = await notificationTokenModel.getTokenWithUserIds(userIds)
  const tokenChunks = spliceTokenIntoChunks(_tokens)
  tokenChunks.forEach((tokenChunk) => {
    const registrationTokens = tokenChunk.map((item) => item.token)
    const messages: admin.messaging.MulticastMessage = {
      data,
      tokens: registrationTokens,
    }
    try {
      admin.messaging().sendMulticast(messages)
    } catch (error) {
      errorMessage('UTIL', 'notification', 'sendNotificationToMultiUser', error)
    }
  })
  return
}
