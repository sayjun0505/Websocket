import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '../organization'
import { AddressEntity } from '.'

export const getAddresses = async (organization: OrganizationEntity) => {
  return await getRepository(AddressEntity).find({
    where: {
      organization,
    },
    relations: ['createdBy', 'updatedBy'],
  })
}

export const getAddressWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(AddressEntity).find({
    where: {
      id,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'customer'],
  })
}

export const saveAddress = async (address: AddressEntity) => {
  try {
    return await getRepository(AddressEntity).save(address)
  } catch (error) {
    errorMessage('MODEL', 'address', 'saveAddress', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteAddress = async (id: string) => {
  try {
    return await getRepository(AddressEntity).delete(id)
  } catch (error) {
    errorMessage('MODEL', 'address', 'deleteAddress', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
