import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, Not } from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { ScrumboardCardEntity } from '.'
import { ChatEntity } from '../chat/chat.entity'

export const getCards = async (boardId: string) => {
  return await getRepository(ScrumboardCardEntity).find({
    where: {
      boardId,
      isDelete: false,
      chatId: null,
    },
    order: {
      orderIndex: 'ASC',
    },
    relations: [
      'attachments',
      'cardMembers',
      'cardLabels',
      'checklists',
      'checklists.checkItems',
      'activities',
      // 'chat',
      // 'chat.customer',
      // 'chat.message',
      // 'chat.channel',
      // 'chat.mention',
      // 'chat.mention.user',
      // 'chat.customer.customerLabel',
      // 'chat.channel.line',
      // 'chat.channel.facebook',
    ],
  })
}

export const getCardsWithListId = async (listId: string) => {
  return await getRepository(ScrumboardCardEntity).find({
    where: {
      listId,
      isDelete: false,
    },
    order: {
      orderIndex: 'ASC',
    },
    relations: [
      // 'createdBy',
      // 'updatedBy',
      'attachments',
      'cardMembers',
      'cardLabels',
      'checklists',
      'checklists.checkItems',
      'activities',
      // 'chat',
      // 'chat.customer',
      // 'chat.message',
      // 'chat.channel',
      // 'chat.mention',
      // 'chat.mention.user',
      // 'chat.customer.customerLabel',
      // 'chat.channel.line',
      // 'chat.channel.facebook',
    ],
  })
}

export const getMaxOrderIndex = async (listId: string) => {
  return await getRepository(ScrumboardCardEntity).count({
    where: {
      listId,
      isDelete: false,
    },
  })
}

export const getCardWithId = async (id: string) => {
  return await getRepository(ScrumboardCardEntity).findOne({
    where: {
      id,
      isDelete: false,
    },
    relations: [
      // 'createdBy',
      // 'updatedBy',
      'attachments',
      'cardMembers',
      'cardLabels',
      'checklists',
      'checklists.checkItems',
      'activities',
    ],
  })
}

export const saveCard = async (card: ScrumboardCardEntity) => {
  try {
    return await getRepository(ScrumboardCardEntity).save(card)
  } catch (error) {
    errorMessage('MODEL', 'card', 'saveCard', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const saveCards = async (cards: ScrumboardCardEntity[]) => {
  try {
    return await getRepository(ScrumboardCardEntity).save(cards)
  } catch (error) {
    errorMessage('MODEL', 'card', 'saveCards', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const updateOrderIndex = async (
  cardId: string,
  listId: string,
  orderIndex: number,
  updatedBy: UserEntity,
) => {
  try {
    const result = await getRepository(ScrumboardCardEntity).update(
      { id: cardId },
      { orderIndex, updatedBy, listId },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'card', 'updateCard orderIndex', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteCard = async (id: string, updatedBy: UserEntity) => {
  try {
    const result = await getRepository(ScrumboardCardEntity).update(
      { id },
      { isDelete: true, updatedBy },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'card', 'deleteCard', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

/**
 * External services
 */
export const getCardWithChatId = async (chatId: string) => {
  return await getRepository(ScrumboardCardEntity).findOne({
    where: {
      chatId,
      isDelete: false,
    },
    relations: [
      'attachments',
      'cardMembers',
      'cardLabels',
      'checklists',
      'checklists.checkItems',
      'activities',
    ],
  })
}

export const getChat = async (
  chatId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(ChatEntity).findOne({
    where: {
      id: chatId,
      organization,
    },
    relations: [
      'customer',
      'message',
      'channel',
      'mention',
      'mention.user',
      'customer.customerLabel',
      'channel.line',
      'channel.facebook',
    ],
  })
}

export const getLastCard = async (boardId: string) => {
  return await getRepository(ScrumboardCardEntity).findOne({
    where: {
      boardId,
      isDelete: false,
      chatId: null,
    },
    order: {
      orderIndex: 'DESC',
    },
    relations: [
      'board',
    ],
  })
}

// export const updateOrderIndex = async (
//   id: string,
//   orderIndex: number,
// ) => {
//   try {
//     const result = await getRepository(ScrumboardCardEntity).update(
//       { id: cardId },
//       { orderIndex, list },
//     )
//     return result
//   } catch (error) {
//     errorMessage('MODEL', 'card', 'updateOrderIndex', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }

// export const getCardWithDelete = async (
//   id: string,
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(CardEntity).findOne({
//     relations: [
//       'activities',
//       'attachments',
//       'checklists',
//       'checklists.checkItems',
//     ],
//     where: {
//       id,
//       organization,
//     },
//     order: {
//       createdAt: 'DESC',
//     },
//   })
// }

// export const getCardWithChatId = async (
//   chatId: string,
//   list: ListEntity,
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(CardEntity).findOne({
//     where: {
//       chatId,
//       list,
//       organization,
//       // isDelete: false,
//     },
//     order: {
//       createdAt: 'DESC',
//     },
//     relations: [
//       'list',
//       'activities',
//       'attachments',
//       'checklists',
//       'checklists.checkItems',
//     ],
//   })
// }

// export const getCardWithIdUnRelation = async (
//   id: string,
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(CardEntity).findOne({
//     where: {
//       id,
//       organization,
//     },
//   })
// }

// export const getMaxOrderIndex = async (
//   list: ListEntity,
//   organization: OrganizationEntity,
// ) => {
//   const cards = (await getCardsWithListId(list, organization)) as CardEntity[]
//   if (cards.length > 0) {
//     return cards[cards.length - 1].orderIndex
//   }
//   return -1
// }

// export const getCardWithBoard = async (
//   board: BoardEntity,
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(CardEntity).find({
//     relations: [
//       'activities',
//       'attachments',
//       'checklists',
//       'checklists.checkItems',
//       'createdBy',
//       'list',
//     ],
//     where: {
//       board,
//       organization,
//       isDelete: false,
//     },
//     order: {
//       createdAt: 'DESC',
//     },
//   })
// }

// export const getCardsWithListId = async (
//   list: ListEntity,
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(CardEntity).find({
//     where: {
//       list,
//       organization,
//       isDelete: false,
//     },
//     order: {
//       orderIndex: 'ASC',
//       createdAt: 'DESC',
//     },
//     relations: [
//       'list',
//       'activities',
//       'attachments',
//       'checklists',
//       'checklists.checkItems',
//     ],
//   })
// }

// export const getChatCardsWithList = async (
//   list: ListEntity,
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(CardEntity).find({
//     where: {
//       list,
//       chatId: Not(''),
//       organization,
//     },
//     order: {
//       orderIndex: 'ASC',
//       createdAt: 'DESC',
//     },
//     relations: ['list'],
//   })
// }

// export const getCardsWithUserId = async (
//   userId: string,
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(CardEntity).find({
//     where: {
//       user: {
//         id: userId,
//       },
//       organization,
//     },
//     order: {
//       orderIndex: 'ASC',
//       createdAt: 'DESC',
//     },
//     relations: ['createdBy', 'updatedBy'],
//   })
// }

// export const saveCard = async (card: CardEntity) => {
//   try {
//     return await getRepository(CardEntity).save(card)
//   } catch (error) {
//     errorMessage('MODEL', 'card', 'saveCard', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }

// export const deleteCard = async (id: string, deleteFlg: boolean) => {
//   try {
//     if (deleteFlg) {
//       return await getRepository(CardEntity).delete({ id })
//     }
//     return await getRepository(CardEntity).save({ id, isDelete: true })
//   } catch (error) {
//     errorMessage('MODEL', 'card delete', 'deleteCard', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }
