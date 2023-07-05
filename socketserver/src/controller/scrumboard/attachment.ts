import { NextFunction, Request, Response } from 'express'
import { gcsService } from '../../service/google'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { OrganizationEntity, UserEntity } from '../../model/organization'

import {
    ScrumboardCardAttachmentEntity,
    ScrumboardCardAttachmentModel,
  ScrumboardLabelEntity,
  ScrumboardLabelModel
} from '../../model/scrumboard'

// export const getLabels = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const organization: OrganizationEntity = req.body.organization
//   const requester: UserEntity = req.body.requester
//   const { boardId } = req.params
//   if (!boardId) {
//     errorMessage('CONTROLLER', 'create cards', 'invalid data')
//     return next(new HttpException(400, ErrorCode[400]))
//   }
//   const rawLabels = await ScrumboardLabelModel.getLabelsWithBoardId(boardId)

//   return res
//     .status(201)
//     .send(rawLabels)
// }


export const sendFileAttachment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { boardId, cardId } = req.params
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  if (!cardId || !boardId) {
    errorMessage('CONTROLLER', 'card file attachment', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const content = req.file
  if (!content) {
    errorMessage('CONTROLLER', 'card file attachment', 'invalid file')
    return next(new HttpException(400, ErrorCode[400]))
  }
  try {
    const contentName = await gcsService.uploadCardAttachmentFromFileObject(
      organization.id,
      boardId,
      cardId,
      content.originalname,
      { data: content.buffer },
    )

    if (!contentName) {
      errorMessage('CONTROLLER', 'card file upload', 'fail upload file')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const url = gcsService.getCardAttachmentContentURL(
      organization.id,
      boardId,
      cardId,
      contentName,
    )

    // new Attachment
    const saveAttachment = await ScrumboardCardAttachmentModel.saveAttachment({
        ...new ScrumboardCardAttachmentEntity(),
        name: contentName,
        src: url,
        cardId,
        organization,
        createdBy: requester,
        time: Math.floor(new Date().getTime() / 1000)
      })

      return res.status(200).send({
        id: saveAttachment.id,
        name: saveAttachment.name,
        src: saveAttachment.src,
        time: saveAttachment.time,
        type: saveAttachment.type
      })
  } catch (error) {
    errorMessage('CONTROLLER', 'card file upload', 'uploadContent', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

// export const removeAttachmentFile = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const organization: OrganizationEntity = req.body.organization

//     const item = req.body.item

//     if (!item) {
//       errorMessage('CONTROLLER', 'delete attachment', 'invalid data')
//       return next(new HttpException(400, ErrorCode[400]))
//     }

//     const oldData = (await attachmentModel.getAttachmentWithId(
//       item.id,
//       organization,
//     )) as CardAttachmentEntity

//     if (!oldData) {
//       errorMessage('CONTROLLER', 'delete attachment', 'attachment not found')
//       return next(new HttpException(404, 'checklist not update'))
//     }

//     const result = await attachmentModel.deleteData(oldData.id)

//     return res.status(200).send(result)
//   } catch (error) {
//     errorMessage('CONTROLLER', 'delete attachment', 'delete attachment', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }