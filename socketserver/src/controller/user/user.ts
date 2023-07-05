import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  OrganizationEntity,
  OrganizationUserEntity,
  organizationUserModel,
  ORGANIZATION_USER_STATUS,
  TeamEntity,
  UserEntity,
  userModel,
  USER_ROLE,
} from '../../model/organization'

import { gcsService, gidService } from '../../service/google'
import { THEME } from '../../model/organization/user.entity'

interface ME {
  id: string
  email: string
  firstname: string
  lastname: string
  display: string
  picture: string
  gender: string
  mobile: string
  address: string
  isOnline: string
  language: string
  theme: string
  facebookToken: string
  createdAt: string
  updatedAt: string
}

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.body.requester
    res.status(200).json({
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      display: user.display,
      picture: user.picture,
      pictureURL:
        user.picture &&
        JSON.parse(user.picture) &&
        JSON.parse(user.picture).filename
          ? gcsService.getUserProfileURL(
              user.id,
              JSON.parse(user.picture).filename,
            )
          : '',
      gender: user.gender,
      mobile: user.mobile,
      address: user.address,
      isOnline: user.isOnline,
      language: user.language,
      theme: user.theme,
      facebookToken: user.facebookToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as ME)
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'getMe', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getMeforSocket = async (
  userinfo: any
) => {
  try {
    const user = userinfo
    return ({
      id: user.id,
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      display: user.display,
      picture: user.picture,
      pictureURL:
        user.picture &&
        JSON.parse(user.picture) &&
        JSON.parse(user.picture).filename
          ? gcsService.getUserProfileURL(
              user.id,
              JSON.parse(user.picture).filename,
            )
          : '',
      gender: user.gender,
      mobile: user.mobile,
      address: user.address,
      isOnline: user.isOnline,
      language: user.language,
      theme: user.theme,
      facebookToken: user.facebookToken,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    } as ME)
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'getMe', error)
    return "error500"
  }
}

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const organizationUser = await organizationUserModel.getUsers(
      organization.id,
    )
    if (!organizationUser) {
      errorMessage('CONTROLLER', 'user', 'get users')
      return next(new HttpException(500, ErrorCode[500]))
    }

    // Convert to User option object
    const users = organizationUser.map((_) => ({
      id: _.userId,
      role: _.role,
      teamId: _.teamId,
      email: _.user.email,
      firstname: _.user.firstname,
      lastname: _.user.lastname,
      display: _.user.display,
      pictureURL: _.user.picture,
    }))
    return res.status(200).send(
      organizationUser.map((_user) => ({
        ..._user,
        user: {
          ..._user.user,
          pictureURL:
            _user.user.picture &&
            JSON.parse(_user.user.picture) &&
            JSON.parse(_user.user.picture).filename
              ? gcsService.getUserProfileURL(
                  _user.user.id,
                  JSON.parse(_user.user.picture).filename,
                )
              : '',
        },
      })),
    )
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'getUsers', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    const { email, id } = req.query

    if (!organization) {
      return res.status(200).send(requester)
    }

    if (email) {
      if (typeof email !== 'string') {
        errorMessage('CONTROLLER', 'user', 'invalid user email')
        return next(new HttpException(400, ErrorCode[400]))
      }
      const emailUser = await organizationUserModel.getUserWithEmail(
        organization,
        email,
      )
      if (!emailUser) {
        errorMessage('CONTROLLER', 'user', ' User(email) not found')
        return next(new HttpException(404, 'user not found'))
      }
      return res.status(200).send(emailUser)
    } else if (id) {
      if (typeof id !== 'string') {
        errorMessage('CONTROLLER', 'user', 'invalid user id')
        return next(new HttpException(400, ErrorCode[400]))
      }
      const idUser = await organizationUserModel.getUserWithId(organization, id)
      if (!idUser) {
        errorMessage('CONTROLLER', 'user', 'User(id) not found')
        return next(new HttpException(404, 'user not found'))
      }
      return res.status(200).send({
        ...idUser,
        user: {
          ...idUser.user,
          pictureURL:
            idUser.user.picture &&
            JSON.parse(idUser.user.picture) &&
            JSON.parse(idUser.user.picture).filename
              ? gcsService.getUserProfileURL(
                  idUser.user.id,
                  JSON.parse(idUser.user.picture).filename,
                )
              : '',
        },
      })
    } else {
      return res.status(200).send(requester)
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'getUser', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getUserforSocket = async (
  params: any
) => {
  try {
    const organization: OrganizationEntity = params.organization
    const requester: UserEntity = params.requester

    const { email, id } = params.query

    if (!organization) {
      return (requester)
    }

    if (email) {
      if (typeof email !== 'string') {
        errorMessage('CONTROLLER', 'user', 'invalid user email')
        return "error400"
      }
      const emailUser = await organizationUserModel.getUserWithEmail(
        organization,
        email,
      )
      if (!emailUser) {
        errorMessage('CONTROLLER', 'user', ' User(email) not found')
        return 'user not found'
      }
      return (emailUser)
    } else if (id) {
      if (typeof id !== 'string') {
        errorMessage('CONTROLLER', 'user', 'invalid user id')
        return "error400"
      }
      const idUser = await organizationUserModel.getUserWithId(organization, id)
      if (!idUser) {
        errorMessage('CONTROLLER', 'user', 'User(id) not found')
        return 'user not found'
      }
      return ({
        ...idUser,
        user: {
          ...idUser.user,
          pictureURL:
            idUser.user.picture &&
            JSON.parse(idUser.user.picture) &&
            JSON.parse(idUser.user.picture).filename
              ? gcsService.getUserProfileURL(
                  idUser.user.id,
                  JSON.parse(idUser.user.picture).filename,
                )
              : '',
        },
      })
    } else {
      return requester
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'getUser', error)
    return "error500"
  }
}

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { user } = req.body
  if (!user || user.id) {
    errorMessage('CONTROLLER', 'user', 'invalid user data')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const requester: UserEntity = req.body.requester

  try {
    // Create Google identity platform user
    if (requester && requester.guid !== user.guid) {
      const gUserRecord = await gidService.createGoogleUser(
        user.email,
        user.password,
      )
      user.guid = gUserRecord.uid
    } else {
      user.guid = req.body.gUser.uid
    }
    // Add user to database
    const newUser: UserEntity = {
      ...user,
      createdBy: requester,
    }
    const newUserResult = await userModel.saveUser(newUser)

    // Create relation between user and organization
    // if (organization) {
    //   const newOrganizationUser = new OrganizationUserEntity()
    //   newOrganizationUser.role = role
    //   newOrganizationUser.team = team
    //   newOrganizationUser.user = newUserResult
    //   newOrganizationUser.organization = organization
    //   newOrganizationUser.createdBy = requester
    //   await organizationUserModel.saveOrganizationUser(newOrganizationUser)
    // }
    if (newUserResult)
      return res
        .status(201)
        .send(await userModel.getUserWithGUID(newUserResult.guid))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'createUser', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const createUserforSocket = async (
  params: any
) => {
  const { user } = params
  if (!user || user.id) {
    errorMessage('CONTROLLER', 'user', 'invalid user data')
    return "error400"
  }

  const requester: UserEntity = params.requester

  try {
    // Create Google identity platform user
    if (requester && requester.guid !== user.guid) {
      const gUserRecord = await gidService.createGoogleUser(
        user.email,
        user.password,
      )
      user.guid = gUserRecord.uid
    } else {
      user.guid = params.gUser.uid
    }
    // Add user to database
    const newUser: UserEntity = {
      ...user,
      createdBy: requester,
    }
    const newUserResult = await userModel.saveUser(newUser)

    if (newUserResult)
      return (await userModel.getUserWithGUID(newUserResult.guid))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'createUser', error)
    return "error500"
  }
}
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let user = req.body.user
  if (typeof user === 'string') {
    user = JSON.parse(user)
  }
  if (!user || !user.id) {
    errorMessage('CONTROLLER', 'user', 'invalid user data')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Update user to database
    const newUser: UserEntity = {
      ...user,
      updatedBy: requester,
    }
    const newUserResult = await userModel.saveUser(newUser)

    const role: USER_ROLE = req.body.role
    let team = req.body.team
    if (typeof team === 'string') {
      team = JSON.parse(team)
    }

    if (organization && (role || team)) {
      const organizationUser = await organizationUserModel.getOrganizationUser(
        organization.id,
        newUserResult.id,
      )
      if (organizationUser) {
        if (role) {
          organizationUser.role = role
        }
        if (team) {
          organizationUser.team = team
        }
        await organizationUserModel.saveOrganizationUser(organizationUser)
      } else {
        errorMessage('CONTROLLER', 'user', 'update user(role/team)')
        return next(new HttpException(500, ErrorCode[500]))
      }
    }
    return res.status(201).send(await userModel.getUserWithId(newUserResult.id))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'updateUser', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const updateUserforSocket = async (
  params: any
) => {
  let user = params.user
  if (typeof user === 'string') {
    user = JSON.parse(user)
  }
  if (!user || !user.id) {
    errorMessage('CONTROLLER', 'user', 'invalid user data')
    return "error400"
  }

  const organization: OrganizationEntity = params.organization
  const requester: UserEntity = params.requester

  try {
    // Update user to database
    const newUser: UserEntity = {
      ...user,
      updatedBy: requester,
    }
    const newUserResult = await userModel.saveUser(newUser)

    const role: USER_ROLE = params.role
    let team = params.team
    if (typeof team === 'string') {
      team = JSON.parse(team)
    }

    if (organization && (role || team)) {
      const organizationUser = await organizationUserModel.getOrganizationUser(
        organization.id,
        newUserResult.id,
      )
      if (organizationUser) {
        if (role) {
          organizationUser.role = role
        }
        if (team) {
          organizationUser.team = team
        }
        await organizationUserModel.saveOrganizationUser(organizationUser)
      } else {
        errorMessage('CONTROLLER', 'user', 'update user(role/team)')
        return "error500"
      }
    }
    return (await userModel.getUserWithId(newUserResult.id))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'updateUser', error)
    return "error500"
  }
}

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  const { id } = req.query

  try {
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'user', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const organizationUserResult = await organizationUserModel.getUserWithId(
      organization,
      id,
    )
    if (!organizationUserResult) {
      errorMessage('CONTROLLER', 'user', ' User not found')
      return next(new HttpException(404, 'user not found'))
    }

    const userResult: UserEntity = {
      ...organizationUserResult.user,
      isDelete: true,
      updatedBy: requester,
    }
    return res.status(201).send(await userModel.saveUser(userResult))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'deleteUser', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const deleteUserforSocket = async (
  params: any
) => {
  const organization: OrganizationEntity = params.organization
  const requester: UserEntity = params.requester

  const { id } = params.query

  try {
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'user', 'invalid parameter')
      return "error400"
    }
    const organizationUserResult = await organizationUserModel.getUserWithId(
      organization,
      id,
    )
    if (!organizationUserResult) {
      errorMessage('CONTROLLER', 'user', ' User not found')
      return 'user not found'
    }

    const userResult: UserEntity = {
      ...organizationUserResult.user,
      isDelete: true,
      updatedBy: requester,
    }
    return (await userModel.saveUser(userResult))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'deleteUser', error)
    return "error500"
  }
}

export const addUserToOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, role } = req.body
  if (!email) {
    errorMessage(
      'CONTROLLER',
      'user.addUserToOrganization',
      'invalid user data(email)',
    )
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    let newUserResult = await userModel.getUserWithEmail(email)
    if (!newUserResult) {
      // Add temporary user to database
      const newUser: UserEntity = {
        ...new UserEntity(),
        email,
        createdBy: requester,
      }
      newUserResult = await userModel.saveUser(newUser)
    }

    // Create relation between user and organization
    if (organization) {
      const newOrganizationUser: OrganizationUserEntity = {
        ...new OrganizationUserEntity(),
        role: role || USER_ROLE.AGENT,
        user: newUserResult,
        status: ORGANIZATION_USER_STATUS.PADDING,
        organization,
        createdBy: requester,
      }
      await organizationUserModel.saveOrganizationUser(newOrganizationUser)
    }
    if (newUserResult)
      return res
        .status(201)
        .send(await userModel.getUserWithEmail(newUserResult.email))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'addUserToOrganization', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const addUserToOrganizationforSocket = async (
  params: any
) => {
  const { email, role } = params
  if (!email) {
    errorMessage(
      'CONTROLLER',
      'user.addUserToOrganization',
      'invalid user data(email)',
    )
    return "error400"
  }

  const organization: OrganizationEntity = params.organization
  const requester: UserEntity = params.requester

  try {
    let newUserResult = await userModel.getUserWithEmail(email)
    if (!newUserResult) {
      // Add temporary user to database
      const newUser: UserEntity = {
        ...new UserEntity(),
        email,
        createdBy: requester,
      }
      newUserResult = await userModel.saveUser(newUser)
    }

    // Create relation between user and organization
    if (organization) {
      const newOrganizationUser: OrganizationUserEntity = {
        ...new OrganizationUserEntity(),
        role: role || USER_ROLE.AGENT,
        user: newUserResult,
        status: ORGANIZATION_USER_STATUS.PADDING,
        organization,
        createdBy: requester,
      }
      await organizationUserModel.saveOrganizationUser(newOrganizationUser)
    }
    if (newUserResult)
      return (await userModel.getUserWithEmail(newUserResult.email))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'addUserToOrganization', error)
    return "error500"
  }
}
export const removeUserFromOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  let { id } = req.query

  if (!id) {
    id = req.body.id
  }

  try {
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'user', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const organizationUserResult = await organizationUserModel.getUserWithId(
      organization,
      id,
    )
    if (!organizationUserResult) {
      errorMessage('CONTROLLER', 'user', ' User not found')
      return next(new HttpException(404, 'user not found'))
    }
    return res
      .status(201)
      .send(
        await organizationUserModel.deleteOrganizationUser(
          organizationUserResult.id,
        ),
      )
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'removeUserFromOrganization', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const removeUserFromOrganizationforSocket = async (
  params: any
) => {
  const organization: OrganizationEntity = params.organization
  const requester: UserEntity = params.requester

  let { id } = params.query

  if (!id) {
    id = params.id
  }

  try {
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'user', 'invalid parameter')
      return "error400"
    }
    const organizationUserResult = await organizationUserModel.getUserWithId(
      organization,
      id,
    )
    if (!organizationUserResult) {
      errorMessage('CONTROLLER', 'user', ' User not found')
      return 'user not found'
    }
    return (
        await organizationUserModel.deleteOrganizationUser(
          organizationUserResult.id,
        )
      )
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'removeUserFromOrganization', error)
    return "error500"
  }
}

export const changeTheme = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requester: UserEntity = req.body.requester

    const { type } = req.params

    if (!type) {
      errorMessage('CONTROLLER', 'user', 'changeTheme')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await userModel.saveUser({
      ...requester,
      theme: type as THEME,
    })
    if (result) {
      return res.status(200).send({ message: 'success' })
    } else {
      errorMessage('CONTROLLER', 'user', 'save changeTheme')
      return next(new HttpException(400, ErrorCode[400]))
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'getUser', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const changeThemeforSocket = async (
  paramas: any
) => {
  try {
    const requester: UserEntity = paramas.requester

    const { type } = paramas.params

    if (!type) {
      errorMessage('CONTROLLER', 'user', 'changeTheme')
      return 'error400'
    }

    const result = await userModel.saveUser({
      ...requester,
      theme: type as THEME,
    })
    if (result) {
      return { message: 'success' }
    } else {
      errorMessage('CONTROLLER', 'user', 'save changeTheme')
      return "error400"
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'getUser', error)
    return "error500"
  }
}

export enum CONTENT_TYPE {
  PROFILE = 'profile',
  COVER = 'cover',
}
export const uploadContent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId, type } = req.params
  if (!userId || !type) {
    errorMessage(
      'CONTROLLER',
      'user.uploadContent',
      'invalid parameter(userId/type)',
    )
    return next(new HttpException(400, ErrorCode[400]))
  }
  if (!(<any>Object).values(CONTENT_TYPE).includes(type)) {
    errorMessage('CONTROLLER', 'user.uploadContent', 'invalid content type')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const requester: UserEntity = req.body.requester
  const user =
    userId === requester.id ? requester : await userModel.getUserWithId(userId)

  if (!user) {
    errorMessage('CONTROLLER', 'user.uploadContent', ' User(userId) not found')
    return next(new HttpException(404, 'user not found'))
  }

  const content = req.file
  if (!content) {
    errorMessage('CONTROLLER', 'user.uploadContent', 'invalid file')
    return next(new HttpException(400, ErrorCode[400]))
  }

  try {
    const contentName = await gcsService.uploadUserProfileFromFileObject(
      user.id,
      type,
      { data: content.buffer, contentType: content.mimetype },
    )

    const url = gcsService.getUserProfileURL(user.id, contentName)

    await userModel.saveUser({
      ...user,
      picture: JSON.stringify({ filename: contentName }),
    })
    return res.status(200).json({
      message: 'Upload was successful',
      fileName: contentName,
      url,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'user.uploadContent', 'uploadContent', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}

export const updateProfilePictureWithFacebook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req.params
  if (!userId) {
    errorMessage(
      'CONTROLLER',
      'user.updateProfileWithFacebook',
      'invalid parameter(userId)',
    )
    return next(new HttpException(400, ErrorCode[400]))
  }
  const facebookPicture = req.body.picture
  if (!facebookPicture) {
    errorMessage(
      'CONTROLLER',
      'user.updateProfileWithFacebook',
      'invalid parameter(facebookPicture)',
    )
    return next(new HttpException(400, ErrorCode[400]))
  }

  const requester: UserEntity = req.body.requester
  const user =
    userId === requester.id ? requester : await userModel.getUserWithId(userId)
  if (!user) {
    errorMessage('CONTROLLER', 'user.uploadContent', ' User(userId) not found')
    return next(new HttpException(404, 'user not found'))
  }

  try {
    const pictureURL = `${facebookPicture}?height=500&width=500&type=large`

    const contentName = await gcsService.uploadUserProfileFromURL(
      user.id,
      'profile',
      pictureURL,
    )

    const url = gcsService.getUserProfileURL(user.id, contentName)

    await userModel.saveUser({
      ...user,
      picture: JSON.stringify({ filename: contentName }),
    })
    return res.status(200).json({
      message: 'Update Profile picture was successful',
      fileName: contentName,
      url,
    })
  } catch (error) {
    errorMessage(
      'CONTROLLER',
      'user',
      'updateProfilePictureWithFacebook',
      error,
    )
    return next(new HttpException(400, ErrorCode[400]))
  }
}
export const uploadContentforSocket = async (
  params: any
) => {
  const { userId, type } = params.params
  if (!userId || !type) {
    errorMessage(
      'CONTROLLER',
      'user.uploadContent',
      'invalid parameter(userId/type)',
    )
    return "error400"
  }
  if (!(<any>Object).values(CONTENT_TYPE).includes(type)) {
    errorMessage('CONTROLLER', 'user.uploadContent', 'invalid content type')
    return "error400"
  }

  const requester: UserEntity = params.requester
  const user =
    userId === requester.id ? requester : await userModel.getUserWithId(userId)

  if (!user) {
    errorMessage('CONTROLLER', 'user.uploadContent', ' User(userId) not found')
    return 'user not found'
  }

  const content = params.file
  if (!content) {
    errorMessage('CONTROLLER', 'user.uploadContent', 'invalid file')
    return "error400"
  }

  try {
    const contentName = await gcsService.uploadUserProfileFromFileObject(
      user.id,
      type,
      { data: content.buffer, contentType: content.mimetype },
    )

    const url = gcsService.getUserProfileURL(user.id, contentName)

    await userModel.saveUser({
      ...user,
      picture: JSON.stringify({ filename: contentName }),
    })
    return ({
      message: 'Upload was successful',
      fileName: contentName,
      url,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'user.uploadContent', 'uploadContent', error)
    return "error400"
  }
}

export const updateProfilePictureWithFacebookforSocket = async (
  params: any
) => {
  const { userId } = params.params
  if (!userId) {
    errorMessage(
      'CONTROLLER',
      'user.updateProfileWithFacebook',
      'invalid parameter(userId)',
    )
    return "error400"
  }
  const facebookPicture = params.picture
  if (!facebookPicture) {
    errorMessage(
      'CONTROLLER',
      'user.updateProfileWithFacebook',
      'invalid parameter(facebookPicture)',
    )
    return "error400"
  }

  const requester: UserEntity = params.requester
  const user =
    userId === requester.id ? requester : await userModel.getUserWithId(userId)
  if (!user) {
    errorMessage('CONTROLLER', 'user.uploadContent', ' User(userId) not found')
    return 'user not found'
  }

  try {
    const pictureURL = `${facebookPicture}?height=500&width=500&type=large`

    const contentName = await gcsService.uploadUserProfileFromURL(
      user.id,
      'profile',
      pictureURL,
    )

    const url = gcsService.getUserProfileURL(user.id, contentName)

    await userModel.saveUser({
      ...user,
      picture: JSON.stringify({ filename: contentName }),
    })
    return ({
      message: 'Update Profile picture was successful',
      fileName: contentName,
      url,
    })
  } catch (error) {
    errorMessage(
      'CONTROLLER',
      'user',
      'updateProfilePictureWithFacebook',
      error,
    )
    return "error400"
  }
}

export const updateUserIsOnline = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { isOnline } = req.body
  if (!isOnline) {
    errorMessage('CONTROLLER', 'user', 'invalid user data')
    return next(new HttpException(400, ErrorCode[400]))
  }

  // const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Update user to database
    const newUser: UserEntity = {
      ...requester,
      isOnline,
    }
    const newUserResult = await userModel.saveUser(newUser)

    return res.status(201).send(await userModel.getUserWithId(newUserResult.id))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'updateUser', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const updateUserIsOnlineforSocket = async (
  params: any
) => {
  const { isOnline } = params 
  if (!isOnline) {
    errorMessage('CONTROLLER', 'user', 'invalid user data')
    return "error400"
  }

  // const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = params.requester

  try {
    // Update user to database
    const newUser: UserEntity = {
      ...requester,
      isOnline,
    }
    const newUserResult = await userModel.saveUser(newUser)

    return (await userModel.getUserWithId(newUserResult.id))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'updateUser', error)
    return "error500"
  }
}