import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, In } from 'typeorm'
import { OrganizationEntity, OrganizationUserEntity, UserEntity } from './'

export const getOrganizationUser = async (
  organizationId: string,
  userId: string,
) => {
  try {
    return await getRepository(OrganizationUserEntity).findOne({
      where: { organizationId, userId },
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getOrganizationUser', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const saveOrganizationUser = async (
  organizationUser: OrganizationUserEntity,
) => {
  try {
    return await getRepository(OrganizationUserEntity).save(organizationUser)
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'saveOrganizationUser', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const deleteOrganizationUser = async (id: string) => {
  try {
    return await getRepository(OrganizationUserEntity).delete(id)
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'deleteOrganizationUser', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

/**
 * User section
 */
export const getUsers = async (organizationId: string) => {
  try {
    return await getRepository(OrganizationUserEntity).find({
      where: {
        organizationId,
        user: {
          isDelete: false,
        },
      },
      // select: ['id', 'role', 'createdAt', 'updatedAt', 'team'],
      relations: ['team', 'user'],
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getUsers', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getUserWithId = async (
  organization: OrganizationEntity,
  userId: string,
) => {
  try {
    return await getRepository(OrganizationUserEntity).findOne({
      where: { organization, user: { id: userId, isDelete: false } },
      relations: ['user', 'team'],
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getUserWithId', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const getUserWithGUID = async (
  organization: OrganizationEntity,
  guid: string,
) => {
  try {
    return await getRepository(OrganizationUserEntity).findOne({
      where: { organization, user: { guid, isDelete: false } },
      relations: ['user', 'team'],
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getUserWithGUID', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const getUserWithEmail = async (
  organization: OrganizationEntity,
  email: string,
) => {
  try {
    return await getRepository(OrganizationUserEntity).findOne({
      where: {
        organization,
        user: { email, isDelete: false },
      },
      relations: ['user', 'team'],
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getUserWithEmail', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const getUserWithEmailList = async (
  organization: OrganizationEntity,
  email: string[],
) => {
  try {
    return await getRepository(OrganizationUserEntity).findOne({
      where: { organization, user: { email: In(email), isDelete: false } },
      relations: ['user', 'team'],
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getUserWithEmailList', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

/**
 * Organization section
 */
export const getOrganizations = async (user: UserEntity) => {
  try {
    return await getRepository(OrganizationUserEntity).find({
      where: {
        user: { id: "b212db58-e7c3-460c-a3ed-105039438f8b" },
      },
      // select: ['id', 'role', 'createdAt', 'updatedAt', 'team'],
      relations: [
        'organization',
        'organization.activation',
        'organization.activation.package',
        'organization.createdBy',
      ],
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getOrganizations', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const getOrganizationsforSocket = async (userId:string) => {
  try {
    return await getRepository(OrganizationUserEntity).find({
      where: {
        userId: userId,
      },
      // select: ['id', 'role', 'createdAt', 'updatedAt', 'team'],
      relations: [
        'organization',
        'organization.activation',
        'organization.activation.package',
        'organization.createdBy',
      ],
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getOrganizations', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const getOrganizationWithId = async (
  user: UserEntity,
  organizationId: string,
) => {
  try {
    return await getRepository(OrganizationUserEntity).findOne({
      where: { user, organization: { id: organizationId, isDelete: false } },

      relations: [
        'organization',
        'organization.createdBy',
        'organization.channel',
        'organization.channel.line',
      ],
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getOrganizationWithId', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const getOrganizationWithName = async (
  user: UserEntity,
  name: string,
) => {
  try {
    return await getRepository(OrganizationUserEntity).findOne({
      where: { user, organization: { name, isDelete: false } },
      relations: ['organization'],
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getOrganizationWithName', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const getOrganizationUsersWithIds = async (
  organizationIds: string[],
) => {
  try {
    return await getRepository(OrganizationUserEntity).find({
      where: { organizationId: In(organizationIds) },
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getOrganizationUser', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

/**
 * API V2
 */
export const getUserOptions = async (organizationId: string) => {
  try {
    return await getRepository(OrganizationUserEntity).find({
      where: {
        organizationId,
        user: {
          isDelete: false,
        },
      },
      select: ['id', 'role', 'team', 'user'],
      relations: ['team', 'user'],
    })
  } catch (error) {
    errorMessage('MODEL', 'organizationUser', 'getUserOptions', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
