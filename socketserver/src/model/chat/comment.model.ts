import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { ChatCommentEntity } from '.'

export const getComments = async (
  chatId: string,
  organizationId: string,
  page: number,
  size: number,
) => {
  if (page !== 0 && size !== 0) {
    return await getRepository(ChatCommentEntity).findAndCount({
      where: {
        chatId,
        organizationId,
      },
      select: ['id', 'data', 'type', 'isPin', 'createdAt','createdBy'],
      relations: ['createdBy'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * size,
      take: size,
    })
  } else {
    return await getRepository(ChatCommentEntity).findAndCount({
      where: {
        chatId,
        organizationId,
      },
      select: ['id', 'data', 'type', 'isPin', 'createdAt','createdBy'],
      relations: ['createdBy'],
      order: { createdAt: 'ASC' },
    })
  }
}

export const getCommentWithId = async (
  commentId: string,
) => {
  return await getRepository(ChatCommentEntity).findOne({
    where: {
      id: commentId
    },
    select: ['id', 'data', 'type', 'isPin', 'createdAt','createdBy'],
    relations: ['createdBy'],
  })
}

export const getCommentsWithChatId = async (
  chatId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatCommentEntity).find({
    where: {
      chat: {
        id: chatId,
      },
      organization,
    },
    relations: ['createdBy', 'mention'],
  })
}

export const saveComment = async (comment: ChatCommentEntity) => {
  try {
    return await getRepository(ChatCommentEntity).save(comment)
  } catch (error) {
    errorMessage('MODEL', 'comment', 'saveComment', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
