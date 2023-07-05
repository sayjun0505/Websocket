import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In } from 'typeorm'
import { OrganizationEntity, UserEntity } from '.'

export const getUsers = async () => {
  return await getRepository(UserEntity).find({
    where: {
      isDelete: false,
    },
  })
}

export const getUserWithId = async (id: string) => {
  try {
    return await getRepository(UserEntity).findOne({
      where: {
        id,
        isDelete: false,
      },
      // select: [
      //   'id',
      //   'firstname',
      //   'lastname',
      //   'display',
      //   'email',
      //   'status',
      //   'createdAt',
      //   'updatedAt',
      // ],
      relations: ['organizationUser'],
    })
  } catch (error) {
    errorMessage('MODEL', 'user', 'getUserWithId', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getUserWithGUID = async (guid: string) => {
  try {
    return await getRepository(UserEntity).findOne({
      where: {
        guid,
        isDelete: false,
      },
      // select: [
      //   'id',
      //   'firstname',
      //   'lastname',
      //   'display',
      //   'email',
      //   'status',
      //   'createdAt',
      //   'updatedAt',
      // ],
      relations: ['organizationUser'],
    })
  } catch (error) {
    errorMessage('MODEL', 'user', 'getUserWithGUID', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getUserWithEmail = async (email: string) => {
  try {
    return await getRepository(UserEntity).findOne({
      where: {
        email,
        isDelete: false,
      },
      // select: [
      //   'id',
      //   'firstname',
      //   'lastname',
      //   'display',
      //   'email',
      //   'status',
      //   'createdAt',
      //   'updatedAt',
      // ],
      relations: ['organizationUser'],
    })
  } catch (error) {
    errorMessage('MODEL', 'user', 'getUserWithEmail', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getUserWithEmailList = async (email: string[]) => {
  try {
    return await getRepository(UserEntity).find({
      where: {
        email: In(email),
        isDelete: false,
      },
      // select: [
      //   'id',
      //   'firstname',
      //   'lastname',
      //   'display',
      //   'email',
      //   'status',
      //   'createdAt',
      //   'updatedAt',
      // ],
      relations: ['organizationUser'],
    })
  } catch (error) {
    errorMessage('MODEL', 'user', 'getUserWithEmailList', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const saveUser = async (user: UserEntity) => {
  try {
    return await getRepository(UserEntity).save(user)
  } catch (error) {
    errorMessage('MODEL', 'user', 'saveUser', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const updateUserIsOnline = async (user: UserEntity) => {
  try {
    return await getRepository(UserEntity).update(
      {
        id: user.id,
        isDelete: false,
      },
      { isOnline: user.isOnline },
    )
  } catch (error) {
    errorMessage('MODEL', 'user', 'updateUserIsOnline', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
