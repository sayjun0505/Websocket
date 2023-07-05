import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '../organization'
import { CustomerEntity } from '.'
import { ChannelEntity } from '../channel'
import label from 'src/api/customer/label'

export const getCustomers = async (organization: OrganizationEntity) => {
  return await getRepository(CustomerEntity).find({
    where: {
      isDelete: false,
      organization,
      channel: {
        isDelete: false,
      },
    },
    select: [
      'id',
      'uid',
      'firstname',
      'lastname',
      'display',
      'picture',
      'channelId',
    ],
    relations: [
      // 'createdBy',
      // 'updatedBy',
      'channel',
      // 'channel.line',
      // 'channel.facebook',
      // 'channel.instagram',
      // 'chat',
      // 'customerLabel',
    ],
  })
}

export const getChatHistories = async (organizationId: string) => {
  return await getRepository(CustomerEntity).find({
    where: {
      isDelete: false,
      organizationId,
    },
    select: [
      'id',
      'uid',
      'firstname',
      'lastname',
      'display',
      'picture',
      'channelId',
      'createdAt',
    ],
    relations: ['chat', 'customerLabel'],
  })
}

export const getChatHistoryWithCustomerId = async (
  id: string,
  organizationId: string,
) => {
  return await getRepository(CustomerEntity).findOne({
    where: {
      id,
      isDelete: false,
      organizationId,
    },
    select: ['id', 'chat'],
    relations: ['chat'],
  })
}

export const getCustomerWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(CustomerEntity).findOne({
    where: {
      id,
      isDelete: false,
      organization,
    },
    relations: [
      'createdBy',
      'updatedBy',
      'address',
      'customerLabel',
      'pointLog',
      'rewardLog',
      'channel',
      'channel.line',
      'channel.facebook',
      'chat',
      'chat.message',
    ],
  })
}

// This api for Webhook only
export const getCustomerWithUIDs = async (
  UIDs: string[],
  channelId: string,
  organizationId: string,
) => {
  return await getRepository(CustomerEntity).find({
    where: {
      uid: In(UIDs),
      channelId,
      organizationId,
    },
    select: ['id', 'uid', 'display', 'picture'],
  })
}

export const getCustomerWithUidAndChannel = async (
  uid: string,
  channel: ChannelEntity,
  organization: OrganizationEntity,
) => {
  return await getRepository(CustomerEntity).findOne({
    where: {
      uid,
      channel: {
        id: channel.id,
      },
      organization,
    },
    relations: [
      'createdBy',
      'updatedBy',
      'address',
      'customerLabel',
      'pointLog',
      'rewardLog',
      'channel',
    ],
  })
}

export const saveCustomer = async (customer: CustomerEntity) => {
  try {
    return await getRepository(CustomerEntity).save(customer)
  } catch (error) {
    errorMessage('MODEL', 'customer', 'saveCustomer', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
