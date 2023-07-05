import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { ScrumboardCardChecklistEntity, ScrumboardLabelEntity } from '.'
import { UserEntity } from '../organization'

export const getChecklists = async (cardId: string) => {
  try {
    return await getRepository(ScrumboardCardChecklistEntity).find({
      cardId
    })
  } catch (error) {
    errorMessage('MODEL', 'checklists', 'getChecklists', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const saveChecklists = async (checklists: ScrumboardCardChecklistEntity[]) => {
  try {
    return await getRepository(ScrumboardCardChecklistEntity).save(checklists)
  } catch (error) {
    errorMessage('MODEL', 'checklists', 'saveChecklists', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const saveChecklist = async (checklist: ScrumboardCardChecklistEntity) => {
  try {
    return await getRepository(ScrumboardCardChecklistEntity).save(checklist)
  } catch (error) {
    errorMessage('MODEL', 'checklist', 'saveChecklist', error)
    throw new HttpException(500, ErrorCode[500])
  }
}



export const deleteChecklist = async (id: string) => {
  try {
    const result = await getRepository(ScrumboardCardChecklistEntity).update(
      { id },
      { isDelete: true },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'checklist', 'deleteList', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

// export const deleteChecklist = async (id: string) => {
//   try {
//     return await getRepository(ScrumboardCardChecklistEntity).delete({ id })
//   } catch (error) {
//     errorMessage('MODEL', 'checklist', 'deleteChecklist', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }
