import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, Not } from 'typeorm'
import { OrganizationEntity, UserEntity } from '../organization'
import { MessageEntity } from '.'
import { MESSAGE_TYPE } from './message.entity'

export const getMessages = async (
  chatId: string,
  organizationId: string,
  page: number,
  size: number,
) => {
  if (page !== 0 && size !== 0) {
    return await getRepository(MessageEntity).findAndCount({
      where: {
        chatId,
        organizationId,
        type: Not(MESSAGE_TYPE.STORY),
      },
      select: [
        'id',
        'data',
        'type',
        'isRead',
        'isDelete',
        'direction',
        'createdAt',
        'createdBy',
        'reaction',
        'replyTo',
      ],
      relations: ['createdBy', 'replyTo'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * size,
      take: size,
    })
  } else {
    return await getRepository(MessageEntity).findAndCount({
      where: {
        chatId,
        organizationId,
        type: Not(MESSAGE_TYPE.STORY),
      },
      select: [
        'id',
        'data',
        'type',
        'isRead',
        'direction',
        'createdAt',
        'createdBy',
        'reaction',
      ],
      relations: ['createdBy', 'replyTo'],
      order: { createdAt: 'ASC' },
    })
  }
}

export const getMessageWithMID = async (
  mid: string,
  chatId: string,
  organizationId: string,
) => {
  return await getRepository(MessageEntity).findOne({
    where: {
      mid,
      chatId,
      organizationId,
    },
    select: ['id'],
  })
}

export const saveMessage = async (message: MessageEntity) => {
  try {
    return await getRepository(MessageEntity).save(message)
  } catch (error) {
    errorMessage('MODEL', 'message', 'saveMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const markReadMessageList = async (messages: MessageEntity[]) => {
  try {
    const isReadList = await messages.map((item) => ({ ...item, isRead: true }))
    return await getRepository(MessageEntity).save(isReadList)
  } catch (error) {
    errorMessage('MODEL', 'message', 'markReadMessageList', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const markReadWithMessageIds = async (
  messageIds: string[],
  updatedBy: UserEntity,
) => {
  try {
    return await Promise.all(
      messageIds.map((messageId) => {
        return getRepository(MessageEntity).update(
          { id: messageId },
          { isRead: true, updatedBy },
        )
      }),
    )
  } catch (error) {
    errorMessage('MODEL', 'message', 'markReadWithMessageIds', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const reactMessage = async (
  mid: string,
  reaction: { reaction: string; emoji: string },
) => {
  try {
    return await getRepository(MessageEntity).update({ mid }, { reaction })
  } catch (error) {
    errorMessage('MODEL', 'message', 'reactMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const unReactMessage = async (mid: string) => {
  try {
    return await getRepository(MessageEntity).update(
      { mid },
      { reaction: undefined },
    )
  } catch (error) {
    errorMessage('MODEL', 'message', 'reactMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const unSendMessage = async (mid: string) => {
  try {
    return await getRepository(MessageEntity).update(
      { mid },
      { isDelete: true, data: '' },
    )
  } catch (error) {
    errorMessage('MODEL', 'message', 'reactMessage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
