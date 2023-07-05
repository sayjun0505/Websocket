import cors from 'cors'
import { Router } from 'express'
import {
  notificationController,
  notificationSettingController,
  notificationTokenController,
} from '../../controller/notification'

const router = Router()

// Notification
router.get('/', notificationController.getNotifications)
router.get('/getNotificationsForMobile', notificationController.getNotificationsForMobile)
router.delete('/readAll', notificationController.markReadAllNotifications)
router.delete('/read/:id', notificationController.markReadNotification)
router.delete('/dismissAll', notificationController.dismissAllNotifications)
router.delete('/dismiss/:id', notificationController.dismissNotifications)

// Notification Setting
router.get('/setting', notificationSettingController.getNotificationSetting)
router.put('/setting', notificationSettingController.updateNotificationSetting)

// Notification Token
router.put('/token', notificationTokenController.updateNotificationToken)

export default {
  router,
}
