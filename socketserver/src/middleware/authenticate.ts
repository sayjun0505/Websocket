import { NextFunction, Request, Response } from 'express'
import { activationModel, packageModel, UserEntity } from '../model/organization/'
import { gcsService, gidService } from '../service/google'
import { ErrorCode, errorMessage, HttpException } from './exceptions'
import { ActivationEntity, ACTIVATION_STATUS, PAYMENT_OPTION, PAYMENT_TYPE } from '../model/organization/activation.entity';
import {
  organizationModel,
  organizationUserModel,
  userModel,
} from '../model/organization'

// Verify the Google Identity platform Token
export const verifyGoogleToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const bearer = authHeader.split(' ')[1]
      const decodedToken = await gidService.verifyToken(bearer)

      if (!decodedToken) {
        errorMessage(
          'Middleware',
          'authenticate',
          '(Unauthorized) Verify token',
        )
        res.status(401).json({ message: 'Unauthorized' })
      } else {
        // Get Customer profile from Database
        let fullName = ['','']
        if (decodedToken.name) {
          fullName = decodedToken.name.split(' ')
        }
        let result = decodedToken.email
          ? await userModel.getUserWithEmail(decodedToken.email)
          : await userModel.getUserWithGUID(decodedToken.uid)
        if (!result) {
          // Create new customer profile
          // Create new user with data from google identity platform
          const user = new UserEntity()
          user.guid = decodedToken.uid
          user.email = decodedToken.email || ''
          user.display = decodedToken.name || decodedToken.email || decodedToken.phone_number || ''
          user.firstname = fullName[0] || ''
          user.lastname = fullName[1] || ''

          // picture 
          if(decodedToken.picture && decodedToken.firebase.sign_in_provider === 'facebook.com'){
            const pictureURL = `${decodedToken.picture}?height=500&width=500&type=large`
            try {
              const contentName = await gcsService.uploadUserProfileFromURL(
                user.id,
                'profile',
                pictureURL,
              )
              user.picture = JSON.stringify({ filename : contentName })
            } catch (error) {
              errorMessage('CONTROLLER', 'authenticate', 'verifyGoogleToken', error)
            }
          }
          result = await userModel.saveUser(user)
          console.log('[verifyGoogleToken] new User ',user.display)
          if (!result) {
            errorMessage('Middleware', 'authenticate', 'Create new user error')
            res.status(500).json({ message: 'Create new user error' })
          }
          // new Free activation for new User

          const freePackage = await packageModel.getFreePackage()
          if (!freePackage) {
            errorMessage('Middleware', 'authenticate', 'Need One free package on database')
            // res.status(500).json({ message: 'no free package' })
          }else{
            activationModel.saveActivation({
              ...new ActivationEntity(),
              package: freePackage,
              status: ACTIVATION_STATUS.ACTIVE,
              createdBy: result,
            })
          }
        } else {
          // Update User
          if (!result.guid) {
            result = await userModel.saveUser({
              ...result,
              guid: decodedToken.uid,
              email: result.email || decodedToken.email || '',
              display: result.display || decodedToken.name || decodedToken.email || '',
              firstname: result.firstname || fullName[0] || '',
              lastname: result.lastname  || fullName[0] || '',
            })
            if (!result) {
              errorMessage('Middleware', 'authenticate', 'Update user error '+req.path)
              res.status(500).json({ message: 'Update user error' })
            }
          }
          if(!result.picture){
            if(decodedToken.picture && decodedToken.firebase.sign_in_provider === 'facebook.com'){
              const pictureURL = `${decodedToken.picture}?height=500&width=500&type=large`
              try {
                const contentName = await gcsService.uploadUserProfileFromURL(
                  result.id,
                  'profile',
                  pictureURL,
                )
                result = await userModel.saveUser({
                  ...result,
                  picture: JSON.stringify({ filename : contentName })
                })
              } catch (error) {
                errorMessage('CONTROLLER', 'authenticate', 'verifyGoogleToken', error)
              }
            }
          }
        }
        // Set user profile to body
        req.body.requester = result
        next()
      }
    } catch (error: any) {
      if (error.code) {
        if (error.code === 'auth/id-token-expired') {
          errorMessage(
            'Middleware',
            'authenticate',
            '(Unauthorized) Token Expired',
          )
          res.status(401).json({ message: 'Token Expired', code: error.code })
        } else if (error.code === 'auth/id-token-revoked') {
          errorMessage(
            'Middleware',
            'authenticate',
            '(Unauthorized) Token Revoked',
          )
          res.status(401).json({ message: 'Token Revoked', code: error.code })
        } else if (error.code === 'auth/invalid-id-token') {
          errorMessage(
            'Middleware',
            'authenticate',
            '(Unauthorized) Invalid Token',
          )
          res.status(401).json({ message: 'Invalid Token', code: error.code })
        } else {
          errorMessage(
            'Middleware',
            'authenticate',
            '(Unauthorized)' + error.code,
          )
          res.status(401).json({ code: error.code })
        }
      } else {
        errorMessage('Middleware', 'authenticate', 'Verify Google Token', error)
        res.status(500).json({ message: ErrorCode[500] })
      }
    }
  } else {
    errorMessage(
      'Middleware',
      'authenticate',
      '(Unauthorized) Missing authorization header:GoogleToken',
    )
    res.status(401).json({ message: 'Unauthorized' })
  }
}

export const verifyOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user: UserEntity = req.body.requester
    const { organizationId } = req.params
    if (
      !organizationId ||
      organizationId.match(
        '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$',
      ) === null
    ) {
      errorMessage(
        'Middleware',
        'authenticate',
        '(Organization) Missing organization id',
      )
      return res.status(400).json({ message: 'missing organization' })
    } else {
      const result = await organizationModel.getOrganizationWithId(
        organizationId,
      )
      if (!result) {
        errorMessage(
          'Middleware',
          'authenticate',
          '(Organization) Organization not found',
        )
        return res.status(404).json({ message: 'Organization not found' })
      }

      // Verify User in Organization
      const organizationUser = await organizationUserModel.getOrganizationUser(
        organizationId,
        user.id,
      )
      if (!organizationUser) {
        errorMessage(
          'Middleware',
          'authenticate',
          '(Organization) User unauthorized',
        )
        return res.status(401).json({ message: 'User unauthorized' })
      }
      req.body.organizationUser = organizationUser
      req.body.organization = result
      next()
    }
  } catch (error) {
    errorMessage(
      'Middleware',
      'authenticate',
      '(Organization) Verify Organization',
      error,
    )
    return res.status(500).json({ message: ErrorCode[500] })
  }
}

export const verifyTriggerToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization
  if (
    token &&
    process.env.TRIGGER_TOKEN &&
    process.env.TRIGGER_TOKEN === 'lmzqceyb3wFBwrPiTnzkhqC92OQv4RFb'
  ) {
    next()
  } else {
    errorMessage(
      'Middleware',
      'authenticate',
      '(Unauthorized) Missing authorization header:TriggerToken',
    )
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
