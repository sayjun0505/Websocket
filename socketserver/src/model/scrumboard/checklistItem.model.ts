import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { ScrumboardCardChecklistItemEntity, ScrumboardLabelEntity } from '.'
import { UserEntity } from '../organization'

export const getChecklistItems = async (checklistId: string) => {
  try {
    return await getRepository(ScrumboardCardChecklistItemEntity).find({
      checklistId,
    })
  } catch (error) {
    errorMessage('MODEL', 'checklistItem', 'getChecklistItems', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const saveChecklistItem = async (
  checklistItem: ScrumboardCardChecklistItemEntity,
) => {
  try {
    return await getRepository(ScrumboardCardChecklistItemEntity).save(
      checklistItem,
    )
  } catch (error) {
    errorMessage('MODEL', 'checklistItem', 'saveChecklistItem', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const saveChecklistItems = async (
  checklistItems: ScrumboardCardChecklistItemEntity[],
) => {
  try {
    return await getRepository(ScrumboardCardChecklistItemEntity).save(
      checklistItems,
    )
  } catch (error) {
    errorMessage('MODEL', 'checklistItems', 'saveChecklistItems', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

// export const updateChecklistItem = async (
//   id: string,
//   name: string,
//   checked: boolean,
//   updatedBy: UserEntity,
// ) => {
//   try {
//     const result = await getRepository(
//       ScrumboardCardChecklistItemEntity,
//     ).update({ id }, { name, checked, updatedBy })
//     return result
//   } catch (error) {
//     errorMessage('MODEL', 'checklistItem', 'updateChecklistItemStatus', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }

export const deleteChecklistItem = async (id: string) => {
  try {
    const result = await getRepository(
      ScrumboardCardChecklistItemEntity,
    ).update({ id }, { isDelete: true })
    return result
  } catch (error) {
    errorMessage('MODEL', 'checklistItem', 'deleteListItem', error)
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
