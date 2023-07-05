import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In, Not } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '../organization'
import { ChannelEntity, CHANNEL_STATUS } from '.'
import { CHANNEL } from './channel.entity'

export const getChannels = async (organization: OrganizationEntity) => {
  return await getRepository(ChannelEntity).find({
    where: {
      isDelete: false,
      organization,
    },
    select: ['id', 'channel', 'facebook', 'line', 'instagram'],
    relations: ['facebook', 'line', 'instagram'],
  })
}
export const getChannelsforSocket = async (orgId:string) => {
  return await getRepository(ChannelEntity).find({
    where: {
      isDelete: false,
      organizationId:orgId
    },
    select: ['id', 'channel', 'facebook', 'line', 'instagram'],
    relations: ['facebook', 'line', 'instagram'],
  })
}

export const getChannelWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChannelEntity).findOne({
    where: {
      id,
      isDelete: false,
      organization,
    },
    select: [
      'id',
      'channel',
      'facebook',
      'line',
      'instagram',
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy',
    ],
    relations: ['createdBy', 'updatedBy', 'facebook', 'line', 'instagram'],
  })
}

// This api for Webhook only
export const getFacebookChannelWithPageIds = async (pageIds: string[]) => {
  return await getRepository(ChannelEntity).find({
    where: {
      facebook: {
        pageId: In(pageIds),
      },
      isDelete: false,
    },
    select: ['id', 'channel', 'organizationId', 'organization', 'isDelete'],
    relations: [
      'organization',
      // 'facebook',
      // 'line',
      'facebook',
    ],
  })
}
// This api for Webhook only
export const getInstagramChannelWithPageIds = async (pageIds: string[]) => {
  return await getRepository(ChannelEntity).find({
    where: {
      instagram: {
        pageId: In(pageIds),
      },
      isDelete: false,
    },
    select: ['id', 'channel', 'organizationId', 'organization'],
    relations: [
      'organization',
      // 'facebook',
      // 'line',
      'instagram',
    ],
  })
}

// This api for Webhook only
export const getChannelWithIdAndOnOrganization = async (id: string) => {
  return await getRepository(ChannelEntity).findOne({
    where: {
      id,
      isDelete: false,
    },
    relations: [
      'createdBy',
      'updatedBy',
      'facebook',
      'line',
      'instagram',
      'organization',
    ],
  })
}

export const getFacebookChannelWithPageId = async (
  pageId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChannelEntity).findOne({
    where: {
      facebook: {
        pageId,
      },
      channel: CHANNEL.FACEBOOK,
      isDelete: false,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'facebook', 'instagram'],
  })
}

export const getDeleteFacebookChannelWithPageId = async (pageId: string) => {
  return await getRepository(ChannelEntity).findOne({
    where: {
      facebook: {
        pageId,
      },
      channel: CHANNEL.FACEBOOK,
      isDelete: true,
    },
    relations: ['createdBy', 'updatedBy', 'facebook', 'instagram'],
  })
}

// This api for Webhook only
export const getFacebookChannelWithPageIdAndOnOrganization = async (
  pageId: string,
) => {
  return await getRepository(ChannelEntity).findOne({
    where: {
      facebook: {
        pageId,
      },
      isDelete: false,
      channel: CHANNEL.FACEBOOK,
      status: CHANNEL_STATUS.ACTIVE,
    },
    relations: ['createdBy', 'updatedBy', 'facebook', 'organization'],
  })
}
export const getInstagramChannelWithPageIdAndOnOrganization = async (
  pageId: string,
) => {
  return await getRepository(ChannelEntity).findOne({
    where: {
      instagram: {
        pageId,
      },
      isDelete: false,
      channel: CHANNEL.INSTAGRAM,
      status: CHANNEL_STATUS.ACTIVE,
    },
    relations: ['createdBy', 'updatedBy', 'instagram', 'organization'],
  })
}

export const getLineChannelWithChannelId = async (
  channelId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChannelEntity).findOne({
    where: {
      id: channelId,
      channel: CHANNEL.LINE,
      isDelete: false,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'line'],
  })
}

export const getDeleteLineChannelWithChannelSecret = async (
  channelSecret: string,
) => {
  return await getRepository(ChannelEntity).findOne({
    where: {
      line: {
        channelSecret,
      },
      channel: CHANNEL.LINE,
      isDelete: true,
    },
    relations: ['createdBy', 'updatedBy', 'line'],
  })
}

export const getAlreadyLINEChannel = async (channelSecret: string) => {
  return await getRepository(ChannelEntity).findOne({
    where: {
      line: {
        channelSecret,
      },
      channel: CHANNEL.LINE,
      isDelete: false,
    },
    relations: ['line'],
  })
}
export const getAlreadyFacebookChannel = async (pageId: string) => {
  return await getRepository(ChannelEntity).findOne({
    where: {
      facebook: {
        pageId,
      },
      channel: CHANNEL.FACEBOOK,
      isDelete: false,
    },
    relations: ['facebook', 'instagram'],
  })
}

export const getAlreadyInstagramChannel = async (pageId: string) => {
  return await getRepository(ChannelEntity).findOne({
    where: {
      instagram: {
        pageId,
      },
      channel: CHANNEL.INSTAGRAM,
      isDelete: false,
    },
    relations: ['instagram'],
  })
}

export const saveChannel = async (channel: ChannelEntity) => {
  try {
    return await getRepository(ChannelEntity).save(channel)
  } catch (error) {
    errorMessage('MODEL', 'channel', 'saveChannel', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
