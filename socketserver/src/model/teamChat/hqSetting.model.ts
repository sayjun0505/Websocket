import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, MoreThan } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { TeamChatHQMessageEntity, TeamChatHQSettingEntity } from '.'

export const getHQSetting = async (userId: string, organizationId: string) => {
  try {
    return await getRepository(TeamChatHQSettingEntity).findOne({
      where: { userId, organizationId },
      order: { readAt: 'DESC' },
    })
  } catch (error) {
    errorMessage('MODEL', 'teamchat_hq_setting', 'getHQSetting', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const countHQMessageAfterDateTime = async (
  date: Date,
  organizationId: string,
) => {
  try {
    return await getRepository(TeamChatHQMessageEntity).count({
      where: {
        organizationId,
        createdAt: MoreThan(date),
      },
      order: { createdAt: 'DESC' },
    })
  } catch (error) {
    errorMessage(
      'MODEL',
      'teamchat_hq_setting',
      'countHQMessageAfterDateTime',
      error,
    )
    throw new HttpException(500, ErrorCode[500])
  }
}

export const markRead = async (userId: string, organizationId: string) => {
  try {
    const result = await getRepository(TeamChatHQSettingEntity).insert(
      { userId, organizationId, readAt: new Date() }
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'teamchat_hq_message', 'markRead', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
