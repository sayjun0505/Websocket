import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity, TeamEntity, UserEntity } from '../organization'
import { TaskTagEntity } from '.'

export const getTags = async (organization: OrganizationEntity) => {
  return await getRepository(TaskTagEntity).find({
    where: {
      organization,
      isDelete: false,
    },
    // relations: ['createdBy', 'updatedBy'],
  })
}

export const getTagWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TaskTagEntity).findOne({
    where: {
      id,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'task'],
  })
}

export const getTagWithCardId = async (
  cardId: string,
  userId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TaskTagEntity).findOne({
    where: {
      cardId,
      userId,
      organization,
    },
  })
}

export const getTagWithTitle = async (
  title: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TaskTagEntity).findOne({
    where: {
      title,
      organization,
    },
    // relations: ['createdBy', 'updatedBy', 'task'],
  })
}

export const saveTags = async (tags: TaskTagEntity[]) => {
  try {
    return await getRepository(TaskTagEntity).save(tags)
  } catch (error) {
    errorMessage('MODEL', 'tag', 'saveTags', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const removeTagWithId = async (
  id: string, updatedBy: UserEntity
) => {
  return await getRepository(TaskTagEntity).update(
    { id },
    { isDelete: true, updatedBy },
  )
}
