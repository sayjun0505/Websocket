import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, Not } from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { ScrumboardListEntity } from '.'

export const getLists = async (boardId: string) => {
  return await getRepository(ScrumboardListEntity).find({
    where: {
      boardId,
      isDelete: false,
    },
    order: {
      orderIndex: 'ASC',
    },
    relations: [
      'createdBy',
      'organization',
      'listCustomerLabel',
      'listCustomerLabel.label',
      'cards',
      'listChat',
      'listChat.chat',
      'listChat.chat.customer',
    ],
  })
}

export const getListsAndCards = async (boardId: string) => {
  return await getRepository(ScrumboardListEntity).find({
    where: {
      boardId,
      isDelete: false,
    },
    order: {
      orderIndex: 'ASC',
    },
    relations: [
      'createdBy',
      'organization',
      'listCustomerLabel',
      'listCustomerLabel.label',
      'cards',
      'listChat',
      'listChat.chat',
      'listChat.chat.customer',
    ],
  })
}

export const getMaxOrderIndex = async (boardId: string) => {
  // const lists = await getlists(organization, board)
  // if (lists.length > 0) {
  //   return lists[lists.length - 1].orderIndex
  // } else {
  //   return -1
  // }
  return await getRepository(ScrumboardListEntity).count({
    where: {
      boardId,
      isDelete: false,
    },
  })
}

export const getListWithId = async (id: string) => {
  return await getRepository(ScrumboardListEntity).findOne({
    where: {
      id,
      isDelete: false,
    },
    order: {
      orderIndex: 'ASC',
    },
    relations: [
      'createdBy',
      'organization',
      'listCustomerLabel',
      'listCustomerLabel.label',
      'cards',
      'listChat',
      'listChat.chat',
    ],
  })
}

export const getListWithListId = async (listId: string) => {
  return await getRepository(ScrumboardListEntity).findOne({
    where: {
      listId,
      isDelete: false,
    },
    order: {
      orderIndex: 'ASC',
    },
    relations: [
      'createdBy',
      'organization',
      'listCustomerLabel',
      'listCustomerLabel.label',
      'cards',
      'listChat',
      'listChat.chat',
    ],
  })
}

export const saveList = async (list: ScrumboardListEntity) => {
  try {
    return await getRepository(ScrumboardListEntity).save(list)
  } catch (error) {
    errorMessage('MODEL', 'list', 'saveList', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const updateOrderIndex = async (
  listId: string,
  orderIndex: number,
  updatedBy: UserEntity,
) => {
  try {
    const result = await getRepository(ScrumboardListEntity).update(
      { id: listId },
      { orderIndex, updatedBy },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'list', 'updateList orderIndex', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteList = async (id: string, updatedBy: UserEntity) => {
  try {
    const result = await getRepository(ScrumboardListEntity).update(
      { id },
      { isDelete: true, updatedBy },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'list', 'deleteList', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

// export const updateListName = async (
//   listId: string,
//   listTitle: string,
//   chatType: string,
//   chatLabels: string,
// ) => {
//   try {
//     const result = await getRepository(ListEntity).update(
//       { id: listId },
//       { name: listTitle, chatType, chatLabels },
//     )
//     return result
//   } catch (error) {
//     errorMessage('MODEL', 'list', 'updateListName', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }

// export const updateListLabels = async (listId: string, chatLabels: string) => {
//   try {
//     const result = await getRepository(ListEntity).update(
//       { id: listId },
//       { chatLabels },
//     )
//     return result
//   } catch (error) {
//     errorMessage('MODEL', 'list', 'updateListLabels', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }

// export const updateListPageNumber = async (
//   listId: string,
//   pageNumber: number,
// ) => {
//   try {
//     const result = await getRepository(ListEntity).update(
//       { id: listId },
//       { pageNumber },
//     )
//     return result
//   } catch (error) {
//     errorMessage('MODEL', 'list', 'updateListLabels', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }

// export const updateOrderIndex = async (listId: string, orderIndex: number) => {
//   try {
//     const result = await getRepository(ListEntity).update(
//       { id: listId },
//       { orderIndex },
//     )
//     return result
//   } catch (error) {
//     errorMessage('MODEL', 'list', 'updateList orderIndex', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }
