import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { CustomerPointLogEntity } from '.'

export const getPointLogs = async (organization: OrganizationEntity) => {
  return await getRepository(CustomerPointLogEntity).find({
    where: {
      organization,
    },
    relations: ['createdBy', 'customer'],
  })
}

export const getPointLogWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(CustomerPointLogEntity).findOne({
    where: {
      id,
      organization,
    },
    relations: ['createdBy', 'customer'],
  })
}

export const savePointLog = async (pointLog: CustomerPointLogEntity) => {
  try {
    return await getRepository(CustomerPointLogEntity).save(pointLog)
  } catch (error) {
    errorMessage('MODEL', 'pointLog', 'savePointLog', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deletePointLog = async (id: string) => {
  try {
    return await getRepository(CustomerPointLogEntity).delete(id)
  } catch (error) {
    errorMessage('MODEL', 'pointLog', 'deletePointLog', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
