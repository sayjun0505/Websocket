import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { ScrumboardCardLabelEntity, ScrumboardListChatEntity } from '.'


export const deleteCardLabels = async (cardId: string) => {
  return await getRepository(ScrumboardCardLabelEntity).delete({
    cardId,
  })
}

export const saveCardLabels = async (labels: ScrumboardCardLabelEntity[]) => {
  try {
    return await getRepository(ScrumboardCardLabelEntity).save(labels)
  } catch (error) {
    errorMessage('MODEL', 'card label', 'saveCardLabels', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
