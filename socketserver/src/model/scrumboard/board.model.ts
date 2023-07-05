import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { ScrumboardBoardEntity } from '.'

export const getBoards = async (organization: OrganizationEntity) => {
  return await getRepository(ScrumboardBoardEntity).find({
    where: {
      organization,
      isDelete: false,
    },
    order: {
      createdAt: 'DESC',
    },
    relations: ['boardMembers', 'boardMembers.member'], // 'cards', 'members', 'labels'
  })
}

export const getBoardWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ScrumboardBoardEntity).findOne({
    where: {
      id,
      organization,
      isDelete: false,
      // lists:{isDelete:false}
    },
    relations: [
      // 'lists',
      // 'lists.cards',
      // 'lists.listChat',
      // 'lists.listChat.chat',
      // 'lists.listChat.chat.customer',
      // 'lists.createdBy',
      'organization',
      'boardMembers',
      'boardMembers.member',
    ], // 'cards', 'members', 'labels'
  })
}

// export const getActivitiesWithChatId = async (
//   chatId: string,
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(BoardEntity).find({
//     where: {
//       chat: {
//         id: chatId,
//       },
//       organization,
//     },
//     relations: ['createdBy', 'updatedBy'],
//   })
// }

export const saveBoard = async (board: ScrumboardBoardEntity) => {
  try {
    const result = await getRepository(ScrumboardBoardEntity).save(board)
    return result
  } catch (error) {
    errorMessage('MODEL', 'board', 'saveBoard', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteBoard = async (id: string, updatedBy: UserEntity) => {
  try {
    const result = await getRepository(ScrumboardBoardEntity).update(
      { id },
      { isDelete: true, updatedBy },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'board', 'deleteData', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

//////////////////////////////////////////////

// export const updateBoardName = async (
//   boardId: string,
//   boardName: string,
//   updatedBy: UserEntity,
// ) => {
//   try {
//     const result = await getRepository(ScrumboardBoardEntity).update(
//       { id: boardId },
//       { title: boardName, updatedBy },
//     )
//     return result
//   } catch (error) {
//     errorMessage('MODEL', 'board', 'updateBoardName', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }

// export const updateBoardSetting = async (
//   boardId: string,
//   settings: {},
//   updatedBy: UserEntity,
// ) => {
//   try {
//     const result = await getRepository(BoardEntity).update(
//       { id: boardId },
//       { settings, updatedBy },
//     )
//     return result
//   } catch (error) {
//     errorMessage('MODEL', 'board', 'updateBoardSetting', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }
