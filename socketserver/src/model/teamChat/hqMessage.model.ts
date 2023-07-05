import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, MoreThan } from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { TeamChatHQMessageEntity, TeamChatHQSettingEntity } from '.'

export const getHQMessagesWithOrganizationId = async (
  organizationId: string,
) => {
  return await getRepository(TeamChatHQMessageEntity).find({
    where: {
      organizationId,
    },
    relations: ['createdBy'],
    order: { createdAt: 'DESC' },
  })
}
export const getLastHQMessagesWithOrganizationId = async (
  organizationId: string,
) => {
  return await getRepository(TeamChatHQMessageEntity).findOne({
    where: {
      organizationId,
    },
    relations: ['createdBy'],
    order: { createdAt: 'DESC' },
  })
}
export const getHQMessagesWithMessageId = async (
  messageId: string,
) => {
  return await getRepository(TeamChatHQMessageEntity).findOne({
    where: {
      id: messageId,
    },
    relations: ['createdBy'],
    // order: { createdAt: 'DESC' },
  })
}
export const saveMessage = async (message: TeamChatHQMessageEntity) => {
  try {
    return await getRepository(TeamChatHQMessageEntity).save(message)
  } catch (error) {
    errorMessage('MODEL', 'teamchat_hq_message', 'saveMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const isPinMessage = async ({ id, isPin }: any) => {
  try {
    const result = await getRepository(TeamChatHQMessageEntity).update(
      { id },
      { isPin },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'message', 'isPinMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const isDeleteMessage = async ({ id, data, isDelete }: any) => {
  try {
    const result = await getRepository(TeamChatHQMessageEntity).update(
      { id },
      { data, isDelete },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'message', 'isDeleteMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const isEditMessage = async ({ id, data, isEdit }: any) => {
  try {
    const result = await getRepository(TeamChatHQMessageEntity).update(
      { id },
      { data, isEdit },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'message', 'isEditMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const isReplyMessage = async ({ id, isReply }: any) => {
  try {
    const result = await getRepository(TeamChatHQMessageEntity).update(
      { id },
      { isReply },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'message', 'isReplyMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const markReadMessageList = async (messages: TeamChatHQMessageEntity[]) => {
  try {
    const isReadList = await messages.map((item) => ({ ...item, isRead: true }))
    return await getRepository(TeamChatHQMessageEntity).save(isReadList)
  } catch (error) {
    errorMessage('MODEL', 'teamchat_channel_message', 'markReadMessageList', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getLastHQMessagesWithOrganizationId_UserId = async (
  organizationId: string,
  createdById: string,
) => {
  return await getRepository(TeamChatHQMessageEntity).findOne({
    where: {
      organizationId,
      createdById,
    },
    relations: ['createdBy'],
    order: { createdAt: 'DESC' },
  })
}

export const getReplyHQMessagesWithOrganizationId = async (
  organizationId: string,
) => {
  return await getRepository(TeamChatHQMessageEntity).find({
    where: {
      organizationId,
      isReply: true,
      isDelete: false,
    },
    order: { createdAt: 'DESC' },
  })
}