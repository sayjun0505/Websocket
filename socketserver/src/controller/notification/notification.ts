import { NextFunction, Request, Response } from 'express'
import { chatModel } from '../../model/chat'
import { gcsService } from '../../service/google'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  NotificationEntity,
  notificationModel,
  NotificationSettingEntity,
  notificationSettingModel,
  NOTIFICATION_EVENT,
  NOTIFICATION_TYPE,
} from '../../model/notification'
import {
  OrganizationEntity,
  organizationModel,
  UserEntity,
  userModel,
} from '../../model/organization'
import {
  teamChatChannelMessageModel,
  teamChatChannelModel,
  teamChatDirectMessageModel,
  teamChatHQMessageModel,
  teamChatThreadMessageModel,
} from '../../model/teamChat'
import {
  TeamChatChannelMessageEntity,
  TEAMCHAT_MESSAGE_TYPE,
} from '../../model/teamChat/message.entity'
import { MESSAGE_TYPE } from '../../model/chat/message.entity'
import {
  DR_MESSAGE_TYPE,
  TeamChatDirectMessageEntity,
} from '../../model/teamChat/directMessage.entity'
import {
  TeamChatThreadMessageEntity,
  TEAMCHAT_TR_MESSAGE_TYPE,
} from '../../model/teamChat/threadMessage.entity'
import { TeamChatHQMessageEntity } from '../../model/teamChat/hqMessage.entity'
import {
  ScrumboardCardEntity,
  ScrumboardCardModel,
} from '../../model/scrumboard'

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // const organization: OrganizationEntity = req.body.organization
    const { page, size } = req.query
    const requester: UserEntity = req.body.requester
    
    const unread = await notificationModel.getUserUnreadCount(requester.id)

    const defaultPage = page ? Number(page) : 0
    const defaultSize = size ? Number(size) : 0

    const [_result, _total] = await notificationModel.getNotifications(
      requester.id,
      defaultPage,
      defaultSize,
    )

    const data = await Promise.all(
      _result.map(async (item) => {
        let moreData
        if (item.data) {
          const _data = JSON.parse(item.data)
          moreData = _data
          if (_data && _data.recordType) {
            if (item.type === NOTIFICATION_TYPE.CHAT) {
              const chat = await chatModel.getChatForNotification(
                _data.recordId,
              )
              if (
                item.event === NOTIFICATION_EVENT.NEW_CHAT ||
                item.event === NOTIFICATION_EVENT.NEW_MESSAGE
              ) {
                if (chat && chat.channel) {
                  const channelData: any =
                    chat.channel.facebook ||
                    chat.channel.line ||
                    chat.channel.instagram
                  moreData = {
                    ...moreData,
                    channel: {
                      channel: chat.channel.channel || '',
                      name: channelData.name || '',
                    },
                  }
                }

                if (chat && chat.customer && chat.channel) {
                  const pictureURL = gcsService.getCustomerDisplayURL(
                    chat.organizationId,
                    chat.channelId,
                    chat.customer.uid,
                    chat.customer.picture,
                  )
                  moreData = {
                    ...moreData,
                    customer: {
                      id: chat.customer.id,
                      display: chat.customer.display,
                      pictureURL,
                    },
                  }
                }
              } else if (
                item.event === NOTIFICATION_EVENT.NEW_MENTION ||
                item.event === NOTIFICATION_EVENT.NEW_OWNER
              ) {
                moreData = _data
                if (_data.requesterId) {
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
                if (chat && chat.customer && chat.channel) {
                  const pictureURL = gcsService.getCustomerDisplayURL(
                    chat.organizationId,
                    chat.channelId,
                    chat.customer.uid,
                    chat.customer.picture,
                  )
                  moreData = {
                    ...moreData,
                    customer: {
                      id: chat.customer.id,
                      display: chat.customer.display,
                      pictureURL,
                    },
                  }
                }
              }
            } else if (item.type === NOTIFICATION_TYPE.TEAMCHAT) {
              if (_data.requesterId) {
                const user = await userModel.getUserWithId(_data.requesterId)
                if (user) {
                  moreData = {
                    ...moreData,
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
              if (
                item.event === NOTIFICATION_EVENT.ADD_MEMBER ||
                item.event === NOTIFICATION_EVENT.NEW_CHANNEL_MENTION ||
                item.event === NOTIFICATION_EVENT.NEW_CHANNEL_MESSAGE
              ) {
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
              }
              if (
                item.event === NOTIFICATION_EVENT.NEW_THREAD ||
                item.event === NOTIFICATION_EVENT.NEW_THREAD_CHANNEL_MESSAGE ||
                item.event === NOTIFICATION_EVENT.NEW_THREAD_DIRECT_MESSAGE ||
                item.event === NOTIFICATION_EVENT.NEW_THREAD_HQ_MESSAGE
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
                  const directUser = await userModel.getUserWithId(
                    _data.recordId,
                  )
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
                  const _organization =
                    await organizationModel.getOrganizationWithId(
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
            } else if (item.type === NOTIFICATION_TYPE.SCRUMBOARD) {
              if (_data.requesterId) {
                const user = await userModel.getUserWithId(_data.requesterId)
                if (user) {
                  moreData = {
                    ...moreData,
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
              if (
                item.event === NOTIFICATION_EVENT.NEW_CARD_DUE_DATE ||
                item.event === NOTIFICATION_EVENT.EDIT_CARD_DUE_DATE ||
                item.event === NOTIFICATION_EVENT.NEW_CARD_MEMBER ||
                item.event === NOTIFICATION_EVENT.NEW_CARD_MENTION
              ) {
                const card = await ScrumboardCardModel.getCardWithId(
                  _data.recordId,
                )
                if (card) {
                  moreData = {
                    ...moreData,
                    card: {
                      id: card.id,
                      name: card.title,
                    },
                  }
                }
              }
            }
          }
        }
        return {
          ...item,
          data: moreData ? moreData : undefined,
          organization: {
            id: item.organization.id,
            name: item.organization.name,
          },
        }
      }),
    )
    return res.status(200).json({
      unread,
      currentPage: defaultPage,
      pages: Math.ceil(_total / defaultSize),
      currentCount: _result.length,
      totalCount: _total,
      data,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'notification', 'getNotifications', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getNotificationsforSocket = async (/** */
  params:any
) => {
  try {
    // const organization: OrganizationEntity = req.body.organization
    const page=params.page
    const size=params.size
    const requester: UserEntity = params.requester
    const unread = await notificationModel.getUserUnreadCount(params.requester.uuid)

    const defaultPage = page ? Number(page) : 0
    const defaultSize = size ? Number(size) : 0

    const [_result, _total] = await notificationModel.getNotifications(
      params.requester.uuid,
      defaultPage,
      defaultSize,
    )

    const data = await Promise.all(
      _result.map(async (item) => {
        let moreData
        if (item.data) {
          const _data = JSON.parse(item.data)
          moreData = _data
          if (_data && _data.recordType) {
            if (item.type === NOTIFICATION_TYPE.CHAT) {
              const chat = await chatModel.getChatForNotification(
                _data.recordId,
              )
              if (
                item.event === NOTIFICATION_EVENT.NEW_CHAT ||
                item.event === NOTIFICATION_EVENT.NEW_MESSAGE
              ) {
                if (chat && chat.channel) {
                  const channelData: any =
                    chat.channel.facebook ||
                    chat.channel.line ||
                    chat.channel.instagram
                  moreData = {
                    ...moreData,
                    channel: {
                      channel: chat.channel.channel || '',
                      name: channelData.name || '',
                    },
                  }
                }

                if (chat && chat.customer && chat.channel) {
                  const pictureURL = gcsService.getCustomerDisplayURL(
                    chat.organizationId,
                    chat.channelId,
                    chat.customer.uid,
                    chat.customer.picture,
                  )
                  moreData = {
                    ...moreData,
                    customer: {
                      id: chat.customer.id,
                      display: chat.customer.display,
                      pictureURL,
                    },
                  }
                }
              } else if (
                item.event === NOTIFICATION_EVENT.NEW_MENTION ||
                item.event === NOTIFICATION_EVENT.NEW_OWNER
              ) {
                moreData = _data
                if (_data.requesterId) {
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
                if (chat && chat.customer && chat.channel) {
                  const pictureURL = gcsService.getCustomerDisplayURL(
                    chat.organizationId,
                    chat.channelId,
                    chat.customer.uid,
                    chat.customer.picture,
                  )
                  moreData = {
                    ...moreData,
                    customer: {
                      id: chat.customer.id,
                      display: chat.customer.display,
                      pictureURL,
                    },
                  }
                }
              }
            } else if (item.type === NOTIFICATION_TYPE.TEAMCHAT) {
              if (_data.requesterId) {
                const user = await userModel.getUserWithId(_data.requesterId)
                if (user) {
                  moreData = {
                    ...moreData,
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
              if (
                item.event === NOTIFICATION_EVENT.ADD_MEMBER ||
                item.event === NOTIFICATION_EVENT.NEW_CHANNEL_MENTION ||
                item.event === NOTIFICATION_EVENT.NEW_CHANNEL_MESSAGE
              ) {
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
              }
              if (
                item.event === NOTIFICATION_EVENT.NEW_THREAD ||
                item.event === NOTIFICATION_EVENT.NEW_THREAD_CHANNEL_MESSAGE ||
                item.event === NOTIFICATION_EVENT.NEW_THREAD_DIRECT_MESSAGE ||
                item.event === NOTIFICATION_EVENT.NEW_THREAD_HQ_MESSAGE
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
                  const directUser = await userModel.getUserWithId(
                    _data.recordId,
                  )
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
                  const _organization =
                    await organizationModel.getOrganizationWithId(
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
            } else if (item.type === NOTIFICATION_TYPE.SCRUMBOARD) {
              if (_data.requesterId) {
                const user = await userModel.getUserWithId(_data.requesterId)
                if (user) {
                  moreData = {
                    ...moreData,
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
              if (
                item.event === NOTIFICATION_EVENT.NEW_CARD_DUE_DATE ||
                item.event === NOTIFICATION_EVENT.EDIT_CARD_DUE_DATE ||
                item.event === NOTIFICATION_EVENT.NEW_CARD_MEMBER ||
                item.event === NOTIFICATION_EVENT.NEW_CARD_MENTION
              ) {
                const card = await ScrumboardCardModel.getCardWithId(
                  _data.recordId,
                )
                if (card) {
                  moreData = {
                    ...moreData,
                    card: {
                      id: card.id,
                      name: card.title,
                    },
                  }
                }
              }
            }
          }
        }
        return {
          ...item,
          data: moreData ? moreData : undefined,
          organization: {
            id: item.organization.id,
            name: item.organization.name,
          },
        }
      }),
    )
    return ({
      unread,
      currentPage: defaultPage,
      pages: Math.ceil(_total / defaultSize),
      currentCount: _result.length,
      totalCount: _total,
      data,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'notification', 'getNotifications', error)
    return "error500"
  }
}

export const getNotificationsForMobile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, size } = req.query
    const requester: UserEntity = req.body.requester

    const unread = await notificationModel.getUserUnreadCount(requester.id)

    const defaultPage = page ? Number(page) : 1
    const defaultSize = size ? Number(size) : 10

    const [_result, _total] = await notificationModel.getNotifications(
      requester.id,
      defaultPage,
      defaultSize,
    )

    const data = await Promise.all(
      _result.map(async (item) => {
        let moreData
        if (item.data) {
          const _data = JSON.parse(item.data)
          moreData = _data
          if (_data && _data.recordType) {
            if (item.type === NOTIFICATION_TYPE.CHAT) {
              const chat = await chatModel.getChatForNotification(
                _data.recordId,
              )
              if (
                item.event === NOTIFICATION_EVENT.NEW_CHAT ||
                item.event === NOTIFICATION_EVENT.NEW_MESSAGE
              ) {
                if (chat && chat.channel) {
                  const channelData: any =
                    chat.channel.facebook ||
                    chat.channel.line ||
                    chat.channel.instagram
                  moreData = {
                    ...moreData,
                    channel: {
                      channel: chat.channel.channel || '',
                      name: channelData.name || '',
                    },
                  }
                }

                if (chat && chat.customer && chat.channel) {
                  const pictureURL = gcsService.getCustomerDisplayURL(
                    chat.organizationId,
                    chat.channelId,
                    chat.customer.uid,
                    chat.customer.picture,
                  )
                  moreData = {
                    ...moreData,
                    customer: {
                      id: chat.customer.id,
                      display: chat.customer.display,
                      pictureURL,
                    },
                  }
                }
              } else if (
                item.event === NOTIFICATION_EVENT.NEW_MENTION ||
                item.event === NOTIFICATION_EVENT.NEW_OWNER
              ) {
                moreData = _data
                if (_data.requesterId) {
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
                if (chat && chat.customer && chat.channel) {
                  const pictureURL = gcsService.getCustomerDisplayURL(
                    chat.organizationId,
                    chat.channelId,
                    chat.customer.uid,
                    chat.customer.picture,
                  )
                  moreData = {
                    ...moreData,
                    customer: {
                      id: chat.customer.id,
                      display: chat.customer.display,
                      pictureURL,
                    },
                  }
                }
              }
            } else if (item.type === NOTIFICATION_TYPE.TEAMCHAT) {
              if (_data.requesterId) {
                const user = await userModel.getUserWithId(_data.requesterId)
                if (user) {
                  moreData = {
                    ...moreData,
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
              if (
                item.event === NOTIFICATION_EVENT.ADD_MEMBER ||
                item.event === NOTIFICATION_EVENT.NEW_CHANNEL_MENTION ||
                item.event === NOTIFICATION_EVENT.NEW_CHANNEL_MESSAGE
              ) {
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
              }
            } else if (item.type === NOTIFICATION_TYPE.SCRUMBOARD) {
              if (_data.requesterId) {
                const user = await userModel.getUserWithId(_data.requesterId)
                if (user) {
                  moreData = {
                    ...moreData,
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
              if (
                item.event === NOTIFICATION_EVENT.NEW_CARD_DUE_DATE ||
                item.event === NOTIFICATION_EVENT.EDIT_CARD_DUE_DATE ||
                item.event === NOTIFICATION_EVENT.NEW_CARD_MEMBER ||
                item.event === NOTIFICATION_EVENT.NEW_CARD_MENTION
              ) {
                const card = await ScrumboardCardModel.getCardWithId(
                  _data.recordId,
                )
                if (card) {
                  moreData = {
                    ...moreData,
                    card: {
                      id: card.id,
                      name: card.title,
                    },
                  }
                }
              }
            }
          }
        }
        const notificationItem = {
          ...item,
          data: moreData ? moreData : undefined,
          organization: {
            id: item.organization.id,
            name: item.organization.name,
          },
        }

        let resultItem
        const notificationData = notificationItem.data
        if (notificationItem.event === NOTIFICATION_EVENT.NEW_CHANNEL_MESSAGE) {
          const channelName = notificationData.channel.name
          const messageTitle = `You have a new message in ${channelName} Channel`

          // tslint:disable-next-line:max-line-length
          const channelMessage =
            (await teamChatChannelMessageModel.getChannelMessagesWithMessageId(
              notificationData.messageId,
            )) as TeamChatChannelMessageEntity
          const messageData = JSON.parse(channelMessage.data)
          let messageBody = ''
          if (
            channelMessage &&
            channelMessage.type === TEAMCHAT_MESSAGE_TYPE.TEXT
          ) {
            messageBody = messageData.text
          } else if (
            channelMessage &&
            channelMessage.type === TEAMCHAT_MESSAGE_TYPE.VIDEO
          ) {
            messageBody = 'video'
          } else if (
            channelMessage &&
            channelMessage.type === TEAMCHAT_MESSAGE_TYPE.FILE
          ) {
            messageBody = 'file'
          } else if (
            channelMessage &&
            channelMessage.type === TEAMCHAT_MESSAGE_TYPE.IMAGE
          ) {
            messageBody = 'image'
          }

          // tslint:disable-next-line:max-line-length
          const channelMessageData =
            (await teamChatChannelMessageModel.getChannelMessagesWithMessageId(
              notificationData.messageId,
            )) as TeamChatChannelMessageEntity

          const notifiData = {
            ...notificationItem.data,
            channel: {
              id: channelMessageData.id,
              channelId: channelMessageData.channelId,
              description: channelMessageData.channel.description,
              createdAt: channelMessageData.channel.createdAt,
              name: channelMessageData.channel.name,
            },
          }
          const notifiItem = {
            ...notificationItem,
            data: notifiData,
          }
          resultItem = {
            ...notifiItem,
            messageTitle,
            messageBody,
          }
        } else if (
          notificationItem.event === NOTIFICATION_EVENT.NEW_DIRECT_MESSAGE
        ) {
          // tslint:disable-next-line:max-line-length
          const dmMessageData =
            (await teamChatDirectMessageModel.getDirectMessageWithMessageId(
              notificationData.messageId,
            )) as TeamChatDirectMessageEntity
          const messageTitle = `${dmMessageData?.sendUser.display} sent new message`
          let messageBody = ''
          const messageData = JSON.parse(dmMessageData.data)
          if (dmMessageData) {
            if (dmMessageData.type === DR_MESSAGE_TYPE.TEXT) {
              messageBody = messageData.text
            } else if (dmMessageData.type === DR_MESSAGE_TYPE.VIDEO) {
              messageBody = 'video'
            } else if (dmMessageData.type === DR_MESSAGE_TYPE.FILE) {
              messageBody = 'file'
            } else if (dmMessageData.type === DR_MESSAGE_TYPE.IMAGE) {
              messageBody = 'image'
            }
          }
          const userInfo = await userModel.getUserWithId(
            notificationItem.data.requesterId,
          )
          const pictureURL = notificationItem.data.requester.pictureURL
          const notifiData = {
            ...notificationItem.data,
            requester: {
              id: userInfo?.id,
              isOnline: userInfo?.isOnline,
              display: userInfo?.display,
              email: userInfo?.email,
              pictureURL,
            },
          }
          const notifiItem = {
            ...notificationItem,
            data: notifiData,
          }
          resultItem = {
            ...notifiItem,
            messageTitle,
            messageBody,
          }
        } else if (
          notificationItem.event.toString() === 'newThreadDirectMessage'
        ) {
          const messageTitle = `${notificationItem.data.requester.display} sent reply message`
          let messageBody
          messageBody = ''
          // tslint:disable-next-line:max-line-length
          const threadMainData =
            (await teamChatDirectMessageModel.getDirectMessageWithMessageId(
              notificationItem.data.messageId,
            )) as TeamChatDirectMessageEntity

          delete notificationItem.data.requester
          const notifiData = {
            ...notificationItem.data,
            messageData: {
              id: threadMainData.id,
              data: threadMainData.data,
              type: threadMainData.type,
              senderName: threadMainData.sendUser.display,
              senderPicture: threadMainData.sendUser.picture,
              senderId: threadMainData.sendUser.id,
              createdAt: threadMainData.createdAt,
            },
          }
          const notifiItem = {
            ...notificationItem,
            data: notifiData,
          }
          resultItem = {
            ...notifiItem,
            messageTitle,
            messageBody,
          }
        } else if (
          notificationItem.event.toString() === 'newThreadChannelMessage'
        ) {
          // tslint:disable-next-line:max-line-length
          const channelMessageData =
            (await teamChatChannelMessageModel.getChannelMessagesWithMessageId(
              notificationData.messageId,
            )) as TeamChatChannelMessageEntity
          const messageTitle = `${notificationItem.data.requester.display} sent reply message in ${channelMessageData.channel.name} Channel`
          const messageBody = ''
          delete notificationItem.data.requester
          const notifiData = {
            ...notificationItem.data,
            messageData: {
              id: channelMessageData.id,
              data: channelMessageData.data,
              type: channelMessageData.type,
              senderName: channelMessageData.createdBy.display,
              senderPicture: channelMessageData.createdBy.picture,
              senderId: channelMessageData.createdBy.id,
              createdAt: channelMessageData.createdAt,
            },
          }
          const notifiItem = {
            ...notificationItem,
            data: notifiData,
          }
          resultItem = {
            ...notifiItem,
            messageTitle,
            messageBody,
          }
        } else if (notificationItem.event.toString() === 'newThreadHQMessage') {
          // tslint:disable-next-line:max-line-length
          const threadMainData =
            (await teamChatHQMessageModel.getHQMessagesWithMessageId(
              notificationData.messageId,
            )) as TeamChatHQMessageEntity
          const messageTitle = `${notificationItem.data.requester.display} sent reply message in HQ`
          const messageBody = ''

          delete notificationItem.data.requester
          const notifiData = {
            ...notificationItem.data,
            messageData: {
              id: threadMainData.id,
              data: threadMainData.data,
              type: threadMainData.type,
              senderName: threadMainData.createdBy.display,
              senderPicture: threadMainData.createdBy.picture,
              senderId: threadMainData.createdBy.id,
              createdAt: threadMainData.createdAt,
            },
          }
          const notifiItem = {
            ...notificationItem,
            data: notifiData,
          }
          resultItem = {
            ...notifiItem,
            messageTitle,
            messageBody,
          }
        } else if (
          notificationItem.event === NOTIFICATION_EVENT.NEW_CHANNEL_MENTION
        ) {
          // tslint:disable-next-line:max-line-length
          const threadMessageData =
            (await teamChatThreadMessageModel.getMessagesWithId(
              notificationData.messageId,
            )) as TeamChatThreadMessageEntity
          // tslint:disable-next-line:max-line-length
          const channelMessageData =
            (await teamChatChannelMessageModel.getChannelMessagesWithMessageId(
              threadMessageData.threadId,
            )) as TeamChatChannelMessageEntity
          const messageTitle = `${threadMessageData.createdBy.display} mentioned you in ${channelMessageData.channel.name} Channel`
          resultItem = {
            ...notificationItem,
            messageTitle,
            messageBody: '',
          }
        } else {
          resultItem = {
            ...notificationItem,
            messageTitle: '',
            messageBody: '',
          }
        }
        return { ...resultItem }
      }),
    )

    return res.status(200).json({
      unread,
      currentPage: defaultPage,
      pages: Math.ceil(_total / defaultSize),
      currentCount: _result.length,
      totalCount: _total,
      data,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'notification', 'getNotifications', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const markReadAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    const notifications = await notificationModel.getAllNotifications(
      requester.id,
    )
    await notificationModel.markReadWithNotificationIds(
      notifications.map((_) => _.id),
    )
    return res.status(201).send([])
  } catch (error) {
    errorMessage(
      'CONTROLLER',
      'notification',
      'markReadAllNotifications',
      error,
    )
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const markReadNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params
  if (!id) {
    errorMessage(
      'CONTROLLER',
      'notification',
      'invalid parameter(notification id)',
    )
    return next(new HttpException(400, ErrorCode[400]))
  }
  // const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  // const notificationIds: string[] = req.body.notificationIds

  // if (!notificationIds || notificationIds.length <= 0) {
  //   return res.status(201).send([])
  // }

  try {
    await notificationModel.markReadWithNotificationIds([id])

    // const newNotification: NotificationEntity[] =
    //   await notificationModel.getNotificationsWithIds([id])

    // return res.status(201).send(
    //   newNotification.map((item) => {
    //     return {
    //       ...item,
    //       organization: {
    //         id: item.organization.id,
    //         name: item.organization.name,
    //       },
    //     }
    //   }),
    // )
    return res.status(201).send(id)
  } catch (error) {
    errorMessage('CONTROLLER', 'notification', 'markReadNotifications', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const dismissAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requester: UserEntity = req.body.requester
    const notifications = await notificationModel.getAllNotifications(
      requester.id,
    )
    await notificationModel.deleteNotificationIds(
      notifications.map((_) => _.id),
    )
    return res.status(201).send([])
  } catch (error) {
    errorMessage('CONTROLLER', 'notification', 'dismissAllNotifications', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const dismissNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params
  if (!id) {
    errorMessage(
      'CONTROLLER',
      'notification',
      'invalid parameter(notification id)',
    )
    return next(new HttpException(400, ErrorCode[400]))
  }

  // const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  // const notificationIds: string[] = req.body.notificationIds

  // if (!notificationIds || notificationIds.length <= 0) {
  //   return res.status(201).send([])
  // }

  try {
    await notificationModel.deleteNotificationIds([id])
    return res.status(201).send(id)
  } catch (error) {
    errorMessage('CONTROLLER', 'notification', 'dismissNotifications', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
