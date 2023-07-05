import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'
import { ScrumboardLabelEntity } from '.'

export const getLabelsWithBoardId = async (boardId: string) => {
  return await getRepository(ScrumboardLabelEntity).find({
    where: {
      boardId,
    },
  })
}

export const saveLabel = async (label: ScrumboardLabelEntity) => {
  try {
    return await getRepository(ScrumboardLabelEntity).save(label)
  } catch (error) {
    errorMessage('MODEL', 'board label', 'saveLabel', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteLabels = async (boardId: string) => {
  try {
    return await getRepository(ScrumboardLabelEntity).delete({ boardId })
  } catch (error) {
    errorMessage('MODEL', 'board label', 'deleteLabels', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
