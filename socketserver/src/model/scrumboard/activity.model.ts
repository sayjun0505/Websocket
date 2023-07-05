import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import {
  ScrumboardCardActivityEntity,
  ScrumboardCardChecklistEntity,
  ScrumboardLabelEntity,
} from '.'
import { UserEntity } from '../organization'

export const getActivities = async (cardId: string) => {
  try {
    return await getRepository(ScrumboardCardActivityEntity).find({
      cardId,
    })
  } catch (error) {
    errorMessage('MODEL', 'activities', 'getActivities', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const saveActivities = async (
  activities: ScrumboardCardActivityEntity[],
) => {
  try {
    return await getRepository(ScrumboardCardActivityEntity).save(activities)
  } catch (error) {
    errorMessage('MODEL', 'activities', 'saveActivities', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

// export const saveChecklist = async (
//   checklist: ScrumboardCardChecklistEntity,
// ) => {
//   try {
//     return await getRepository(ScrumboardCardChecklistEntity).save(checklist)
//   } catch (error) {
//     errorMessage('MODEL', 'checklist', 'saveChecklist', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }

// export const deleteChecklist = async (id: string) => {
//   try {
//     const result = await getRepository(ScrumboardCardChecklistEntity).update(
//       { id },
//       { isDelete: true },
//     )
//     return result
//   } catch (error) {
//     errorMessage('MODEL', 'checklist', 'deleteList', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }

// // export const deleteChecklist = async (id: string) => {
// //   try {
// //     return await getRepository(ScrumboardCardChecklistEntity).delete({ id })
// //   } catch (error) {
// //     errorMessage('MODEL', 'checklist', 'deleteChecklist', error)
// //     throw new HttpException(500, ErrorCode[500])
// //   }
// // }
