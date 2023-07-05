import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { TeamChatThreadMemberEntity } from './'

export const getThreadMemberIds = async (
  threadId: string,
  organizationId: string,
) => {
  return await getRepository(TeamChatThreadMemberEntity).find({
    where: {
      threadId,
      organizationId,
    },
    select: ['memberId'],
  })
}

export const saveThreadMembers = async (
  threadMembers: TeamChatThreadMemberEntity[],
) => {
  try {
    return await getRepository(TeamChatThreadMemberEntity).save(threadMembers)
  } catch (error) {
    errorMessage('MODEL', 'teamchat_thread_member', 'saveThreadMembers', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
