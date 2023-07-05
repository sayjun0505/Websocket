import { NextFunction, Request, Response } from 'express'
import { MessageEntity } from '../../model/chat'
import Stripe from 'stripe'
import { Between, getRepository, In, MoreThan } from 'typeorm'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  ActivationEntity,
  activationModel,
  ACTIVATION_STATUS,
  OrganizationEntity,
  organizationUserModel,
  PackageEntity,
  packageModel,
  PAYMENT_OPTION,
  UserEntity,
  USER_ROLE,
} from '../../model/organization'
import { gcsService } from '../../service/google'

export const getLimitation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { activationId } = req.params
    if (!activationId || typeof activationId !== 'string') {
      errorMessage('CONTROLLER', 'limitation', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const activation = await activationModel.getActivationWithId(activationId)
    if (!activation) {
      errorMessage('CONTROLLER', 'limitation', 'activation not found')
      return next(new HttpException(404, 'activation not found'))
    }
    const pkg = await packageModel.getPackageWithId(activation.packageId)
    if (!pkg) {
      errorMessage('CONTROLLER', 'limitation', 'package not found')
      return next(new HttpException(404, 'package not found'))
    }

    const organizationIds = activation.organization.map((_org) => _org.id)

    // Organization limit
    const organization = {
      limit: pkg.organizationLimit,
      count: organizationIds.length,
    }

    // User limit
    const organizationUsers =
      await organizationUserModel.getOrganizationUsersWithIds(organizationIds)
    const uniqueUserIds = [
      ...new Set(organizationUsers.map((_user) => _user.userId)),
    ]
    const user = {
      limit: pkg.userLimit,
      count: uniqueUserIds.length,
    }

    // Message limit per month
    const date = new Date()
    // ✅ Get the first day of the current month
    const firstDayCurrentMonth = new Date(
      date.getFullYear(),
      date.getMonth(),
      1,
    )
    // ✅ Get the last day of current month
    const lastDayCurrentMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    )
    const thisMonthMessage = await getRepository(MessageEntity).count({
      where: {
        organizationId: In(organizationIds),
        createdAt: Between(firstDayCurrentMonth, lastDayCurrentMonth),
      },
    })

    const message = {
      limit: pkg.messageLimit,
      count: thisMonthMessage,
    }

    const currentStorageSizePerOrganization = await Promise.all(
      organizationIds.map(
        async (_organization) =>
          await gcsService.getOrganizationBucketSize(_organization),
      ),
    )

    const storage = {
      limit: Number(pkg.storageLimit),
      total: currentStorageSizePerOrganization.reduce((a, b) => a + b, 0),
    }

    return res.status(200).send({
      package: {
        name: pkg.name,
        status: activation.status,
      },
      organization,
      message,
      storage,
      user,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'limitation', 'getActivation', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
