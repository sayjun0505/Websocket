import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { ScrumboardCardMemberEntity} from '.'

export const getCardMembers = async (cardId: string) => {
  return await getRepository(ScrumboardCardMemberEntity).find({
    cardId
  })
}
export const deleteCardMember = async (id: string) => {
  return await getRepository(ScrumboardCardMemberEntity).delete(id)
}


export const saveCardMember = async (member: ScrumboardCardMemberEntity) => {
  try {
    return await getRepository(ScrumboardCardMemberEntity).save(member)
  } catch (error) {
    errorMessage('MODEL', 'card member', 'saveCardMembers', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteCardMembers = async (cardId: string) => {
  return await getRepository(ScrumboardCardMemberEntity).delete({
    cardId,
  })
}

export const saveCardMembers = async (members: ScrumboardCardMemberEntity[]) => {
  try {
    return await getRepository(ScrumboardCardMemberEntity).save(members)
  } catch (error) {
    errorMessage('MODEL', 'card member', 'saveCardMembers', error)
    throw new HttpException(500, ErrorCode[500])
  }
}