import { NextFunction, Request, Response } from 'express'
import * as crypto from 'crypto'
import _, { values } from 'lodash'
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
import { customerModel } from '../../model/customer'
import * as channelService from '../../service/channel'
import * as replyService from '../../service/reply'
import { notificationUtil, workingHoursUtil } from '../../util'
import { sseController } from '../sse'

export const getNewCustomerProfile = async (
  currentCustomer: CustomerEntity,
  userId: string,
  channel: ChannelEntity,
  organizationId: string,
) => {
  const newProfile: channelService.ISocialProfile =
    await channelService.getCustomerProfile(userId, channel)

  let filename = ''
  if (newProfile.picture && newProfile.picture !== '') {
    // Upload Profile picture to FoxConnect
    filename = await gcsService.uploadChatCustomerDisplay(
      channel.id,
      organizationId,
      newProfile.uid,
      newProfile.uid,
      newProfile.picture,
    )
  }

  try {
    return await customerModel.saveCustomer({
      ...currentCustomer,
      channel,
      uid: newProfile.uid,
      picture: filename,
      display: newProfile.display,
      organizationId,
    })
  } catch (error) {
    const _currentCustomer = await customerModel.getCustomerWithUidAndChannel(
      newProfile.uid,
      channel,
      channel.organization,
    )
    if(_currentCustomer){
      return await customerModel.saveCustomer({
        ..._currentCustomer, 
        channel,
        uid: newProfile.uid,
        picture: filename,
        display: newProfile.display,
        organizationId,
      })
    }
    throw new Error("No user");
  }
}

// Customer Management Get current or create new customer
export const customerManagement = async (
  userIds: string[],
  channel: ChannelEntity,
): Promise<CustomerEntity[]> => {
  console.log('customerManagement ', userIds)
  const currentCustomers = await customerModel.getCustomerWithUIDs(
    userIds,
    channel.id,
    channel.organizationId,
  )
  const customers = await Promise.all(
    userIds.map(async (userId) => {
      const current = currentCustomers.find(
        (customer) => customer.uid === userId,
      )
      if (current) {
        // Update Customer profile when customer have no display and no picture
        if (
          !current.display ||
          current.display === '' ||
          !current.picture ||
          current.picture === ''
        ) {
          try {
            const newCustomer = await getNewCustomerProfile(
              current,
              current.uid,
              channel,
              channel.organizationId,
            )
            return {
              id: newCustomer.id,
              uid: newCustomer.uid,
              display: newCustomer.display,
            } as CustomerEntity
          } catch (error) {
            errorMessage(
              'CONTROLLER',
              'webhook',
              `No customer profile data: ${userId}`,
            )
            return null
          }
        }
        return {
          id: current.id,
          uid: current.uid,
          display: current.display,
        } as CustomerEntity
      } else {
        // New Customer
        try {
          const customer = await getNewCustomerProfile(
            new CustomerEntity(),
            userId,
            channel,
            channel.organizationId,
          )
          return {
            id: customer.id,
            uid: customer.uid,
            display: customer.display,
          } as CustomerEntity
        } catch (error) {
          errorMessage(
            'CONTROLLER',
            'webhook',
            `No customer profile data: ${userId}`,
          )
          return null
        }
      }
    }),
  )

  return customers.filter(function isNotNullOrUndefined<T extends object>(
    input: null | undefined | T,
  ): input is T {
    return input != null
  })
}

// Chat Management Get current or create new customer
export const chatManagement = async (
  customerIds: string[],
  channel: ChannelEntity,
): Promise<ChatEntity[]> => {
  console.log('chatManagement ', customerIds)
  const currentChats = await chatModel.getActiveChatWithCustomerIds(
    customerIds,
    channel.organizationId,
  )
  return await Promise.all(
    customerIds.map(async (customerId) => {
      const current = currentChats.find(
        (_chat) => _chat.customerId === customerId,
      )
      if (current) {
        return current
      } else {
        // New Chat
        const newChat = await chatModel.saveChat({
          ...new ChatEntity(),
          customerId,
          channelId: channel.id,
          organizationId: channel.organizationId,
        })

        return {
          id: newChat.id,
          customerId: newChat.customerId,
          ownerId: newChat.ownerId,
          organizationId: newChat.organizationId,
        } as ChatEntity
      }
    }),
  )
}
