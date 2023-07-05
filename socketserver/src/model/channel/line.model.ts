import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '../organization'
import { LineChannelEntity } from '.'

export const getLineChannels = async (organization: OrganizationEntity) => {
  return await getRepository(LineChannelEntity).find({
    where: {
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'channel'],
  })
}

export const getLineChannelWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(LineChannelEntity).findOne({
    where: {
      id,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'channel'],
  })
}

export const saveLineChannel = async (lineChannel: LineChannelEntity) => {
  try {
    return await getRepository(LineChannelEntity).save(lineChannel)
  } catch (error) {
    errorMessage('MODEL', 'line', 'saveLineChannel', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
