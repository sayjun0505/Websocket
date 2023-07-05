import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '../organization'
import { InstagramChannelEntity } from '.'

export const getInstagramChannels = async (organization: OrganizationEntity) => {
  return await getRepository(InstagramChannelEntity).find({
    where: {
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'channel'],
  })
}

export const getInstagramChannelWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(InstagramChannelEntity).findOne({
    where: {
      id,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'channel'],
  })
}

export const saveInstagramChannel = async (
  facebookChannel: InstagramChannelEntity,
) => {
  try {
    return await getRepository(InstagramChannelEntity).save(facebookChannel)
  } catch (error) {
    errorMessage('MODEL', 'facebook', 'saveFacebookChannel', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
