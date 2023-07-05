import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, Not } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '../organization'
import { TeamChatChannelMemberEntity } from './channelMember.entity'
import { UserEntity } from '../organization/user.entity'

export const getChannelMembers = async (channelId: string) => {
  // return await getRepository(ChannelMemberEntity).query(
  //   `select aa.*,bb.id as user_id ,bb.picture,bb.display
  //   from channel_member as aa LEFT JOIN \"user\" as bb ON \"member\" = bb.\"id\"
  //   where aa.\"channelId\" = '${channelId}' and aa.is_delete is false`,
  // )
  return await getRepository(TeamChatChannelMemberEntity).find({
    where: {
      channelId,
    },
    relations: ['member'],
  })
}

export const getChannelsWithMember = async (
  memberId: string,
  organization: OrganizationEntity,
) => {
  // return await getRepository(TeamChatChannelEntity).query(
  // `SELECT aa.* FROM team_chat_channel as aa LEFT JOIN channel_member bb ON aa.id = bb.\"channelId\"
  // where bb.\"member\" = '${id}' and aa.\"organizationId\" = '${organization.id}' and bb.is_delete = false`,
  // )
  // const channelMember = await getRepository(TeamChatChannelMemberEntity).find({
  //   where: {
  //     memberId,
  //     channel: {
  //       organization,
  //       isDelete: false,
  //     },
  //   },
  //   relations: ['channel'],
  // })
  // if (!channelMember || channelMember.length < 1) return []
  // const channelIdList = channelMember.map((element) => element.channel.id)
  // return await getRepository(TeamChatChannelEntity).find({
  //   where: {
  //     id: In(channelIdList),
  //   },
  //   relations: ['createdBy', 'updatedBy'],
  // })

  return await getRepository(TeamChatChannelMemberEntity).find({
    where: {
      memberId,
      channel: {
        organization,
        isDelete: false,
      },
    },
    relations: ['channel', 'channel.messages'],
  })
}

export const saveMembers = async (channel: TeamChatChannelMemberEntity[]) => {
  try {
    return await getRepository(TeamChatChannelMemberEntity).save(channel)
  } catch (error) {
    errorMessage('MODEL', 'teamchat_channel_member', 'saveMembers', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteChannelMemberWithId = async (id: string) => {
  /* Updating the channel_member table with is_delete = true where id = id. */
  // return await getRepository(ChannelMemberEntity).query(
  //   `update channel_member set is_delete = true  where id='${id}'`,
  // )
  return await getRepository(TeamChatChannelMemberEntity).delete(id)
}
