import { NextFunction, Request, Response } from 'express'
import * as crypto from 'crypto'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { channelModel } from '../../model/channel'
import { OrganizationEntity, UserEntity } from '../../model/organization'
import {
  chatModel,
  MessageEntity,
  messageModel,
  MESSAGE_TYPE,
} from '../../model/chat'
import { ChannelEntity } from '../../model/channel/channel.entity'
import { lineService } from '../../service/channel'
import { gcsService } from '../../service/google'
import { MESSAGE_DIRECTION } from '../../model/chat/message.entity'
import { ChatEntity } from '../../model/chat/chat.entity'
import { CustomerEntity } from '../../model/customer/customer.entity'
import { customerModel } from '../../model/customer'
import * as channelService from '../../service/channel'
import * as replyService from '../../service/reply'
import { notificationUtil, workingHoursUtil } from '../../util'
import { sseController } from '../sse'
import {
  chatManagement,
  customerManagement,
  getNewCustomerProfile,
} from './helper'

export const webhookValidate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('Facebook webhook MODE ', req.query['hub.mode'])
    if (
      channelService.facebookService.validate(
        String(req.query['hub.mode']),
        String(req.query['hub.verify_token']),
      )
    ) {
      res.status(200).send(req.query['hub.challenge'])
    } else {
      errorMessage(
        'CONTROLLER',
        'facebook',
        'Failed validation. Make sure the validation tokens match.',
      )
      return next(new HttpException(403, 'Failed validation.'))
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'facebook', 'webhookValidate', error)
    return next(new HttpException(403, 'Failed validation.'))
  }
}

// Note : PostgreSQL doesn't support storing NULL (\0x00) characters in text fields
const nullCharRegExp = new RegExp(/\u0000|\x00/m)

interface IFacebookMessaging {
  sender: any
  recipient: any
  [key: string]: any
}
interface IFacebookMessageEntry {
  // Common properties
  id: string
  time: string
  messaging: IFacebookMessaging[]
  [key: string]: any
}

// Convert Facebook event object to FoxConnect MessageEntity object
const convertMessageEvent = async (
  organizationId: string,
  facebookMessage: IFacebookMessaging,
  customer: CustomerEntity,
  channel: ChannelEntity,
  chat: ChatEntity,
) => {
  if (!facebookMessage.message) {
    errorMessage('CONTROLLER', 'webhook.facebook', 'input event wrong type')
    throw new HttpException(400, ErrorCode[400])
  }

  const timestamp = new Date(Number(facebookMessage.timestamp))
  const messageTimestamp = timestamp ? timestamp : new Date()

  let facebookMessageData = {}
  let facebookMessageType
  if (facebookMessage.message.text) {
    // Text Message
    facebookMessageType = MESSAGE_TYPE.TEXT
    facebookMessageData = {
      text: facebookMessage.message.text.replace(nullCharRegExp, ''),
    }
  } else if (facebookMessage.message.attachments) {
    // Message with attachment <image|video|audio|file>
    const attachments: { filename: string }[] = await Promise.all(
      facebookMessage.message.attachments.map(
        async (attachment: {
          type: string
          payload: { url: string; sticker_id?: string }
        }) => {
          if (
            !attachment.type ||
            (attachment.type !== 'image' &&
              attachment.type !== 'audio' &&
              attachment.type !== 'video' &&
              attachment.type !== 'file' &&
              attachment.type !== 'story_mention' &&
              attachment.type !== 'location')
          ) {
            errorMessage(
              'CONTROLLER',
              'webhook.facebook',
              'unsupported attachment message type',
            )
            return
          }
          if (attachment.type === MESSAGE_TYPE.IMAGE) {
            // sticker will be image type
            if (attachment.payload.sticker_id) {
              facebookMessageType = MESSAGE_TYPE.STICKER
            } else {
              facebookMessageType = MESSAGE_TYPE.IMAGE
            }
          } else {
            // video/location/audio/file
            facebookMessageType = attachment.type
          }

          const url = attachment.payload.url
          const urlParams = url ? url.split('?')[1] : ''
          const params = new URLSearchParams(urlParams)
          const _contentFilename =
            (params && params.get('asset_id')) ||
            attachment.payload.sticker_id ||
            facebookMessage.message.mid

          try {
            const filename = await gcsService.uploadChatMessageFromFileURL(
              organizationId,
              channel,
              customer.id,
              _contentFilename,
              url,
            )
            // console.log('[receiveMessage] filename ', filename)
            if (filename) {
              if (attachment.payload.sticker_id) {
                return { filename, sticker_id: attachment.payload.sticker_id }
              } else {
                return { filename }
              }
            }
          } catch (error) {
            // console.log('[receiveMessage] uploadChatMessageFromFileURL ', error)
            return { url: attachment.payload.url }
          }
        },
      ),
    )

    if (attachments && attachments.length === 1) {
      facebookMessageData = attachments[0]
    } else if (attachments && attachments.length > 1) {
      facebookMessageData = {
        ...attachments.shift(),
        more: attachments,
      }
    } else {
      errorMessage('CONTROLLER', 'webhook.facebook', 'no attachment message')
      return
    }
  } else {
    errorMessage(
      'CONTROLLER',
      'webhook.facebook',
      'Unsupported payload message',
    )
    return
  }
  let replyToId = null
  if (facebookMessage.message.reply_to) {
    if (facebookMessage.message.reply_to.mid) {
      const _replyToMessage = await messageModel.getMessageWithMID(
        facebookMessage.message.reply_to.mid,
        chat.id,
        organizationId,
      )
      if (_replyToMessage) {
        replyToId = _replyToMessage.id
      }
    }
    if (facebookMessage.message.reply_to.story) {
      const _replyToStory = await messageModel.getMessageWithMID(
        facebookMessage.message.reply_to.story.id,
        chat.id,
        organizationId,
      )
      if (_replyToStory) {
        replyToId = _replyToStory.id
      } else {
        const storyMessage = await messageModel.saveMessage({
          ...new MessageEntity(),
          data: facebookMessage.message.reply_to.story,
          mid: facebookMessage.message.reply_to.story.id,
          channel,
          isRead: true,
          type: MESSAGE_TYPE.STORY,
          timestamp: messageTimestamp,
          direction:
            facebookMessage.sender.id === channel.facebook.pageId
              ? MESSAGE_DIRECTION.OUTBOUND
              : MESSAGE_DIRECTION.INBOUND,
          chat,
          organizationId,
        })
        replyToId = storyMessage.id
      }
    }
  }

  return {
    ...new MessageEntity(),
    data: JSON.stringify(facebookMessageData),
    mid: facebookMessage.message.mid,
    replyToId,
    channel,
    type: facebookMessageType,
    timestamp: messageTimestamp,
    direction:
      facebookMessage.sender.id === channel.facebook.pageId
        ? MESSAGE_DIRECTION.OUTBOUND
        : MESSAGE_DIRECTION.INBOUND,
    chat,
    organizationId,
  } as MessageEntity
}

export const receiveMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // destination: User ID of a bot that should receive webhook events.
    const { object, entry } = req.body

    console.log('BODY ', JSON.stringify(req.body))
    console.log('FB MSG ', entry[0].messaging)
    // console.log('FB MSG ', entry[0].messaging[0].message.attachments)

    if (!object || !entry) {
      errorMessage(
        'CONTROLLER',
        'webhook.facebook',
        'invalid data(object/entry)',
      )
      return next(new HttpException(400, ErrorCode[400]))
    }

    /**
     * Section: "object":"page"
     */

    if (object !== 'page') {
      errorMessage('CONTROLLER', 'webhook.facebook', 'unsupported object type')
      return next(new HttpException(400, ErrorCode[400]))
    }

    // Get channel list from setting
    const channels = await channelModel.getFacebookChannelWithPageIds(
      entry.map((e: IFacebookMessageEntry) => e.id),
    )

    // Start receive message process
    await entry.forEach(async (entryElement: IFacebookMessageEntry) => {
      // console.log('[receiveMessage] Prepare entryElement:', entryElement.id)
      // Prepare data before process message
      const channel = channels.find(
        (ch: ChannelEntity) =>
          ch.channel === 'facebook' &&
          ch.facebook &&
          ch.facebook.pageId === entryElement.id,
      )
      if (!channel || !channel.facebook) {
        errorMessage(
          'CONTROLLER',
          'webhook.facebook',
          `Skip message from channel: ${entryElement.id}`,
        )
        return
      }

      // console.log('[receiveMessage] channel:', {
      //   id: channel.id,
      //   channel: channel.channel,
      //   facebook: { name: channel.facebook.name },
      // })

      if (
        !entryElement.messaging ||
        !entryElement.messaging.length ||
        entryElement.messaging.length <= 0
      ) {
        errorMessage(
          'CONTROLLER',
          'webhook.facebook',
          `Payload have no messaging`,
        )
        return
      } else {
        // Filter echo message
        // const messaging = entryElement.messaging.filter(
        //   (_msg) => _msg && !(_msg.message && _msg.message.is_echo),
        // )
        const messaging = entryElement.messaging
        // Customer Management: Get current customer / Update customer profile / Create new customer
        const senderIds = [
          ...new Set(messaging.map((msg) => msg.sender.id)),
          ...new Set(messaging.map((msg) => msg.recipient.id)),
        ]
        const senderIdsWithoutChannelId = senderIds.filter(
          (_customerId) => _customerId !== channel.facebook.pageId,
        )
        const customers = await customerManagement(
          senderIdsWithoutChannelId,
          channel,
        )
        // console.log('[receiveMessage] customers:', customers)

        // Chat Management: Get current chat / Create new chat
        const chats = await chatManagement(
          customers.map((customer) => customer.id),
          channel,
        )
        // console.log('[receiveMessage] chats:', chats)

        // console.log(
        //   '[receiveMessage] START entryElement:',
        //   channel.facebook.name,
        // )

        const organizationId: string = channel.organizationId
        const organization: OrganizationEntity = channel.organization

        await messaging.forEach(async (facebookMessage: IFacebookMessaging) => {
          const customer = customers.find((_customer: CustomerEntity) => {
            if (facebookMessage.sender.id === channel.facebook.pageId) {
              return _customer.uid === facebookMessage.recipient.id
            } else {
              return _customer.uid === facebookMessage.sender.id
            }
          })
          if (!customer) {
            errorMessage(
              'CONTROLLER',
              'webhook.facebook',
              `Skip message: customer${facebookMessage.sender.id} not found`,
            )
            return
          }
          const chat = chats.find(
            (_chat: ChatEntity) => _chat.customerId === customer.id,
          )
          if (!chat) {
            errorMessage(
              'CONTROLLER',
              'webhook.facebook',
              `Skip message: chat not found`,
            )
            return
          }
          const isNewChat = Boolean(chat.organizationId)

          // Recheck channel is correct
          if (
            !channel.facebook ||
            (channel.facebook.pageId !== facebookMessage.recipient.id &&
              channel.facebook.pageId !== facebookMessage.sender.id)
          ) {
            errorMessage(
              'CONTROLLER',
              'webhook.facebook',
              `Skip message: recipient ${facebookMessage.recipient.id} not found`,
            )
            return
          }

          /**
           * New Message
           */
          // let message
          if (facebookMessage.message) {
            // Message

            /**
             * Handle UnSend Message
             */
            if (
              facebookMessage.message.mid &&
              facebookMessage.message.is_deleted
            ) {
              try {
                await messageModel.unSendMessage(facebookMessage.message.mid)
              } catch (error) {
                errorMessage(
                  'CONTROLLER',
                  'webhook.facebook',
                  `Update unSend message mid: ${facebookMessage.message.mid}`,
                )
              }
            } else {
              let duplicateMessage
              if (
                facebookMessage.message.mid &&
                facebookMessage.message.is_echo
              ) {
                duplicateMessage = await messageModel.getMessageWithMID(
                  facebookMessage.message.mid,
                  chat.id,
                  organizationId,
                )
              }
              if (!duplicateMessage) {
                try {
                  const _newMessage = await convertMessageEvent(
                    organizationId,
                    facebookMessage,
                    customer,
                    channel,
                    chat,
                  )
                  if (!_newMessage) {
                    errorMessage(
                      'CONTROLLER',
                      'webhook.facebook',
                      'convertMessageEvent(message)',
                    )
                  } else {
                    const newMessage = await messageModel.saveMessage(
                      _newMessage,
                    )

                    // Check auto response response type only text message
                    if (newMessage.type === MESSAGE_TYPE.TEXT) {
                      try {
                        const messageData = JSON.parse(newMessage.data)
                        replyService.sendAutoResponseMessage(
                          messageData.text,
                          chat,
                          channel,
                          customer,
                          channel.organization,
                        )
                      } catch (error) {
                        errorMessage(
                          'CONTROLLER',
                          'webhook.facebook',
                          'Send auto response message',
                          error,
                        )
                      }
                    }

                    if (isNewChat) {
                      // Update Customer profile
                      await getNewCustomerProfile(
                        customer,
                        customer.uid,
                        channel,
                        organizationId,
                      )

                      // Check auto response welcome type
                      // try {
                      //   replyService.sendWelcomeMessage(
                      //     chat,
                      //     channel,
                      //     customer,
                      //     channel.organization,
                      //   )
                      // } catch (error) {
                      //   errorMessage(
                      //     'CONTROLLER',
                      //     'webhook.facebook',
                      //     'auto response(welcome message)',
                      //     error,
                      //   )
                      // }
                      // Send Notification new Chat to all chat user
                      notificationUtil.chat.notificationNewChat(
                        chat,
                        organization,
                      )
                    } else {
                      // Send Notification new Message to owner
                      if (chat.ownerId) {
                        notificationUtil.chat.notificationNewMessage(
                          newMessage,
                          organization,
                        )
                      }
                    }

                    // Check Working Hours
                    try {
                      const result = await workingHoursUtil.isWorkingHours(
                        channel.organization,
                      )
                      if (!result) {
                        // Send Working Hour Message
                        workingHoursUtil.sendWorkingHourMessage(
                          chat,
                          channel,
                          customer,
                          channel.organization,
                        )
                      }
                    } catch (error) {
                      errorMessage(
                        'CONTROLLER',
                        'webhook.facebook',
                        'Working Hours',
                        error,
                      )
                    }
                  }
                } catch (error) {
                  errorMessage(
                    'CONTROLLER',
                    'webhook.facebook',
                    'receiveMessage(message)',
                    error,
                  )
                }
              }
            }
          } else if (facebookMessage.reaction) {
            // Reaction message
            if (facebookMessage.reaction.action === 'react') {
              await messageModel.reactMessage(facebookMessage.reaction.mid, {
                reaction: facebookMessage.reaction.reaction,
                emoji: facebookMessage.reaction.emoji,
              })
            } else if (facebookMessage.reaction.action === 'unreact') {
              await messageModel.unReactMessage(facebookMessage.reaction.mid)
            }
          } else if (facebookMessage.postback) {
            // Postback
            try {
              const _newMessage = {
                ...new MessageEntity(),
                data: JSON.stringify({
                  text: facebookMessage.postback.payload.replace(
                    nullCharRegExp,
                    '',
                  ),
                }),
                channel,
                type: MESSAGE_TYPE.TEXT,
                timestamp: facebookMessage.timestamp
                  ? new Date(Number(facebookMessage.timestamp))
                  : new Date(),
                direction: MESSAGE_DIRECTION.INBOUND,
                chat,
                organizationId,
              } as MessageEntity

              const newMessage = await messageModel.saveMessage(_newMessage)
              try {
                replyService.sendAutoResponseMessage(
                  JSON.parse(newMessage.data).text,
                  chat,
                  channel,
                  customer,
                  channel.organization,
                )
              } catch (error) {
                errorMessage(
                  'CONTROLLER',
                  'webhook.facebook',
                  'Send auto response message',
                  error,
                )
              }

              if (isNewChat) {
                // Update Customer profile
                await getNewCustomerProfile(
                  customer,
                  customer.uid,
                  channel,
                  organizationId,
                )

                // Check auto response welcome type
                // try {
                //   replyService.sendWelcomeMessage(
                //     chat,
                //     channel,
                //     customer,
                //     channel.organization,
                //   )
                // } catch (error) {
                //   errorMessage(
                //     'CONTROLLER',
                //     'webhook.facebook',
                //     'auto response(welcome message)',
                //     error,
                //   )
                // }
                // Send Notification new Chat to all chat user
                notificationUtil.chat.notificationNewChat(chat, organization)
              } else {
                // Send Notification new Message to owner
                if (chat.ownerId) {
                  notificationUtil.chat.notificationNewMessage(
                    newMessage,
                    organization,
                  )
                }
              }

              // Check Working Hours
              try {
                const result = await workingHoursUtil.isWorkingHours(
                  channel.organization,
                )
                if (!result) {
                  // Send Working Hour Message
                  workingHoursUtil.sendWorkingHourMessage(
                    chat,
                    channel,
                    customer,
                    channel.organization,
                  )
                }
              } catch (error) {
                errorMessage(
                  'CONTROLLER',
                  'webhook.facebook',
                  'Working Hours',
                  error,
                )
              }
            } catch (error) {
              errorMessage(
                'CONTROLLER',
                'webhook.facebook',
                'receiveMessage(message)',
                error,
              )
            }
          }
        })

        sseController.sendEventToAllSubscriber(
          organizationId,
          JSON.parse(JSON.stringify({ event: 'newEvent' })),
        )
        return
      }
    })

    res.status(200).send({
      code: 'received',
    })
    // You must send back a 200, within 20 seconds, to let us know you've
  } catch (error) {
    errorMessage('CONTROLLER', 'webhook.facebook', 'receiveMessage', error)
    // return next(new HttpException(400, ErrorCode[400]))
    res.status(200).send({
      code: 'received',
    })
  }
}
