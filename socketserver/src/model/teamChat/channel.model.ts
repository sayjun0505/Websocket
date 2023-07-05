import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In, Not } from 'typeorm'
import { OrganizationEntity, TeamEntity, UserEntity } from '../organization'
import { TeamChatChannelEntity, TeamChatChannelMemberEntity } from '.'

export const getChannels = async (organization: OrganizationEntity) => {
  // return await getRepository(TeamChatChannelEntity).query(
  // `SELECT aa.* FROM team_chat_channel as aa LEFT JOIN channel_member bb ON aa.id = bb.\"channelId\"
  // where bb.\"member\" = '${id}' and aa.\"organizationId\" = '${organization.id}' and bb.is_delete = false`,
  // )
  return await getRepository(TeamChatChannelEntity).find({
    where: {
      organization,
      isDelete: false,
    },
  })
}

export const getPublicChannels = async (organization: OrganizationEntity) => {
  // return await getRepository(TeamChatChannelEntity).query(
  // `SELECT aa.* FROM team_chat_channel as aa LEFT JOIN channel_member bb ON aa.id = bb.\"channelId\"
  // where bb.\"member\" = '${id}' and aa.\"organizationId\" = '${organization.id}' and bb.is_delete = false`,
  // )
  return await getRepository(TeamChatChannelEntity).find({
    where: {
      organization,
      isDelete: false,
      isPublic: true,
    },
    relations: ['messages'],
  })
}

export const getChannelWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TeamChatChannelEntity).findOne({
    where: {
      id,
      isDelete: false,
      organization,
    },
    select: [
      'id',
      'name',
      'description',
      'members',
      'messages',
      'createdBy',
      'isPublic',
    ],
    relations: ['messages', 'messages.createdBy', 'createdBy'],
  })
}

export const getChannelWithName = async (
  name: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TeamChatChannelEntity).findOne({
    where: {
      name,
      isDelete: false,
      organization,
    },
  })
}

export const saveChannel = async (channel: TeamChatChannelEntity) => {
  try {
    return await getRepository(TeamChatChannelEntity).save(channel)
  } catch (error) {
    errorMessage('MODEL', 'teamchat_channel', 'saveChannel', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteChannels = async (id: string) => {
  return await getRepository(TeamChatChannelEntity).delete(id)
}

// For Notification
export const getTeamchatChannelForNotification = async (id: string) => {
  return await getRepository(TeamChatChannelEntity).findOne({
    where: {
      id,
      isDelete: false,
    },
    select: ['id', 'name'],
  })
}
