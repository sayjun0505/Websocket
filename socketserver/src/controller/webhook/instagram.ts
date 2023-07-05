import { NextFunction, Request, Response } from 'express'
import * as crypto from 'crypto'
import _, { values } from 'lodash'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
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
import { CHANNEL, ChannelEntity } from '../../model/channel/channel.entity'
import { lineService } from '../../service/channel'
import { gcsService } from '../../service/google'
import { MESSAGE_DIRECTION } from '../../model/chat/message.entity'
import { ChatEntity } from '../../model/chat/chat.entity'
import { CustomerEntity } from '../../model/customer/customer.entity'
import * as channelService from '../../service/channel'
import * as replyService from '../../service/reply'
import { notificationUtil, workingHoursUtil } from '../../util'
import { sseController } from '../sse'
import {
  chatManagement,
  customerManagement,
  getNewCustomerProfile,
} from './helper'

export const checkFileTypeFromURL = async (url: string) => {
  const response = await axios.get(url)
  return response.headers['content-type'].split('/')[0]
}
export const webhookValidate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log('Instagram webhook MODE ', req.query['hub.mode'])
    if (
      channelService.instagramService.validate(
        String(req.query['hub.mode']),
        String(req.query['hub.verify_token']),
      )
    ) {
      res.status(200).send(req.query['hub.challenge'])
    } else {
      errorMessage(
        'CONTROLLER',
        'instagram',
        'Failed validation. Make sure the validation tokens match.',
      )
      return next(new HttpException(403, 'Failed validation.'))
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'instagram', 'webhookValidate', error)
    return next(new HttpException(403, 'Failed validation.'))
  }
}

interface IInstagramMessaging {
  sender: any
  recipient: any
  [key: string]: any
}
interface IInstagramMessageEntry {
  // Common properties
  id: string
  time: string
  messaging: IInstagramMessaging[]
  [key: string]: any
}

// Convert Instagram event object to FoxConnect MessageEntity object
const convertMessageEvent = async (
  organizationId: string,
  instagramMessage: IInstagramMessaging,
  customer: CustomerEntity,
  channel: ChannelEntity,
  chat: ChatEntity,
) => {
  // console.log('[receiveMessage] convertMessageEvent')
  if (!instagramMessage.message) {
    errorMessage('CONTROLLER', 'webhook.instagram', 'input event wrong type')
    // throw new HttpException(400, ErrorCode[400])
    return
  }

  // Note : PostgreSQL doesn't support storing NULL (\0x00) characters in text fields
  const nullCharRegExp = new RegExp(/\u0000|\x00/m)

  const timestamp = new Date(Number(instagramMessage.timestamp))
  const messageTimestamp = timestamp ? timestamp : new Date()

  let instagramMessageData = {}
  let instagramMessageType
  if (instagramMessage.message.text) {
    // Text Message
    instagramMessageType = MESSAGE_TYPE.TEXT
    instagramMessageData = {
      text: instagramMessage.message.text.replace(nullCharRegExp, ''),
    }
  } else if (instagramMessage.message.attachments) {
    // Message with attachment <image|video|audio|file>
    const attachments: { filename: string }[] = await Promise.all(
      instagramMessage.message.attachments.map(
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
              'webhook.instagram',
              'unsupported attachment message type',
            )
            return
          }
          if (attachment.type === MESSAGE_TYPE.IMAGE) {
            // sticker will be image type
            if (attachment.payload.sticker_id) {
              instagramMessageType = MESSAGE_TYPE.STICKER
            } else {
              instagramMessageType = MESSAGE_TYPE.IMAGE
            }
          } else if (attachment.type === 'story_mention') {
            instagramMessageType =
              (await checkFileTypeFromURL(attachment.payload.url)) === 'image'
                ? MESSAGE_TYPE.STORY_IMAGE_MENTION
                : MESSAGE_TYPE.STORY_VIDEO_MENTION

            console.log('@@ instagramMessageType', instagramMessageType)
          } else {
            // video/location/audio/file
            instagramMessageType = attachment.type
          }

          return { url: attachment.payload.url }

          // const url = attachment.payload.url
          // const urlParams = url ? url.split('?')[1] : ''
          // const params = new URLSearchParams(urlParams)
          // // console.log('[receiveMessage] params ', params)
          // // console.log('[receiveMessage] params ', params.get('asset_id'))
          // const _contentFilename =
          //   (params && params.get('asset_id')) || instagramMessage.message.mid
          // // const _contentFilename = instagramMessage.message.mid
          // // console.log('[receiveMessage] _contentFilename ', _contentFilename)

          // try {
          //   const filename = await gcsService.uploadChatMessageFromFileURL(
          //     organizationId,
          //     channel,
          //     customer.id,
          //     _contentFilename,
          //     url,
          //   )
          //   // console.log('[receiveMessage] filename ', filename)
          //   if (filename) return { filename }
          // } catch (error) {
          //   // console.log('[receiveMessage] uploadChatMessageFromFileURL ', error)
          //   return { url: attachment.payload.url }
          // }
        },
      ),
    )

    // console.log('[receiveMessage] attachments ', attachments)
    if (attachments && attachments.length === 1) {
      instagramMessageData = attachments[0]
    } else if (attachments && attachments.length > 1) {
      instagramMessageData = {
        ...attachments.shift(),
        more: attachments,
      }
    } else {
      errorMessage('CONTROLLER', 'webhook.instagram', 'no attachment message')
      return
    }
  } else {
    errorMessage(
      'CONTROLLER',
      'webhook.instagram',
      'Unsupported payload message',
    )
    return
  }
  let replyToId = null
  if (instagramMessage.message.reply_to) {
    if (instagramMessage.message.reply_to.mid) {
      const _replyToMessage = await messageModel.getMessageWithMID(
        instagramMessage.message.reply_to.mid,
        chat.id,
        organizationId,
      )
      if (_replyToMessage) {
        replyToId = _replyToMessage.id
      }
    }
    if (instagramMessage.message.reply_to.story) {
      const _replyToStory = await messageModel.getMessageWithMID(
        instagramMessage.message.reply_to.story.id,
        chat.id,
        organizationId,
      )
      if (_replyToStory) {
        replyToId = _replyToStory.id
      } else {
        const type =
          (await checkFileTypeFromURL(
            instagramMessage.message.reply_to.story.url,
          )) === 'image'
            ? MESSAGE_TYPE.STORY_IMAGE
            : MESSAGE_TYPE.STORY_VIDEO
        console.log('@@ IG Reply TO type', type)
        const storyMessage = await messageModel.saveMessage({
          ...new MessageEntity(),
          data: instagramMessage.message.reply_to.story,
          mid: instagramMessage.message.reply_to.story.id,
          channel,
          isRead: true,
          type,
          timestamp: messageTimestamp,
          direction:
            instagramMessage.sender.id === channel.instagram.pageId
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
    data: JSON.stringify(instagramMessageData),
    mid: instagramMessage.message.mid,
    replyToId,
    channel,
    type: instagramMessageType,
    timestamp: messageTimestamp,
    direction:
      instagramMessage.sender.id === channel.instagram.pageId
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

    // console.log('IG BODY ', req.body)
    console.log('BODY ', JSON.stringify(req.body))
    console.log('IG MSG ', entry[0].messaging)
    // console.log('IG MSG ', entry[0].messaging[0].message)
    // console.log(
    //   'IG MSG ',
    //   entry[0].messaging[0].message && entry[0].messaging[0].message.reply_to,
    // )

    if (!object || !entry) {
      errorMessage(
        'CONTROLLER',
        'webhook.instagram',
        'invalid data(object/entry)',
      )
      return next(new HttpException(400, ErrorCode[400]))
    }

    /**
     * Section: "object":"page"
     */

    if (object !== 'instagram') {
      errorMessage('CONTROLLER', 'webhook.instagram', 'unsupported object type')
      return next(new HttpException(400, ErrorCode[400]))
    }

    // Get channel list from setting
    const channels = await channelModel.getInstagramChannelWithPageIds(
      entry.map((e: IInstagramMessageEntry) => e.id),
    )

    // Start receive message process
    await entry.forEach(async (entryElement: IInstagramMessageEntry) => {
      // console.log('[receiveMessage] Prepare entryElement:', entryElement.id)
      // Prepare data before process message
      const channel = channels.find(
        (ch: ChannelEntity) =>
          ch.channel === 'instagram' &&
          ch.instagram &&
          ch.instagram.pageId === entryElement.id,
      )
      if (!channel || !channel.instagram) {
        errorMessage(
          'CONTROLLER',
          'webhook.instagram',
          `Skip message from channel: ${entryElement.id}`,
        )
        return
      }

      // console.log('[receiveMessage] channel:', {
      //   id: channel.id,
      //   channel: channel.channel,
      //   instagram: { name: channel.instagram.name },
      // })

      if (
        !entryElement.messaging ||
        !entryElement.messaging.length ||
        entryElement.messaging.length <= 0
      ) {
        errorMessage(
          'CONTROLLER',
          'webhook.instagram',
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
          (_customerId) => _customerId !== channel.instagram.pageId,
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
        //   channel.instagram.name,
        // )

        const organizationId: string = channel.organizationId
        const organization: OrganizationEntity = channel.organization

        await messaging.forEach(
          async (instagramMessage: IInstagramMessaging) => {
            const customer = customers.find((_customer: CustomerEntity) => {
              if (instagramMessage.sender.id === channel.instagram.pageId) {
                return _customer.uid === instagramMessage.recipient.id
              } else {
                return _customer.uid === instagramMessage.sender.id
              }
            })
            if (!customer) {
              errorMessage(
                'CONTROLLER',
                'webhook.instagram',
                `Skip message: customer${instagramMessage.sender.id} not found`,
              )
              return
            }
            const chat = chats.find(
              (_chat: ChatEntity) => _chat.customerId === customer.id,
            )
            if (!chat) {
              errorMessage(
                'CONTROLLER',
                'webhook.instagram',
                `Skip message: chat not found`,
              )
              return
            }
            const isNewChat = Boolean(chat.organizationId)

            // Recheck channel is correct
            if (
              !channel.instagram ||
              (channel.instagram.pageId !== instagramMessage.recipient.id &&
                channel.instagram.pageId !== instagramMessage.sender.id)
            ) {
              errorMessage(
                'CONTROLLER',
                'webhook.instagram',
                `Skip message: recipient ${instagramMessage.recipient.id} not found`,
              )
              return
            }

            /**
             * New Message
             */
            // let message
            if (instagramMessage.message) {
              // Message

              /**
               * Handle UnSend Message
               */
              if (
                instagramMessage.message.mid &&
                instagramMessage.message.is_deleted
              ) {
                try {
                  await messageModel.unSendMessage(instagramMessage.message.mid)
                } catch (error) {
                  errorMessage(
                    'CONTROLLER',
                    'webhook.instagram',
                    `Update unSend message mid: ${instagramMessage.message.mid}`,
                  )
                }
              } else {
                let duplicateMessage
                if (
                  instagramMessage.message.mid &&
                  instagramMessage.message.is_echo
                ) {
                  duplicateMessage = await messageModel.getMessageWithMID(
                    instagramMessage.message.mid,
                    chat.id,
                    organizationId,
                  )
                }

                if (!duplicateMessage) {
                  try {
                    const _newMessage = await convertMessageEvent(
                      organizationId,
                      instagramMessage,
                      customer,
                      channel,
                      chat,
                    )
                    if (!_newMessage) {
                      errorMessage(
                        'CONTROLLER',
                        'webhook.instagram',
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
                            'webhook.instagram',
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
                        //     'webhook.instagram',
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
                          'webhook.instagram',
                          'Working Hours',
                          error,
                        )
                      }
                    }
                  } catch (error) {
                    errorMessage(
                      'CONTROLLER',
                      'webhook.instagram',
                      'receiveMessage(message)',
                      error,
                    )
                  }
                }
              }
            } else if (instagramMessage.reaction) {
              // Reaction message
              if (instagramMessage.reaction.action === 'react') {
                await messageModel.reactMessage(instagramMessage.reaction.mid, {
                  reaction: instagramMessage.reaction.reaction,
                  emoji: instagramMessage.reaction.emoji,
                })
              } else if (instagramMessage.reaction.action === 'unreact') {
                await messageModel.unReactMessage(instagramMessage.reaction.mid)
              }
            }
          },
        )

        sseController.sendEventToAllSubscriber(
          organizationId,
          JSON.parse(JSON.stringify({ event: 'newEvent' })),
        )
        return
      }
    })
    return res.status(200).send({
      code: 'received',
    })
    // You must send back a 200, within 20 seconds, to let us know you've
  } catch (error) {
    errorMessage('CONTROLLER', 'webhook.instagram', 'receiveMessage', error)
    // return next(new HttpException(400, ErrorCode[400]))
    return res.status(200).send({
      code: 'received',
    })
  }
}
