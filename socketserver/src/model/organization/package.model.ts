import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'

import { ActivationEntity, OrganizationEntity, PackageEntity } from '.'

export const getPackages = async () => {
  return await getRepository(PackageEntity).find({
    where: {
      isDelete: false,
      isFree: false,
    },
    // relations: ['activation'],
  })
}

export const getPackageWithId = async (id: string) => {
  return await getRepository(PackageEntity).findOne({
    where: {
      id,
      isDelete: false,
    },
    // relations: [ 'activation'],
  })
}

export const getPackageWithStripeProductId = async (
  stripeProductId: string,
) => {
  return await getRepository(PackageEntity).findOne({
    where: {
      stripeProductId,
      isDelete: false,
    },
    // relations: [ 'activation'],
  })
}

export const getPackagesWithActivation = async (
  activation: ActivationEntity,
) => {
  return await getRepository(PackageEntity).find({
    where: {
      activation,
      isDelete: false,
    },
    // relations: ['activation'],
  })
}

export const savePackage = async (pkg: PackageEntity) => {
  try {
    return await getRepository(PackageEntity).save(pkg)
  } catch (error) {
    errorMessage('MODEL', 'package', 'savePackage', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getFreePackage = async () => {
  return await getRepository(PackageEntity).findOne({
    where: {
      isFree: true,
      isDelete: false,
    },
  })
}
