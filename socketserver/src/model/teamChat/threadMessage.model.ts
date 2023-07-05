import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { TeamChatThreadMessageEntity } from './threadMessage.entity'

export const getMessages = async (organization: OrganizationEntity) => {
  return await getRepository(TeamChatThreadMessageEntity).find({
    where: {
      organization,
    },
    relations: ['createdBy'],
    order: { createdAt: 'DESC' },
  })
}

export const getMessagesWithThreadId = async (
  threadId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TeamChatThreadMessageEntity).find({
    where: {
      threadId,
      organization,
    },
    relations: ['createdBy'],
    order: { createdAt: 'DESC' },
  })
}

export const getMessagesWithId = async (id: string) => {
  return await getRepository(TeamChatThreadMessageEntity).findOne({
    where: {
      id,
    },
    relations: ['createdBy'],
    order: { createdAt: 'DESC' },
  })
}

export const getMessagesWithThreadIds = async (
  threadIds: string[],
  organization: OrganizationEntity,
) => {
  return await getRepository(TeamChatThreadMessageEntity).find({
    where: {
      threadId: In(threadIds),
      organization,
    },
    relations: ['createdBy'],
    select: ['createdBy', 'threadId'],
    order: { createdAt: 'DESC' },
  })
}

export const getCountMessagesWithThreadId = async (
  threadId: string,
  organizationId: string,
) => {
  return await getRepository(TeamChatThreadMessageEntity).count({
    where: {
      threadId,
      organizationId,
    },
  })
}

export const saveMessage = async (message: TeamChatThreadMessageEntity) => {
  try {
    return await getRepository(TeamChatThreadMessageEntity).save(message)
  } catch (error) {
    errorMessage('MODEL', 'teamchat_thread_message', 'saveMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
