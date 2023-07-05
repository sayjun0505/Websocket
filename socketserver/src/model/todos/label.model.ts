import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '../organization'
import { TodoLabelEntity } from '.'

export const getLabels = async (organization: OrganizationEntity) => {
  return await getRepository(TodoLabelEntity).find({
    where: {
      organization,
    },
    // relations: ['createdBy', 'updatedBy'],
  })
}

export const getLabelWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TodoLabelEntity).findOne({
    where: {
      id,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'todo'],
  })
}

export const getLabelWithCardId = async (
  cardId: string,
  userId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TodoLabelEntity).findOne({
    where: {
      cardId,
      userId,
      organization,
    },
  })
}

export const getLabelWithTitle = async (
  title: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TodoLabelEntity).findOne({
    where: {
      title,
      organization,
    },
    // relations: ['createdBy', 'updatedBy', 'todo'],
  })
}

export const saveLabels = async (labels: TodoLabelEntity[]) => {
  try {
    return await getRepository(TodoLabelEntity).save(labels)
  } catch (error) {
    errorMessage('MODEL', 'label', 'saveLabels', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
