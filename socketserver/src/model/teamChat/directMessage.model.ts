import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { TeamChatDirectMessageEntity } from '.'

export const getDirectMessage = async (
  sendUser: string,
  receiveUser: string,
  organization: OrganizationEntity,
) => {
  
  return await getRepository(TeamChatDirectMessageEntity).find({
    where: [
      {
        organization,
        sendUser,
        receiveUser,
      },
      {
        organization,
        sendUser: receiveUser,
        receiveUser: sendUser,
      },
    ],
    relations: ['receiveUser', 'sendUser'],
  })
}

// export const getDirectMessagesWithOrganizationId = async (
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(TeamChatDirectMessageEntity).find({
//     where: {
//         organization,
//       },
//       order: { createdAt: 'DESC' },
//   })
// }

export const getReplyDirectMessagesWithOrganizationId = async (
  organization: OrganizationEntity,
) => {
  return await getRepository(TeamChatDirectMessageEntity).find({
    where: {
        organization,
        isReply: true,
        isDelete: false,
      },
      order: { createdAt: 'DESC' },
  })
}

export const getDirectMessageWithMessageId = async (
  messageId: string,
) => {
  return await getRepository(TeamChatDirectMessageEntity).findOne({
    where: {
      id: messageId
    },
    relations: ['receiveUser', 'sendUser'],
  })
}
// export const getTeamChatsWithOrganization = async (
//   organization: OrganizationEntity,
//   channel: string,
// ) => {
//   return await getRepository(DirectMessageEntity).find({
//     where: {
//       organization,
//       channel,
//     },
//     relations: ['createdBy', 'updatedBy', 'channel'],
//   })
// }

export const saveDirectMessage = async (dm: TeamChatDirectMessageEntity) => {
  try {
    return await getRepository(TeamChatDirectMessageEntity).save(dm)
  } catch (error) {
    errorMessage('MODEL', 'teamchat_direct_message', 'saveDirectMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const markReadMessageList = async (messages: TeamChatDirectMessageEntity[]) => {
  try {
    const isReadList = await messages.map((item) => ({ ...item, isRead: true }))
    return await getRepository(TeamChatDirectMessageEntity).save(isReadList)
  } catch (error) {
    errorMessage('MODEL', 'teamchat_channel_message', 'markReadMessageList', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const isPinMessage = async ({ id, isPin }: any) => {
  try {
    const result = await getRepository(TeamChatDirectMessageEntity).update(
      { id },
      { isPin },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'message', 'isPinMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const isDeleteMessage = async ({ id, data, isDelete }: any) => {
  try {
    const result = await getRepository(TeamChatDirectMessageEntity).update(
      { id },
      { data, isDelete },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'message', 'isDeleteMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const isEditMessage = async ({ id, data, isEdit }: any) => {
  try {
    const result = await getRepository(TeamChatDirectMessageEntity).update(
      { id },
      { data, isEdit },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'message', 'isEditMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const isReplyMessage = async ({ id, isReply }: any) => {
  try {
    const result = await getRepository(TeamChatDirectMessageEntity).update(
      { id },
      { isReply },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'message', 'isReplyMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}