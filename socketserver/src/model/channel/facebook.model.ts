import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '../organization'
import { FacebookChannelEntity } from '.'

export const getFacebookChannels = async (organization: OrganizationEntity) => {
  return await getRepository(FacebookChannelEntity).find({
    where: {
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'channel'],
  })
}

export const getFacebookChannelWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(FacebookChannelEntity).findOne({
    where: {
      id,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'channel'],
  })
}

export const saveFacebookChannel = async (
  facebookChannel: FacebookChannelEntity,
) => {
  try {
    return await getRepository(FacebookChannelEntity).save(facebookChannel)
  } catch (error) {
    errorMessage('MODEL', 'facebook', 'saveFacebookChannel', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
