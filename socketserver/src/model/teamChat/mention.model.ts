import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, MoreThan } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { TeamChatMentionEntity, TeamChatChannelMessageEntity } from '.'

export const getChannelReadLastest = async (userId: string, channelId: string, organization: OrganizationEntity ) => {
  return await getRepository(TeamChatMentionEntity).findOne({
    where: {
      userId, channelId, organization
    },
    order: { readAt: 'DESC' },
  })
}

export const countChannelReadAfterDateTime = async (
  date: Date,
  channelId: string,
  organization: OrganizationEntity
) => {
  return await getRepository(TeamChatChannelMessageEntity).count({
    where: {
      createdAt: MoreThan(date),
      channelId,
      organization
    },
    order: { createdAt: 'DESC' },
  })
}

export const markRead = async (userId: string, channelId: string, organization: OrganizationEntity) => {
  try {
    const result = await getRepository(TeamChatMentionEntity).insert(
      { userId, channelId, organization, readAt: new Date() }
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'teamchat_channel_message', 'markRead', error)
    throw new HttpException(500, ErrorCode[500])
  }
}