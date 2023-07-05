import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { MentionEntity } from '.'

export const getMentions = async (organization: OrganizationEntity) => {
  return await getRepository(MentionEntity).find({
    where: {
      organization,
    },
    relations: ['createdBy', 'updatedBy'],
  })
}

export const getMentionsWithUserId = async (
  userId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(MentionEntity).find({
    where: {
      user: {
        id: userId,
      },
      organization,
    },
    relations: ['createdBy', 'updatedBy'],
  })
}

export const markReadMentions = async (userId: string, chatId: string) => {
  try {
    return await getRepository(MentionEntity).update(
      { userId, chatId },
      { isRead: true },
    )
  } catch (error) {
    errorMessage('MODEL', 'mention', 'markReadMentions', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const saveMention = async (mention: MentionEntity) => {
  try {
    return await getRepository(MentionEntity).save(mention)
  } catch (error) {
    errorMessage('MODEL', 'mention', 'saveMention', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const saveMentions = async (mentions: MentionEntity[]) => {
  try {
    return await getRepository(MentionEntity).save(mentions)
  } catch (error) {
    errorMessage('MODEL', 'mention', 'saveMention', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
