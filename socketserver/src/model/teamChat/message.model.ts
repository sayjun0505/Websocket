import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity } from '../organization'
import { TeamChatChannelMessageEntity } from '.'

export const getMessagesWithChannelId = async (
  channelId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TeamChatChannelMessageEntity).find({
    where: {
      channel: {
        id: channelId,
      },
      organization,
    },
    relations: ['createdBy', 'updatedBy'],
  })
}

// export const getChannelMessagesWithOrganization = async (
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(TeamChatChannelMessageEntity).find({
//     where: {
//       organization,
//     },
//     relations: ['createdBy', 'updatedBy', 'channel'],
//     order: { createdAt: 'DESC' },
//   })
// }

export const getReplyChannelMessagesWithOrganization = async (
  organization: OrganizationEntity,
) => {
  return await getRepository(TeamChatChannelMessageEntity).find({
    where: {
      organization,
      isReply: true,
      isDelete: false,
    },
    order: { createdAt: 'DESC' },
  })
}

export const getChannelMessagesWithMessageId = async (
  messageId: string,
) => {
  return await getRepository(TeamChatChannelMessageEntity).findOne({
    where: {
      id: messageId,
    },
    relations: ['channel', 'createdBy', 'updatedBy'],
  })
}

export const saveMessage = async (message: TeamChatChannelMessageEntity) => {
  try {
    return await getRepository(TeamChatChannelMessageEntity).save(message)
  } catch (error) {
    errorMessage('MODEL', 'teamchat_channel_message', 'saveMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const isPinMessage = async ({ id, isPin }: any) => {
  try {
    const result = await getRepository(TeamChatChannelMessageEntity).update(
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
    const result = await getRepository(TeamChatChannelMessageEntity).update(
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
    const result = await getRepository(TeamChatChannelMessageEntity).update(
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
    const result = await getRepository(TeamChatChannelMessageEntity).update(
      { id },
      { isReply },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'message', 'isReplyMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

// export const getTeamChats = async (organization: OrganizationEntity) => {
//   return await getRepository(TeamChatEntity).find({
//     where: {
//       organization,
//     },
//     relations: ['createdBy', 'updatedBy'],
//   })
// }

// export const getTeamChatsWithChatId = async (
//   chatId: string,
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(TeamChatEntity).find({
//     where: {
//       chat: {
//         id: chatId,
//       },
//       organization,
//     },
//     relations: ['createdBy', 'updatedBy', 'channel'],
//   })
// }


// export const saveTeamChat = async (teamChat: TeamChatEntity) => {
//   try {
//     return await getRepository(TeamChatEntity).save(teamChat)
//   } catch (error) {
//     errorMessage('MODEL', 'teamChat', 'saveTeamChat', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }
