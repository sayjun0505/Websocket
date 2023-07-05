import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { ReplyKeywordEntity } from '.'

export const getKeywords = async (organization: OrganizationEntity) => {
  return await getRepository(ReplyKeywordEntity).find({
    where: {
      organization,
    },
    relations: ['createdBy', 'updatedBy'],
  })
}

export const getKeywordsWithReply = async (
  replyId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ReplyKeywordEntity).find({
    where: {
      reply: {
        id: replyId,
      },
      organization,
    },
    relations: ['createdBy', 'updatedBy'],
  })
}

export const getKeywordWithKeyword = async (
  keyword: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ReplyKeywordEntity).findOne({
    where: {
      keyword,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'reply'],
  })
}

export const saveKeyword = async (keyword: ReplyKeywordEntity) => {
  try {
    return await getRepository(ReplyKeywordEntity).save(keyword)
  } catch (error) {
    errorMessage('MODEL', 'keyword', 'saveKeyword', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteKeyword = async (id: string) => {
  try {
    return await getRepository(ReplyKeywordEntity).delete(id)
  } catch (error) {
    errorMessage('MODEL', 'keyword', 'deleteKeyword', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
