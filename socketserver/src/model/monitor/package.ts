import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In, IsNull, Not } from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { MessageEntity } from '../chat/message.entity'
import { OrganizationUserEntity } from '../organization/organizationUser.entity'
import { ChatEntity } from '../chat/chat.entity'
import { ChannelEntity } from '../channel/channel.entity'

/// For monitor
export const getOrganizations = async () => {
  try {
    return await getRepository(OrganizationEntity).find({
      where: { isDelete: false, activation: Not(IsNull()) },
      select: ['activation', 'id'],
      relations: ['activation', 'activation.package'],
    })
  } catch (error) {
    errorMessage('MODEL', 'organization', 'getOrganizations', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getCountMessage = async (organizationId: string) => {
  try {
    return await getRepository(MessageEntity).count({
      where: { organization: { id: organizationId } },
      //   where: { organization: { id: In(organizationIds) } },
      select: ['id'],
      // relations: ['activation', 'activation.package'],
    })
  } catch (error) {
    errorMessage('MODEL', 'organization', 'getCountMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getCountChannel = async (organizationId: string) => {
  try {
    return await getRepository(ChannelEntity).count({
      where: { organization: { id: organizationId } },
    })
  } catch (error) {
    errorMessage('MODEL', 'organization', 'getCountChannel', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getCountUser = async (organizationId: string) => {
  try {
    return await getRepository(OrganizationUserEntity).count({
      where: { organization: { id: organizationId } },
    })
  } catch (error) {
    errorMessage('MODEL', 'organization', 'getCountUser', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
