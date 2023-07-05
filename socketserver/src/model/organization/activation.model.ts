import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, IsNull, Not } from 'typeorm'

import {
  ActivationEntity,
  ACTIVATION_STATUS,
  OrganizationEntity,
  PackageEntity,
  UserEntity,
} from '.'

export const getActivations = async (user: UserEntity) => {

  return await getRepository(ActivationEntity).find({
    where: {
      createdBy: { id: user.id },
    },
    relations: ['createdBy', 'organization', 'package'],
  })
}
export const getActivationsforSocket = async (userId: string) => {

  return await getRepository(ActivationEntity).find({
    where: {
      createdBy: userId,
    },
    relations: ['createdBy', 'organization', 'package'],
  })
}
export const getInviteCodeList = async () => {
  return await getRepository(ActivationEntity).find({
    where: {
      status: ACTIVATION_STATUS.INVITE,
      inviteCode: Not(IsNull()),
    },
    relations: ['createdBy', 'organization', 'package'],
  })
}

export const getActivationWithId = async (id: string) => {
  return await getRepository(ActivationEntity).findOne({
    where: {
      id,
    },
    relations: ['createdBy', 'organization', 'package', 'payment'],
  })
}

export const getActivationWithInviteCode = async (inviteCode: string) => {
  return await getRepository(ActivationEntity).findOne({
    where: {
      inviteCode,
    },
    relations: ['createdBy', 'organization', 'package', 'payment'],
  })
}

export const getActivationWithReferenceNo = async (referenceNo: string) => {
  return await getRepository(ActivationEntity).findOne({
    where: {
      referenceNo,
    },
    select: ['id', 'expiration'],
  })
}

export const getActivationWithOrganization = async (
  organization: OrganizationEntity,
) => {
  return await getRepository(ActivationEntity).find({
    where: {
      organization,
    },
    relations: ['createdBy', 'organization', 'package'],
  })
}

export const saveActivation = async (activation: ActivationEntity) => {
  try {
    return await getRepository(ActivationEntity).save(activation)
  } catch (error) {
    errorMessage('MODEL', 'activation', 'saveActivation', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteActivationWithStripeSubscriptionId = async (
  subscriptionId: string,
) => {
  try {
    return await getRepository(ActivationEntity).update(
      { subId: subscriptionId },
      { isDelete: true },
    )
  } catch (error) {
    errorMessage(
      'MODEL',
      'activation',
      'deleteActivationWithStripeSubscriptionId',
      error,
    )
    throw new HttpException(500, ErrorCode[500])
  }
}
export const updateActivationPackage = async (
  subscriptionId: string,
  packageId: string,
) => {
  try {
    return await getRepository(ActivationEntity).update(
      { subId: subscriptionId },
      { packageId },
    )
  } catch (error) {
    errorMessage('MODEL', 'activation', 'updateActivationPackage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
export const updateActivationExpiration = async (
  subscriptionId: string,
  expiration: Date,
) => {
  try {
    return await getRepository(ActivationEntity).update(
      { subId: subscriptionId },
      { expiration },
    )
  } catch (error) {
    errorMessage('MODEL', 'activation', 'updateActivationPackage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
