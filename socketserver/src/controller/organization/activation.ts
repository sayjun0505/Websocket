import { NextFunction, Request, Response } from 'express'
import Stripe from 'stripe'
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
  userModel,
  PAYMENT_OPTION,
  UserEntity,
  USER_ROLE,
} from '../../model/organization'

// const getPrice = (activation: ActivationEntity) => {
//   if (activation && activation.package) {
//     if (activation.paymentOption === PAYMENT_OPTION.YEARLY) {
//       return activation.package.yearlyPrice
//     } else if (activation.paymentOption === PAYMENT_OPTION.HALF_YEARLY) {
//       return activation.package.halfYearlyPrice
//     } else if (activation.paymentOption === PAYMENT_OPTION.QUARTERLY) {
//       return activation.package.quarterlyPrice
//     } else if (activation.paymentOption === PAYMENT_OPTION.MONTHLY) {
//       return activation.package.monthlyPrice
//     } else {
//       return null
//     }
//   } else {
//     return null
//   }
// }

export const getActivations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requester: UserEntity = req.body.requester
    const result = await activationModel.getActivations(requester)
    if (!result) {
      errorMessage('CONTROLLER', 'activation', 'get activations')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(200).send(
      result.map((activation) => {
        return {
          id: activation.id,
          description: activation.description,
          referenceNo: activation.referenceNo,
          inviteCode: activation.inviteCode,
          status: activation.status,
          expiration: activation.expiration,
          createdAt: activation.createdAt,
          packageId: activation.packageId,
          subId: activation.subId,
          package: activation.package,
          // price: getPrice(activation),
          // paymentType: activation.paymentType,
          // paymentOption: activation.paymentOption,
          organization: activation.organization.length,
        }
      }),
    )
  } catch (error) {
    errorMessage('CONTROLLER', 'activation', 'getActivations', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getActivationsforSocket = async (
  params: any
) => {
  try {
    const id = params
    const requester = await userModel.getUserWithId(id)
    if (requester != undefined) {
      const result = await activationModel.getActivations(requester)
      if (!result) {
        errorMessage('CONTROLLER', 'activation', 'get activations')
        return "error500"
      }
      return result.map((activation) => {
        return {
          id: activation.id,
          description: activation.description,
          referenceNo: activation.referenceNo,
          inviteCode: activation.inviteCode,
          status: activation.status,
          expiration: activation.expiration,
          createdAt: activation.createdAt,
          packageId: activation.packageId,
          subId: activation.subId,
          package: activation.package,
          // price: getPrice(activation),
          // paymentType: activation.paymentType,
          // paymentOption: activation.paymentOption,
          organization: activation.organization.length,
        }
      })
    }


  } catch (error) {
    errorMessage('CONTROLLER', 'activation', 'getActivations', error)
    return "error500"
  }
}

export const getActivationsInvite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requester: UserEntity = req.body.requester
    if (
      requester.email === 'timanon.lo@gmail.com' ||
      requester.email === 'u.veerapan@gmail.com' ||
      requester.email === 'praisetaw.shanlay@gmail.com' ||
      requester.email === 'downtown_007@hotmail.com'
    ) {
      const result = await activationModel.getInviteCodeList()
      if (!result) {
        errorMessage('CONTROLLER', 'activation', 'get activations')
        return next(new HttpException(500, ErrorCode[500]))
      }
      return res.status(200).send(
        result
          .filter((e) => e.inviteCode && e.inviteCode !== '')
          .map((activation) => {
            return {
              id: activation.id,
              description: activation.description,
              referenceNo: activation.referenceNo,
              inviteCode: activation.inviteCode,
              status: activation.status,
              expiration: activation.expiration,
              createdAt: activation.createdAt,
              packageId: activation.packageId,
              package: activation.package,
              subId: activation.subId,
              // price: getPrice(activation),
              // paymentType: activation.paymentType,
              // paymentOption: activation.paymentOption,
              organization: activation.organization.length,
            }
          }),
      )
    } else {
      return res.status(200).send([])
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'activation', 'getActivations', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}



export const getActivationsInviteforSocket = async (
  params: any
) => {
  try {
    const { code, reqid } = params
    const requester = await userModel.getUserWithId(reqid)
    if (requester != undefined) {
      if (
        requester.email === 'timanon.lo@gmail.com' ||
        requester.email === 'u.veerapan@gmail.com' ||
        requester.email === 'praisetaw.shanlay@gmail.com' ||
        requester.email === 'downtown_007@hotmail.com' ||
        requester.email === 'admin@admin.com'
      ) {
        const result = await activationModel.getInviteCodeList()
        console.log("====>", result)
        if (!result) {
          errorMessage('CONTROLLER', 'activation', 'get activations')
          return "error500"
        }
        return (
          result
            .filter((e) => e.inviteCode && e.inviteCode !== '')
            .map((activation) => {
              return {
                id: activation.id,
                description: activation.description,
                referenceNo: activation.referenceNo,
                inviteCode: activation.inviteCode,
                status: activation.status,
                expiration: activation.expiration,
                createdAt: activation.createdAt,
                packageId: activation.packageId,
                package: activation.package,
                subId: activation.subId,
                // price: getPrice(activation),
                // paymentType: activation.paymentType,
                // paymentOption: activation.paymentOption,
                organization: activation.organization.length,
              }
            })
        )
      } else {
        return []
      }
    }

  } catch (error) {
    errorMessage('CONTROLLER', 'activation', 'getActivations', error)
    return "error500"
  }
}




export const getActivation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'activation', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await activationModel.getActivationWithId(id)
    if (!result) {
      errorMessage('CONTROLLER', 'activation', 'activation not found')
      return next(new HttpException(404, 'activation not found'))
    }
    return res.status(200).send({
      id: result.id,
      description: result.description,
      referenceNo: result.referenceNo,
      inviteCode: result.inviteCode,
      status: result.status,
      createdAt: result.createdAt,
      packageId: result.packageId,
      package: result.package,
      subId: result.subId,
      customerId: result.customerId,
      // price: getPrice(result),
      // paymentType: result.paymentType,
      // paymentOption: result.paymentOption,
      organization: result.organization.length,
      createdById: result.createdBy.id,
      payments: result.payment.map((pay) => ({
        gbpReferenceNo: pay.gbpReferenceNo,
        resultCode: pay.resultCode,
        amount: pay.amount,
        paymentType: pay.paymentType,
        cardNo: pay.cardNo,
        paymentAt: pay.paymentAt,
      })),
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'activation', 'getActivation', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getPackage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { activationId } = req.params
    if (!activationId || typeof activationId !== 'string') {
      errorMessage('CONTROLLER', 'activation', 'getPackage invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const result = await activationModel.getActivationWithId(activationId)
    // const result = await packageModel.getPackageWithId(packageId)
    if (!result) {
      errorMessage('CONTROLLER', 'activation', 'package not found')
      return next(new HttpException(404, 'activation not found'))
    }
    return res.status(200).send({
      id: result.package.id,
      name: result.package.name,
      fileLimit: result.package.fileLimit,
      storageLimit: result.package.storageLimit,
      organizationLimit: result.package.organizationLimit,
      userLimit: result.package.userLimit,
      messageLimit: result.package.messageLimit,
      channelLimit: result.package.channelLimit,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'activation', 'getPackage', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getActivationSeat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params
    if (!id || typeof id !== 'string') {
      errorMessage(
        'CONTROLLER',
        'activation',
        'invalid parameter(activation id)',
      )
      return next(new HttpException(400, ErrorCode[400]))
    }

    const activation = await activationModel.getActivationWithId(id)
    if (!activation) {
      errorMessage('CONTROLLER', 'activation', 'activation not found')
      return next(new HttpException(404, 'activation not found'))
    }

    const organizationIds = activation.organization.map((_org) => _org.id)
    const organizationUsers =
      await organizationUserModel.getOrganizationUsersWithIds(organizationIds)
    // const userIds = organizationUsers.map((_user) => _user.userId)
    const uniqueUserIds = [
      ...new Set(organizationUsers.map((_user) => _user.userId)),
    ]
    // console.log('🍅 userIds ', userIds)
    // console.log('🍅 uniqueUserIds ', uniqueUserIds)
    return res.status(200).send({
      userLimit: activation.package.userLimit,
      freeSeat: activation.package.userLimit - uniqueUserIds.length,
      userIds: uniqueUserIds,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'activation', 'getActivationSeat', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createActivation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { packageId, referenceNo, description, paymentType, paymentOption } =
    req.body
  if (!packageId) {
    errorMessage('CONTROLLER', 'activation', 'invalid data(package)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const requester: UserEntity = req.body.requester

  const selectPackage = await packageModel.getPackageWithId(packageId)
  if (!selectPackage) {
    errorMessage('CONTROLLER', 'activation', 'package not found')
    return next(new HttpException(404, 'package not found'))
  }

  const newActivation: ActivationEntity = {
    ...new ActivationEntity(),
    status: ACTIVATION_STATUS.WAITING_PAYMENT,
    packageId,
    referenceNo,
    description,
    // paymentType,
    // paymentOption,
    createdBy: requester,
  }

  if (
    requester.email === 'timanon.lo@gmail.com' ||
    requester.email === 'u.veerapan@gmail.com' ||
    requester.email === 'praisetaw.shanlay@gmail.com' ||
    requester.email === 'downtown_007@hotmail.com'
  ) {
    newActivation.inviteCode = generateInviteCode(10)
    newActivation.status = ACTIVATION_STATUS.INVITE
  }

  try {
    // Add Activation to database
    const activation = await activationModel.saveActivation(newActivation)
    return res.status(201).send({
      id: activation.id,
      description: activation.description,
      referenceNo: activation.referenceNo,
      status: activation.status,
      createdAt: activation.createdAt,
      packageId: activation.packageId,
      // paymentType: activation.paymentType,
      // paymentOption: activation.paymentOption,
      package: selectPackage,
      // price: getPrice(activation),
      organization: 0,
      createdById: activation.createdBy.id,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'activation', 'createActivation', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const updateActivation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, description, paymentType, paymentOption, packageId } = req.body
  if (!id || !description || !paymentType || !paymentOption || !packageId) {
    errorMessage('CONTROLLER', 'activation', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }
  // const requester: UserEntity = req.body.requester

  const currentActivation = await activationModel.getActivationWithId(id)
  if (!currentActivation) {
    errorMessage('CONTROLLER', 'activation', 'activation not found')
    return next(new HttpException(404, 'package not found'))
  }

  const selectPackage = await packageModel.getPackageWithId(packageId)
  if (!selectPackage) {
    errorMessage('CONTROLLER', 'activation', 'package not found')
    return next(new HttpException(404, 'package not found'))
  }

  const newActivation: ActivationEntity = {
    ...currentActivation,
    id,
    description,
    // paymentType,
    // paymentOption,
  }

  try {
    // Add Activation to database
    const activation = await activationModel.saveActivation(newActivation)
    return res.status(201).send({
      id: activation.id,
      referenceNo: activation.referenceNo,
      inviteCode: activation.inviteCode,
      status: activation.status,
      createdAt: activation.createdAt,
      packageId: activation.packageId,
      subId: activation.subId,
      // paymentType: activation.paymentType,
      // paymentOption: activation.paymentOption,
      package: selectPackage,
      // price: getPrice(activation),
      organization: 0,
      createdById: activation.createdBy.id,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'activation', 'updateActivation', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const createActivationWithInvite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { code } = req.body
  if (!code || typeof code !== 'string') {
    errorMessage('CONTROLLER', 'activation', 'invalid data(invite code)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  const requester: UserEntity = req.body.requester
  console.log('[CODE] ', code)

  const selectActivation = await activationModel.getActivationWithInviteCode(
    code,
  )
  console.log('[selectActivation] ', selectActivation)
  if (!selectActivation) {
    errorMessage('CONTROLLER', 'activation', 'activation not found')
    return next(new HttpException(404, 'activation not found'))
  }

  const activation: ActivationEntity = {
    ...selectActivation,
    status: ACTIVATION_STATUS.ACTIVE,
    createdBy: requester,
    inviteCode: '',
  }

  try {
    // Add Activation to database
    const activationResult = await activationModel.saveActivation(activation)
    return res.status(201).send({
      id: activationResult.id,
      description: activationResult.description,
      referenceNo: activationResult.referenceNo,
      inviteCode: activation.inviteCode,
      status: activationResult.status,
      createdAt: activationResult.createdAt,
      packageId: activationResult.packageId,
      subId: activation.subId,
      // paymentType: activationResult.paymentType,
      // paymentOption: activationResult.paymentOption,
      package: activation.package,
      // price: getPrice(activation),
      organization: 0,
      createdById: activation.createdBy.id,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'activation', 'createActivation', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}
export const createActivationWithInviteforSocket = async (
  params: any
) => {
  const { code, reqid } = params
  console.log("--", code, reqid)
  if (!code || typeof code !== 'string') {
    errorMessage('CONTROLLER', 'activation', 'invalid data(invite code)')
    return "error400"
  }
  const requester = await userModel.getUserWithId(reqid)
  console.log('[CODE] ', code)

  const selectActivation = await activationModel.getActivationWithInviteCode(
    code,
  )
  console.log('[selectActivation] ', selectActivation)
  if (!selectActivation) {
    errorMessage('CONTROLLER', 'activation', 'activation not found')
    return "error400"
  }
  if (requester != undefined) {
    const activation: ActivationEntity = {
      ...selectActivation,
      status: ACTIVATION_STATUS.ACTIVE,
      createdBy: requester,
      inviteCode: '',
    }

    try {
      // Add Activation to database
      const activationResult = await activationModel.saveActivation(activation)
      return {
        id: activationResult.id,
        description: activationResult.description,
        referenceNo: activationResult.referenceNo,
        inviteCode: activation.inviteCode,
        status: activationResult.status,
        createdAt: activationResult.createdAt,
        packageId: activationResult.packageId,
        subId: activation.subId,
        // paymentType: activationResult.paymentType,
        // paymentOption: activationResult.paymentOption,
        package: activation.package,
        // price: getPrice(activation),
        organization: 0,
        createdById: activation.createdBy.id,
      }
    } catch (error) {
      errorMessage('CONTROLLER', 'activation', 'createActivation', error)
      return "error400"
    }
  }

}

/**
 * Util
 */
const generateInviteCode = (length: number) => {
  // declare all characters
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  // const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = ' '
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result.trim()
}

export const createCustomerPortalSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    errorMessage('UTILS', 'stripe', 'missing env')
    throw new HttpException(500, ErrorCode[500])
  }

  // const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecretKey: string = process.env.STRIPE_SECRET_KEY
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2022-11-15',
  })

  const { customerId, returnURL } = req.body
  if (!customerId || typeof customerId !== 'string') {
    errorMessage('CONTROLLER', 'activation', 'invalid data(customerId)')
    return next(new HttpException(400, ErrorCode[400]))
  }
  console.log('[customerId] ', customerId)

  try {
    // Authenticate your user.
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnURL,
    })

    res.json({ url: session.url })
  } catch (error) {
    errorMessage(
      'CONTROLLER',
      'activation',
      'createCustomerPortalSession',
      error,
    )
    return next(new HttpException(400, ErrorCode[400]))
  }
}
