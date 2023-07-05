import { NextFunction, Request, Response } from 'express'
import { permissionModel, roleModel } from '../../model/authorization'
import { ORGANIZATION_USER_STATUS } from '../../model/organization/organizationUser.entity'

import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  activationModel,
  OrganizationEntity,
  organizationModel,
  OrganizationUserEntity,
  organizationUserModel,
  ORGANIZATION_STATUS,
  UserEntity,
  USER_ROLE,
  userModel,
} from '../../model/organization'
import {
  teamChatChannelMemberModel,
  teamChatChannelModel,
  teamChatDmSettingModel,
  teamChatHQSettingModel,
  teamChatMentionModel,
} from '../../model/teamChat'
import { request } from 'http'

export const getOrganizations = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const requester: UserEntity = req.body.requester
    const result = await organizationUserModel.getOrganizations(requester)
    if (!result) {
      errorMessage('CONTROLLER', 'organization', 'get organizations')
      return next(new HttpException(500, ErrorCode[500]))
    }
    res.status(200).send(
      result.map((organization) => {
        return {
          id: organization.id,
          status: organization.status,
          role: organization.role,
          organizationId: organization.organization.id,
          organization: {
            id: organization.organization.id,
            name: organization.organization.name,
            description: organization.organization.description,
            status: organization.organization.status,
            createdAt: organization.organization.createdAt,
            updatedAt: organization.organization.updatedAt,
          },
          activationId: organization.organization.activationId,
          package: organization.organization.activation
            ? {
              name: organization.organization.activation.package.name,
              description: organization.organization.activation.description,
              status: organization.organization.activation.status,
              channelLimit:
                organization.organization.activation.package.channelLimit,
              messageLimit:
                organization.organization.activation.package.messageLimit,
              organizationLimit:
                organization.organization.activation.package
                  .organizationLimit,
              userLimit:
                organization.organization.activation.package.userLimit,
            }
            : null,
          createdById: organization.organization.createdBy.id,
        }
      }),
    )
  } catch (error) {
    errorMessage('CONTROLLER', 'organization', 'getOrganizations', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getOrganizationsforSocket = async (
  params: any
) => {
  try {
    const id = params
    const requester = await userModel.getUserWithId(id)
    if (requester != undefined) {
      const result = await organizationUserModel.getOrganizations(requester)
      if (!result) {
        errorMessage('CONTROLLER', 'organization', 'get organizations')
        return "error500"
      }
      return result.map((organization) => {
        return {
          id: organization.id,
          status: organization.status,
          role: organization.role,
          organizationId: organization.organization.id,
          organization: {
            id: organization.organization.id,
            name: organization.organization.name,
            description: organization.organization.description,
            status: organization.organization.status,
            createdAt: organization.organization.createdAt,
            updatedAt: organization.organization.updatedAt,
          },
          activationId: organization.organization.activationId,
          package: organization.organization.activation
            ? {
              name: organization.organization.activation.package.name,
              description: organization.organization.activation.description,
              status: organization.organization.activation.status,
              channelLimit:
                organization.organization.activation.package.channelLimit,
              messageLimit:
                organization.organization.activation.package.messageLimit,
              organizationLimit:
                organization.organization.activation.package
                  .organizationLimit,
              userLimit:
                organization.organization.activation.package.userLimit,
            }
            : null,
          createdById: organization.organization.createdBy.id,
        }
      })
    }


  } catch (error) {
    errorMessage('CONTROLLER', 'organization', 'getOrganizations', error)
    return "error500"
  }
}

export const getOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params
    if (!id) {
      errorMessage('CONTROLLER', 'organization', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const requester: UserEntity = req.body.requester
    const organization = await organizationUserModel.getOrganizationWithId(
      requester,
      id,
    )
    if (!organization) {
      errorMessage('CONTROLLER', 'organization', 'organization(id) not found')
      return next(new HttpException(404, 'organization not found'))
    }
    const permission = await permissionModel.getPermissionWithRole(
      organization.role,
    )
    if (!permission) {
      errorMessage('CONTROLLER', 'organization', 'permission not found')
      return next(new HttpException(404, 'organization not found'))
    }

    return res.status(200).json({
      id: organization.id,
      status: organization.status,
      role: organization.role,
      organizationId: organization.organization.id,
      organization: {
        id: organization.organization.id,
        name: organization.organization.name,
        description: organization.organization.description,
        status: organization.organization.status,
        createdAt: organization.organization.createdAt,
        updatedAt: organization.organization.updatedAt,
      },
      activationId: organization.organization.activationId,
      createdById: organization.organization.createdBy.id,
      permission,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'organization', 'getOrganization', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, description, activationId } = req.body.organization
  if (!name || !description || !activationId) {
    errorMessage('CONTROLLER', 'organization', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const requester: UserEntity = req.body.requester

  const activation = await activationModel.getActivationWithId(activationId)
  if (activation) {
    const currentOrganizationCount = activation.organization.length
    const packageLimit = activation.package.organizationLimit
    if (packageLimit !== -1 && currentOrganizationCount >= packageLimit) {
      errorMessage('CONTROLLER', 'organization', 'package limit')
      res.status(400).json({ message: 'package limit' })
    }
  } else {
    errorMessage('CONTROLLER', 'organization', 'activation code not found')
    res.status(400).json({ message: 'activation code not found' })
  }

  try {
    // Add Organization to database
    const newOrganization: OrganizationEntity = {
      ...new OrganizationEntity(),
      name,
      description,
      activationId,
      createdBy: requester,
    }
    const newOrganizationResult = await organizationModel.saveOrganization(
      newOrganization,
    )

    // Create relation between user and organization
    const newOrganizationUser = new OrganizationUserEntity()
    newOrganizationUser.role = USER_ROLE.ADMIN
    newOrganizationUser.user = requester
    newOrganizationUser.organization = newOrganizationResult
    newOrganizationUser.createdBy = requester
    const organizationUserResult =
      await organizationUserModel.saveOrganizationUser(newOrganizationUser)

    // Add Requester to admin at new Organization
    return res.status(201).send({
      id: organizationUserResult.id,
      status: organizationUserResult.status,
      role: organizationUserResult.role,
      organizationId: newOrganizationResult.id,
      organization: {
        id: newOrganizationResult.id,
        name: newOrganizationResult.name,
        description: newOrganizationResult.description,
        status: newOrganizationResult.status,
        createdAt: newOrganizationResult.createdAt,
        updatedAt: newOrganizationResult.updatedAt,
      },
      activationId: newOrganizationResult.activationId,
      createdById: newOrganizationResult.createdBy.id,
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'organization', 'createOrganization', error)
    return next(new HttpException(400, ErrorCode[400]))
  }
}
export const createOrganizationforSocket = async (
  params: any
) => {
  const { name, description, activationId, reqid } = params
  if (!name || !description || !activationId) {
    errorMessage('CONTROLLER', 'organization', 'invalid data')
    return "error400"
  }
  const requester = await userModel.getUserWithId(reqid)

  const activation = await activationModel.getActivationWithId(activationId)
  if (activation) {
    const currentOrganizationCount = activation.organization.length
    const packageLimit = activation.package.organizationLimit
    if (packageLimit !== -1 && currentOrganizationCount >= packageLimit) {
      errorMessage('CONTROLLER', 'organization', 'package limit')
      return "error400"
    }
  } else {
    errorMessage('CONTROLLER', 'organization', 'activation code not found')
    return "error400"
  }

  try {
    // Add Organization to database
    if (requester != undefined) {
      const newOrganization: OrganizationEntity = {
        ...new OrganizationEntity(),
        name,
        description,
        activationId,
        createdBy: requester,
      }
      const newOrganizationResult = await organizationModel.saveOrganization(
        newOrganization,
      )

      // Create relation between user and organization
      const newOrganizationUser = new OrganizationUserEntity()
      newOrganizationUser.role = USER_ROLE.ADMIN
      newOrganizationUser.user = requester
      newOrganizationUser.organization = newOrganizationResult
      newOrganizationUser.createdBy = requester
      const organizationUserResult =
        await organizationUserModel.saveOrganizationUser(newOrganizationUser)

      // Add Requester to admin at new Organization
      return {
        id: organizationUserResult.id,
        status: organizationUserResult.status,
        role: organizationUserResult.role,
        organizationId: newOrganizationResult.id,
        organization: {
          id: newOrganizationResult.id,
          name: newOrganizationResult.name,
          description: newOrganizationResult.description,
          status: newOrganizationResult.status,
          createdAt: newOrganizationResult.createdAt,
          updatedAt: newOrganizationResult.updatedAt,
        },
        activationId: newOrganizationResult.activationId,
        createdById: newOrganizationResult.createdBy.id,
      }
    }

  } catch (error) {
    errorMessage('CONTROLLER', 'organization', 'createOrganization', error)
    return "error400"
  }
}

export const updateOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { organization } = req.body
  // console.log("organization",organization)
  if (!organization || !organization.id) {
    errorMessage('CONTROLLER', 'organization', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const requester: UserEntity = req.body.requester

  const organizationUser = await organizationUserModel.getOrganizationWithId(
    requester,
    organization.id,
  )

  const currentOrganization = organizationUser?.organization
  if (organizationUser && currentOrganization) {
    try {
      if (
        organizationUser.role !== 'admin' ||
        currentOrganization.createdBy.id !== requester.id
      ) {
        errorMessage('CONTROLLER', 'organization', 'Permission Denied')
        res.status(403).json({ message: 'Permission Denied' })
      } else {
        // Save organization to database
        const newOrganization: OrganizationEntity = {
          ...currentOrganization,
          ...organization,
          updatedBy: requester,
        }

        const organizationResult = await organizationModel.saveOrganization(
          newOrganization,
        )
        return res.status(201).send({
          id: organizationUser.id,
          status: organizationUser.status,
          role: organizationUser.role,
          organizationId: organizationResult.id,
          organization: {
            id: organizationResult.id,
            name: organizationResult.name,
            description: organizationResult.description,
            status: organizationResult.status,
            createdAt: organizationResult.createdAt,
            updatedAt: organizationResult.updatedAt,
          },
          activationId: organizationResult.activationId,
          createdById: organizationResult.createdBy.id,
        })
      }
    } catch (error) {
      errorMessage('CONTROLLER', 'organization', 'updateOrganization', error)
      return next(new HttpException(500, ErrorCode[500]))
    }
  } else {
    errorMessage('CONTROLLER', 'organization', 'current organization not found')
    res.status(400).json({ message: ErrorCode[400] })
  }
}
export const updateOrganizationforSocket = async (
  params: any
) => {
  const organization = {
    id: params.id,
    name: params.name,
    description: params.description
  }
  if (!organization || !organization.id) {
    errorMessage('CONTROLLER', 'organization', 'invalid data')
    return "error400"
  }
  const requester = await userModel.getUserWithId(params.reqid)
  // const requester: UserEntity = req.body.requester
  if (requester != undefined) {
    const organizationUser = await organizationUserModel.getOrganizationWithId(
      requester,
      organization.id,
    )

    const currentOrganization = organizationUser?.organization
    if (organizationUser && currentOrganization) {
      try {
        if (
          organizationUser.role !== 'admin' ||
          currentOrganization.createdBy.id !== requester.id
        ) {
          errorMessage('CONTROLLER', 'organization', 'Permission Denied')
          return "error400"
        } else {
          // Save organization to database
          const newOrganization: OrganizationEntity = {
            ...currentOrganization,
            ...organization,
            updatedBy: requester,
          }

          const organizationResult = await organizationModel.saveOrganization(
            newOrganization,
          )
          return {
            id: organizationUser.id,
            status: organizationUser.status,
            role: organizationUser.role,
            organizationId: organizationResult.id,
            organization: {
              id: organizationResult.id,
              name: organizationResult.name,
              description: organizationResult.description,
              status: organizationResult.status,
              createdAt: organizationResult.createdAt,
              updatedAt: organizationResult.updatedAt,
            },
            activationId: organizationResult.activationId,
            createdById: organizationResult.createdBy.id,
          }
        }
      } catch (error) {
        errorMessage('CONTROLLER', 'organization', 'updateOrganization', error)
        return "error400"
      }
    } else {
      errorMessage('CONTROLLER', 'organization', 'current organization not found')
      return "error400"
    }
  }

  // return "erro400"
}

export const deleteOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    errorMessage('CONTROLLER', 'organization', 'invalid parameter')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const requester: UserEntity = req.body.requester

  try {
    const organizationUserResult =
      await organizationUserModel.getOrganizationWithId(requester, id)
    if (!organizationUserResult) {
      errorMessage('CONTROLLER', 'organization', ' Organization not found')
      return next(new HttpException(404, 'organization not found'))
    }
    // Save organization to database
    const newOrganization: OrganizationEntity = {
      ...organizationUserResult.organization,
      isDelete: true,
      updatedBy: requester,
    }
    return res
      .status(201)
      .send(await organizationModel.saveOrganization(newOrganization))
  } catch (error) {
    errorMessage('CONTROLLER', 'organization', 'deleteORganization', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const acceptOrganization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params
    if (!id) {
      errorMessage('CONTROLLER', 'organization', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }
    const requester: UserEntity = req.body.requester
    const organizationUser = await organizationUserModel.getOrganizationWithId(
      requester,
      id,
    )
    await organizationUserModel.saveOrganizationUser({
      ...new OrganizationUserEntity(),
      ...organizationUser,
      status: ORGANIZATION_USER_STATUS.ACTIVE,
    })

    return res.status(200).json({ message: 'success' })
  } catch (error) {
    errorMessage('CONTROLLER', 'organization', 'getOrganization', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const acceptOrganizationforSocket = async (
  params: any
) => {
  try {
    const { id, reqid } = params
    if (!id) {
      errorMessage('CONTROLLER', 'organization', 'invalid parameter')
      return "error400"
    }
    const requester = await userModel.getUserWithId(reqid)
    if (requester != undefined) {
      const organizationUser = await organizationUserModel.getOrganizationWithId(
        requester,
        id,
      )
      await organizationUserModel.saveOrganizationUser({
        ...new OrganizationUserEntity(),
        ...organizationUser,
        status: ORGANIZATION_USER_STATUS.ACTIVE,
      })

      return { message: 'success' }
    }

  } catch (error) {
    errorMessage('CONTROLLER', 'organization', 'getOrganization', error)
    return "error400"
  }
}

export const getWorkingHours = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params
    if (!id) {
      errorMessage('CONTROLLER', 'organization', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const requester: UserEntity = req.body.requester
    const organization = await organizationUserModel.getOrganizationWithId(
      requester,
      id,
    )
    if (!organization) {
      errorMessage('CONTROLLER', 'organization', 'organization(id) not found')
      return next(new HttpException(404, 'organization not found'))
    }
    const permission = await permissionModel.getPermissionWithRole(
      organization.role,
    )
    if (!permission) {
      errorMessage('CONTROLLER', 'organization', 'permission not found')
      return next(new HttpException(404, 'organization not found'))
    }

    return res.status(200).json({
      id: organization.id,
      organization: {
        id: organization.organization.id,
        sunday: organization.organization.sunday,
        monday: organization.organization.monday,
        tuesday: organization.organization.tuesday,
        wednesday: organization.organization.wednesday,
        thursday: organization.organization.thursday,
        friday: organization.organization.friday,
        saturday: organization.organization.saturday,
        workingHoursMessage: organization.organization.workingHoursMessage,
      },
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'organization', 'getWorkingHours', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getMotopress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params
    if (!id) {
      errorMessage('CONTROLLER', 'organization', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const requester: UserEntity = req.body.requester
    const organization = await organizationUserModel.getOrganizationWithId(
      requester,
      id,
    )
    if (!organization) {
      errorMessage('CONTROLLER', 'organization', 'organization(id) not found')
      return next(new HttpException(404, 'organization not found'))
    }
    const permission = await permissionModel.getPermissionWithRole(
      organization.role,
    )
    if (!permission) {
      errorMessage('CONTROLLER', 'organization', 'permission not found')
      return next(new HttpException(404, 'organization not found'))
    }

    return res.status(200).json({
      id: organization.id,
      organization: {
        id: organization.organization.id,
        motopressUrl: organization.organization.motopressUrl,
        motopressConsumerKey: organization.organization.motopressConsumerKey,
        motopressConsumerSecret:
          organization.organization.motopressConsumerSecret,
        lineNotify: organization.organization.lineNotify,
      },
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'organization', 'getWorkingHours', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getOrganizationState = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {

    const { id } = req.params
    if (!id) {
      errorMessage('CONTROLLER', 'organization', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const requester: UserEntity = req.body.requester
    // const organization: OrganizationEntity = req.body.organization

    const organization = await organizationUserModel.getOrganizationWithId(
      requester,
      id,
    )

    if (!organization) {
      errorMessage('CONTROLLER', 'organization', 'organization(id) not found')
      return next(new HttpException(404, 'organization not found'))
    }

    let hqUnread = 0
    const hqSetting = await teamChatHQSettingModel.getHQSetting(
      requester.id,
      organization.organizationId,
    )

    if (!hqSetting) {
      hqUnread = await teamChatHQSettingModel.countHQMessageAfterDateTime(
        requester.createdAt,
        organization.organizationId,
      )
    } else {
      hqUnread = await teamChatHQSettingModel.countHQMessageAfterDateTime(
        hqSetting.readAt,
        organization.organizationId,
      )
    }

    const myChannelsResult =
      await teamChatChannelMemberModel.getChannelsWithMember(
        requester.id,
        organization.organization,
      )

    let cmUnreads = 0

    for (let index = 0; index < myChannelsResult.length; index++) {
      let cmUnread = 0
      const { channelId } = myChannelsResult[index]
      const channelReadLastest =
        await teamChatMentionModel.getChannelReadLastest(
          requester.id,
          channelId,
          organization.organization,
        )

      if (!channelReadLastest) {
        cmUnread = await teamChatMentionModel.countChannelReadAfterDateTime(
          requester.createdAt,
          channelId,
          organization.organization,
        )
      } else {
        cmUnread = await teamChatMentionModel.countChannelReadAfterDateTime(
          channelReadLastest.readAt,
          channelId,
          organization.organization,
        )
      }
      cmUnreads = cmUnreads + cmUnread
    }

    let dmUnreads = 0
    const userList = await organizationUserModel.getUsers(
      organization.organizationId,
    )
    for (let index = 0; index < userList.length; index++) {
      let dmUnread = 0
      const { userId } = userList[index]
      const directReadLastest = await teamChatDmSettingModel.getDmLastest(
        requester.id,
        userId,
        organization.organizationId,
      )
      if (!directReadLastest) {
        dmUnread = await teamChatDmSettingModel.countDmMessageAfterDateTime(
          requester.createdAt,
          requester.id,
          userId,
          organization.organization,
        )
      } else {
        dmUnread = await teamChatDmSettingModel.countDmMessageAfterDateTime(
          directReadLastest.readAt,
          requester.id,
          userId,
          organization.organization,
        )
      }
      dmUnreads = dmUnreads + dmUnread
    }

    let unread = hqUnread + cmUnreads + dmUnreads

    return res.status(200).json({
      isRead: {
        teamChat: unread,
        dmMessage: dmUnreads,
      },
    })
  } catch (error) {
    errorMessage('CONTROLLER', 'organization', 'getOrganization', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getOrganizationStateforSocket = async (params: any) => {
  try {
    const id = params.oid
    const requesterId = params.uid
    const requester = await userModel.getUserWithId(params.uid)
    const userList = await organizationUserModel.getUsers(id)

    // const organization = await organizationModel.getOrganizationWithId(params.oid)


    if (!id) {
      errorMessage('CONTROLLER', 'organization', 'invalid parameter')
      return "error400";
    }


    // const organization: OrganizationEntity = req.body.organization
    if (requester != undefined) {
      const organization = await organizationUserModel.getOrganizationWithId(
        requester,
        id,
      )

      if (!organization) {
        errorMessage('CONTROLLER', 'organization', 'organization(id) not found')
        return "error400";
      }

      let hqUnread = 0
      const hqSetting = await teamChatHQSettingModel.getHQSetting(
        requester.id,
        organization.organizationId,
      )

      if (!hqSetting) {
        hqUnread = await teamChatHQSettingModel.countHQMessageAfterDateTime(
          requester.createdAt,
          organization.organizationId,
        )
      } else {
        hqUnread = await teamChatHQSettingModel.countHQMessageAfterDateTime(
          hqSetting.readAt,
          organization.organizationId,
        )
      }

      const myChannelsResult =
        await teamChatChannelMemberModel.getChannelsWithMember(
          requester.id,
          organization.organization,
        )

      let cmUnreads = 0

      for (let index = 0; index < myChannelsResult.length; index++) {
        let cmUnread = 0
        const { channelId } = myChannelsResult[index]
        const channelReadLastest =
          await teamChatMentionModel.getChannelReadLastest(
            requester.id,
            channelId,
            organization.organization,
          )

        if (!channelReadLastest) {
          cmUnread = await teamChatMentionModel.countChannelReadAfterDateTime(
            requester.createdAt,
            channelId,
            organization.organization,
          )
        } else {
          cmUnread = await teamChatMentionModel.countChannelReadAfterDateTime(
            channelReadLastest.readAt,
            channelId,
            organization.organization,
          )
        }
        cmUnreads = cmUnreads + cmUnread
      }

      let dmUnreads = 0

      for (let index = 0; index < userList.length; index++) {
        let dmUnread = 0
        const { userId } = userList[index]
        const directReadLastest = await teamChatDmSettingModel.getDmLastest(
          requester.id,
          userId,
          organization.organizationId,
        )
        if (!directReadLastest) {
          dmUnread = await teamChatDmSettingModel.countDmMessageAfterDateTime(
            requester.createdAt,
            requester.id,
            userId,
            organization.organization,
          )
        } else {
          dmUnread = await teamChatDmSettingModel.countDmMessageAfterDateTime(
            directReadLastest.readAt,
            requester.id,
            userId,
            organization.organization,
          )
        }
        dmUnreads = dmUnreads + dmUnread
      }

      let unread = hqUnread + cmUnreads + dmUnreads

      return ({
        isRead: {
          teamChat: unread,
          dmMessage: dmUnreads,
        },
      })
    }
    else return "error400";
  } catch (error) {
    errorMessage('CONTROLLER', 'organization', 'getOrganization', error)
    return "error500"
  }
}

