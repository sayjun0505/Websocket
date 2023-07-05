import {
    ErrorCode,
    errorMessage,
    HttpException,
  } from '../../middleware/exceptions'
  import { getRepository, MoreThan } from 'typeorm'
  import { OrganizationEntity } from '../organization'
  import { TeamChatDmSettingEntity, TeamChatDirectMessageEntity } from '.'
  
  export const getDmLastest = async (userId: string, receiveUserId: string, organizationId: string) => {
    try {
      return await getRepository(TeamChatDmSettingEntity).findOne({
        where: { userId, receiveUserId, organizationId },
        order: { readAt: 'DESC' },
      })
    } catch (error) {
      errorMessage('MODEL', 'teamchat_hq_setting', 'getHQSetting', error)
      throw new HttpException(500, ErrorCode[500])
    }
  }

  export const countDmMessageAfterDateTime = async (
    date: Date,
    sendUser: string,
    receiveUser: string,
    organization: OrganizationEntity,
  ) => {
    try {
      return await getRepository(TeamChatDirectMessageEntity).count({
        where: 
          // {
          //   organization,
          //   sendUser,
          //   receiveUser,
          //   createdAt: MoreThan(date),
          // },
          {
            organization,
            sendUser: receiveUser,
            receiveUser: sendUser,
            createdAt: MoreThan(date),
          },
        
        // where: [
        //   {
        //     organization,
        //     sendUser,
        //     receiveUser,
        //     createdAt: MoreThan(date),
        //   },
        //   {
        //     organization,
        //     sendUser: receiveUser,
        //     receiveUser: sendUser,
        //     createdAt: MoreThan(date),
        //   },
        // ],
        order: { createdAt: 'DESC' },
      })
    } catch (error) {
      errorMessage(
        'MODEL',
        'teamchat_dm_setting',
        'countDmMessageAfterDateTime',
        error,
      )
      throw new HttpException(500, ErrorCode[500])
    }
  }
  
  export const markRead = async (userId: string, receiveUserId: string, organizationId: string) => {
    try {
      const result = await getRepository(TeamChatDmSettingEntity).insert(
        { userId, receiveUserId, organizationId, readAt: new Date() }
      )
      return result
    } catch (error) {
      errorMessage('MODEL', 'teamchat_hq_message', 'markRead', error)
      throw new HttpException(500, ErrorCode[500])
    }
  }
  
  export const getTotalDmSetting = async (userId: string, organizationId: string) => {
    try {
      return await getRepository(TeamChatDmSettingEntity).findOne({
        where: { userId, organizationId },
        order: { readAt: 'DESC' },
      })
    } catch (error) {
      errorMessage('MODEL', 'teamchat_hq_setting', 'getHQSetting', error)
      throw new HttpException(500, ErrorCode[500])
    }
  }

  export const countTotalDmMessageAfterDateTime = async (
    date: Date,
    // sendUser: string,
    receiveUser: string,
    organization: string,
  ) => {
    try {
      return await getRepository(TeamChatDirectMessageEntity).count({
        where: 
          {
              organization,
              // sendUser,
              receiveUser,
              createdAt: MoreThan(date),
          },
       
        order: { createdAt: 'DESC' },
      })
    } catch (error) {
      errorMessage(
        'MODEL',
        'teamchat_dm_setting',
        'countDmMessageAfterDateTime',
        error,
      )
      throw new HttpException(500, ErrorCode[500])
    }
  }