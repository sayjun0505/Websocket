import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, Not } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '../organization'
import { CustomerLabelEntity } from '.'

export const getLabels = async (org: OrganizationEntity) => {
  return await getRepository(CustomerLabelEntity).find({
    where: {
      label: Not(''),
      organization:org,
      isDelete: false,
    },
    select: ['id', 'label'],
  })
}


export const getCustomerWithLabel = async (
  organization: OrganizationEntity,
  labelId: string,
) => {
  const label = await getRepository(CustomerLabelEntity).findOne({
    where: {
      organization,
      id: labelId,
    },
    relations: ['customer'],
  })
  return label?.customer
}

export const getLabelWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(CustomerLabelEntity).findOne({
    where: {
      id,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'customer'],
  })
}

export const getLabelWithName = async (
  label: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(CustomerLabelEntity).findOne({
    where: {
      label,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'customer'],
  })
}

export const saveLabels = async (labels: CustomerLabelEntity[]) => {
  try {
    return await getRepository(CustomerLabelEntity).save(labels)
  } catch (error) {
    errorMessage('MODEL', 'label', 'saveLabels', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
