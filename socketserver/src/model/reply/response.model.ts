import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '../organization'
import { ReplyKeywordEntity, ReplyResponseEntity } from '.'

export const getResponses = async (organization: OrganizationEntity) => {
  return await getRepository(ReplyResponseEntity).find({
    where: {
      organization,
    },
    relations: ['createdBy', 'updatedBy'],
  })
}

export const getResponseWithReplyId = async (
  replyId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ReplyResponseEntity).find({
    where: {
      reply: {
        id: replyId,
      },
      organization,
    },
    relations: ['createdBy', 'updatedBy'],
  })
}

export const saveResponse = async (response: ReplyResponseEntity) => {
  try {
    return await getRepository(ReplyResponseEntity).save(response)
  } catch (error) {
    errorMessage('MODEL', 'response', 'saveResponse', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const saveResponses = async (responses: ReplyResponseEntity[]) => {
  try {
    return await getRepository(ReplyResponseEntity).save(responses)
  } catch (error) {
    errorMessage('MODEL', 'response', 'saveResponses', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteResponse = async (id: string) => {
  try {
    return await getRepository(ReplyResponseEntity).delete(id)
  } catch (error) {
    errorMessage('MODEL', 'response', 'deleteResponse', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
