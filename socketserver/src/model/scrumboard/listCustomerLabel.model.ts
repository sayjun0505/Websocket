import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { ScrumboardListCustomerLabelEntity } from '.'

export const getCustomerLabels = async (listId: string) => {
  return await getRepository(ScrumboardListCustomerLabelEntity).find({
    where: {
      listId,
    },
    relations: ['label']
  })
}
export const getCustomerLabel = async (listId: string, labelId: string) => {
  return await getRepository(ScrumboardListCustomerLabelEntity).findOne({
    where: {
      listId,
      labelId
    },
  })
}

export const deleteCustomerLabels = async (listId: string) => {
  return await getRepository(ScrumboardListCustomerLabelEntity).delete({
    listId,
  })
}

export const saveCustomerLabels = async (
  labels: ScrumboardListCustomerLabelEntity[],
) => {
  try {
    return await getRepository(ScrumboardListCustomerLabelEntity).save(labels)
  } catch (error) {
    errorMessage('MODEL', 'chat label', 'saveCustomerLabels', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
