import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { ScrumboardListChatEntity } from '.'

export const getListChats = async (boardId: string) => {
  return await getRepository(ScrumboardListChatEntity).find({
    where: {
      boardId,
    },
  })
}

export const getListChatWithId = async (
  id: string,
) => {
  return await getRepository(ScrumboardListChatEntity).findOne({
    where: {
      id
    },
  })
}

export const getListChatWithListIdChatId = async (
  listId: string,
  chatId: string,
) => {
  return await getRepository(ScrumboardListChatEntity).findOne({
    where: {
      listId,
      chatId,
    },
  })
}

export const getListChatWithListId = async (listId: string) => {
  return await getRepository(ScrumboardListChatEntity).find({
    where: {
      listId,
    },
  })
}

export const getCountListChatWithListId = async (listId: string) => {
  return await getRepository(ScrumboardListChatEntity).count({
    where: {
      listId,
    },
  })
}

export const getListChatWithBoardIdListIdChatId = async (
  boardId: string,
  listId: string,
  chatId: string,
) => {
  return await getRepository(ScrumboardListChatEntity).findOne({
    where: {
      boardId,
      listId,
      chatId,
    },
  })
}

export const deleteListChatsWithBoardId = async (boardId: string) => {
  return await getRepository(ScrumboardListChatEntity).delete({
    boardId,
  })
}

export const deleteListChats = async (listId: string) => {
  return await getRepository(ScrumboardListChatEntity).delete({
    listId,
  })
}

export const saveListChats = async (labels: ScrumboardListChatEntity[]) => {
  try {
    return await getRepository(ScrumboardListChatEntity).save(labels)
  } catch (error) {
    errorMessage('MODEL', 'chat label', 'saveCustomerLabels', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const saveListChat = async (listChat: ScrumboardListChatEntity) => {
  try {
    return await getRepository(ScrumboardListChatEntity).save(listChat)
  } catch (error) {
    errorMessage('MODEL', 'chat label', 'saveCustomerLabel', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const updateOrderIndex = async (
  cardId: string,
  listId: string,
  orderIndex: number,
) => {
  try {
    const result = await getRepository(ScrumboardListChatEntity).update(
      { id: cardId },
      { orderIndex, listId },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'card', 'updateCard orderIndex', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
