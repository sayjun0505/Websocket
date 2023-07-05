import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In, Not } from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { ChatEntity, CHAT_STATUS, MentionEntity } from '.'
import { CHANNEL } from '../channel'

const defaultRelations = [
  'createdBy',
  'updatedBy',
  'customer',
  'message',
  'channel',
  'mention',
  'mention.user',
  'customer.customerLabel',
  'channel.line',
  'channel.facebook',
  'channel.instagram',
]

export const getChats = async (organization: OrganizationEntity) => {
  return await getRepository(ChatEntity).find({
    where: {
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
  })
}
export const getChatsAllActive = async (organization: OrganizationEntity) => {
  return await getRepository(ChatEntity).find({
    where: {
      status: Not(CHAT_STATUS.RESOLVED),
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
  })
}
export const getChatsAllResolve = async (organization: OrganizationEntity) => {
  return await getRepository(ChatEntity).find({
    where: {
      status: CHAT_STATUS.RESOLVED,
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
  })
}
export const getChatsAllUnassign = async (organization: OrganizationEntity) => {
  return await getRepository(ChatEntity).find({
    where: {
      status: Not(CHAT_STATUS.RESOLVED),
      owner: undefined,
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
  })
}
export const getChatsAllMyOwner = async (
  requester: UserEntity,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).find({
    where: {
      status: Not(CHAT_STATUS.RESOLVED),
      owner: requester,
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
  })
}
export const getChatsAllMyMention = async (
  requester: UserEntity,
  organization: OrganizationEntity,
) => {
  const mentions = await getRepository(MentionEntity).find({
    where: {
      user: requester,
      organization,
    },
    relations: ['chat'],
  })

  return await getRepository(ChatEntity).find({
    where: {
      status: Not(CHAT_STATUS.RESOLVED),
      id: In(mentions.map((element) => element.chat.id)),
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
  })
}
export const getChatsAllMyFollowup = async (
  requester: UserEntity,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).find({
    where: {
      status: Not(CHAT_STATUS.RESOLVED),
      owner: requester,
      followup: true,
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
  })
}
export const getChatsAllSpam = async (
  requester: UserEntity,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).find({
    where: {
      owner: requester,
      spam: true,
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
  })
}
export const getChatsAllActiveLineChannel = async (
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).find({
    where: {
      status: Not(CHAT_STATUS.RESOLVED),
      channel: {
        channel: CHANNEL.LINE,
      },
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
  })
}
export const getChatsAllActiveFacebookChannel = async (
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).find({
    where: {
      status: Not(CHAT_STATUS.RESOLVED),
      channel: {
        channel: CHANNEL.FACEBOOK,
      },
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
  })
}
export const getChatsAllActiveInstagramChannel = async (
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).find({
    where: {
      status: Not(CHAT_STATUS.RESOLVED),
      channel: {
        channel: CHANNEL.INSTAGRAM,
      },
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
  })
}

export const getChatsWithCustomerId = async (
  customerId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).find({
    where: {
      customer: {
        id: customerId,
      },
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
  })
}
export const getLastChatWithCustomerId = async (
  customerId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).findOne({
    where: {
      customer: {
        id: customerId,
      },
      isDelete: false,
      organization,
    },
    order: { createdAt: 'DESC' },
  })
}
export const getActiveChatWithCustomerId = async (
  customerId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).findOne({
    where: {
      customer: {
        id: customerId,
      },
      status: Not(CHAT_STATUS.RESOLVED),
      isDelete: false,
      organization,
    },
    relations: defaultRelations,
    order: { createdAt: 'DESC' },
  })
}
// This api for Webhook only
export const getActiveChatWithCustomerIds = async (
  customerIds: string[],
  organizationId: string,
) => {
  return await getRepository(ChatEntity).find({
    where: {
      customerId: In(customerIds),
      status: Not(CHAT_STATUS.RESOLVED),
      isDelete: false,
      organizationId,
    },
    select: ['id', 'customerId', 'ownerId'],
    order: { createdAt: 'DESC' },
  })
}

export const getChatWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).findOne({
    where: {
      id,
      isDelete: false,
      organization,
    },
    select: [
      'id',
      'status',
      'channel',
      'channelId',
      'description',
      'customer',
      'customerId',
      'followup',
      'archived',
      'spam',
      'ownerId',
    ],
    relations: [
      // ...defaultRelations,
      // 'message.createdBy',
      // 'activity',
      // 'comment',
      // 'comment.createdBy',
      // 'owner',
      'channel',
      'customer',
      'customer.customerLabel',
    ],
  })
}
export const getChatHistoryWithCustomerId = async (
  customerId: string,
  organizationId: string,
) => {
  return await getRepository(ChatEntity).find({
    where: {
      customerId,
      isDelete: false,
      organizationId,
    },
    select: ['id', 'description', 'createdAt'],
  })
}

export const getChatsWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).find({
    where: {
      id,
      isDelete: false,
      organization,
    },
    relations: [
      ...defaultRelations,
      'message.createdBy',
      'activity',
      'comment',
      'comment.createdBy',
      'owner',
    ],
  })
}

export const saveChat = async (chat: ChatEntity) => {
  try {
    return await getRepository(ChatEntity).save(chat)
  } catch (error) {
    errorMessage('MODEL', 'chat', 'saveChat', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const updateStatus = async (
  chatId: string,
  status: CHAT_STATUS,
  updatedBy: UserEntity,
) => {
  try {
    return await getRepository(ChatEntity).update(
      { id: chatId },
      { status, updatedBy },
    )
  } catch (error) {
    errorMessage('MODEL', 'chat', 'updateStatus', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const updateOwner = async (
  chatId: string,
  ownerId: string,
  updatedBy: UserEntity,
) => {
  try {
    const result = await getRepository(ChatEntity).update(
      { id: chatId },
      { ownerId, updatedBy },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'list', 'updateList orderIndex', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getChatWithIdForScrumboard = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).findOne({
    where: {
      id,
      isDelete: false,
      organization,
    },
    // select: ['id','status','channelId','description','customerId','followup','archived','spam','ownerId']
    relations: [
      ...defaultRelations,
      'message.createdBy',
      'activity',
      'comment',
      'comment.createdBy',
      'owner',
    ],
  })
}

// For Notification
export const getChatForNotification = async (id: string) => {
  return await getRepository(ChatEntity).findOne({
    where: {
      id,
    },
    select: ['id', 'channel', 'customer', 'organizationId', 'channelId'],
    relations: [
      'channel',
      'channel.line',
      'channel.instagram',
      'channel.facebook',
      'customer',
    ],
  })
}
