import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { ScrumboardCardAttachmentEntity } from '.'

export const getAttachments = async (cardId: string) => {
  return await getRepository(ScrumboardCardAttachmentEntity).find({
    where: {
      cardId,
    },
  })
}

export const saveAttachment = async (
  attachment: ScrumboardCardAttachmentEntity,
) => {
  try {
    return await getRepository(ScrumboardCardAttachmentEntity).save(attachment)
  } catch (error) {
    errorMessage('MODEL', 'attachment', 'saveAttachment', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteAttachment = async (id: string) => {
    try {
      const result = await getRepository(ScrumboardCardAttachmentEntity).update(
        { id },
        { isDelete: true },
      )
      return result
    } catch (error) {
      errorMessage('MODEL', 'attachment', 'deleteAttachment', error)
      throw new HttpException(500, ErrorCode[500])
    }
  }

// export const getAttachmentWithId = async (
//   id: string,
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(CardAttachmentEntity).findOne({
//     where: {
//       id,
//       organization,
//     },
//   })
// }

// export const getAttachmentWithCard = async (
//   card: CardEntity,
//   organization: OrganizationEntity,
// ) => {
//   return await getRepository(CardAttachmentEntity).find({
//     where: {
//       card,
//       organization,
//     },
//   })
// }

// export const saveAttachment = async (attachment: CardAttachmentEntity) => {
//   try {
//     return await getRepository(CardAttachmentEntity).save(attachment)
//   } catch (error) {
//     errorMessage('MODEL', 'attachment', 'saveAttachment', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }

// export const deleteData = async (id: string) => {
//   try {
//     return await getRepository(CardAttachmentEntity).delete({ id })
//   } catch (error) {
//     errorMessage('MODEL', 'CardAttachmentEntity delete', 'deleteData', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }

// export const deleteDataWithCard = async (card: CardEntity) => {
//   try {
//     return await getRepository(CardAttachmentEntity).delete({ card })
//   } catch (error) {
//     errorMessage('MODEL', 'CardAttachmentEntity delete', 'deleteData', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }
