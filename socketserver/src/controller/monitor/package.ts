import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  OrganizationEntity,
  organizationModel,
  ORGANIZATION_STATUS,
  UserEntity,
} from '../../model/organization'

import {
  getCountChannel,
  getCountMessage,
  getCountUser,
  getOrganizations,
} from '../../model/monitor/package'

import { keywordModel, ReplyKeywordEntity } from '../../model/reply'

export const checkAllOrganizationPackage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organizations = await getOrganizations()
    if (!organizations) {
      errorMessage('CONTROLLER', 'monitor', 'organization not found')
      res.status(404).json({ message: ErrorCode[404] })
    }

    organizations.forEach(async (organization) => {
      const message = await getCountMessage(organization.id)
      const channel = await getCountChannel(organization.id)
      const user = await getCountUser(organization.id)

      const result = {
        id: organization.id,
        message,
        messageLimit: organization.activation.package.messageLimit,
        channel,
        channelLimit: organization.activation.package.channelLimit,
        user,
        userLimit: organization.activation.package.userLimit,
      }

      if (result.message > result.messageLimit) {
        organizationModel.saveOrganization({
          ...organization,
          status: ORGANIZATION_STATUS.SUSPEND,
        })
      } else if (result.message > result.messageLimit * 0.8) {
        organizationModel.saveOrganization({
          ...organization,
          status: ORGANIZATION_STATUS.WARNING,
        })
      } else {
        organizationModel.saveOrganization({
          ...organization,
          status: ORGANIZATION_STATUS.ACTIVE,
        })
      }
    })

    return res.status(200).send()
  } catch (error) {
    errorMessage('CONTROLLER', 'monitor', 'checkAllOrganizationPackage', error)
    // return next(new HttpException(200, ErrorCode[2]))
    res.status(200).json({ message: '' })
  }
}
