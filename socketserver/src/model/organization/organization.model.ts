import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In, IsNull, Not } from 'typeorm'
import { OrganizationEntity, UserEntity } from './'

export const getOrganizationWithId = async (id: string) => {
  try {
    return await getRepository(OrganizationEntity).findOne({
      where: { id, isDelete: false },
      relations: [
        'activation',
        'activation.package',
        'channel',
        'channel.line',
      ],
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getOrganizationWithId', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getOrganizationWithName = async (name: string) => {
  try {
    return await getRepository(OrganizationEntity).findOne({
      where: { name, isDelete: false },
      relations: ['activation', 'activation.package'],
    })
  } catch (error) {
    errorMessage('MODEL', 'organization', 'getOrganizationWithId', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const saveOrganization = async (organization: OrganizationEntity) => {
  try {
    return await getRepository(OrganizationEntity).save(organization)
  } catch (error) {
    errorMessage('MODEL', 'organization', 'saveOrganization', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
