import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  OrganizationEntity,
  TeamEntity,
  teamModel,
  UserEntity,
} from '../../model/organization'
import {  organizationModel} from '../../model/organization'
export const getTeams = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const result = await teamModel.getTeams(organization)
    if (!result) {
      errorMessage('CONTROLLER', 'team', 'get teams')
      return next(new HttpException(500, ErrorCode[500]))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'team', 'getTeams', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}


export const getTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { id } = req.params
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'team', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await teamModel.getTeamWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'team', 'team not found')
      return next(new HttpException(404, 'team not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'team', 'getTeam', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name } = req.body
  if (!name) {
    errorMessage('CONTROLLER', 'team', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    // Add team to database
    const newTeam: TeamEntity = {
      ...new TeamEntity(),
      name,
      organization,
      createdBy: requester,
      isDelete: false,
      organizationUser: [],
    }
    return res.status(201).send(await teamModel.saveTeam(newTeam))
  } catch (error) {
    errorMessage('CONTROLLER', 'team', 'createTeam', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, name } = req.body
  if (!name || !id) {
    errorMessage('CONTROLLER', 'team', 'invalid data(team)')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  // Get current Team
  const result = await teamModel.getTeamWithId(id, organization)
  if (!result) {
    errorMessage('CONTROLLER', 'team', 'data(team) not found')
    return next(new HttpException(404, ErrorCode[404]))
  }

  try {
    // Save team to database
    const newTeam: TeamEntity = {
      ...result,
      id,
      name,
      organization,
      updatedBy: requester,
    }
    return res.status(201).send(await teamModel.saveTeam(newTeam))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'updateTeam', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteTeam = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params
  if (!id || typeof id !== 'string') {
    errorMessage('CONTROLLER', 'team', 'invalid parameter')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    const result = await teamModel.getTeamWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'team', ' Team not found')
      return next(new HttpException(404, 'team not found'))
    }
    // Save team to database
    const newTeam: TeamEntity = {
      ...result,
      isDelete: true,
      updatedBy: requester,
    }
    return res.status(201).send(await teamModel.saveTeam(newTeam))
  } catch (error) {
    errorMessage('CONTROLLER', 'tram', 'deleteTeam', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getTeamsforSocket = async (
  params:string
) => {
  try {
    const _organization = await organizationModel.getOrganizationWithId(params)
    if(_organization!=undefined){      
      const result = await teamModel.getTeams(_organization)
      if (!result) {
        errorMessage('CONTROLLER', 'team', 'get teams')
        return "error500"
      }
      return result
    }
  } catch (error) {
    errorMessage('CONTROLLER', 'team', 'getTeams', error)
    return "error500"
  }
}

export const getTeamforSocket = async (
  params:any
) => {
  try {
    const organization: OrganizationEntity = params.organization

    const { id } = params
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'team', 'invalid parameter')
      return "error400"
    }

    const result = await teamModel.getTeamWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'team', 'team not found')
      return "error404"
    }
    return result
  } catch (error) {
    errorMessage('CONTROLLER', 'team', 'getTeam', error)
    return "error500"
  }
}

export const createTeamforSocket = async (
  params:any
) => {
  const { name } = params
  if (!name) {
    errorMessage('CONTROLLER', 'team', 'invalid data')
    return "error400"
  }

  const organization: OrganizationEntity = params.organization
  const requester: UserEntity = params.requester

  try {
    // Add team to database
    const newTeam: TeamEntity = {
      ...new TeamEntity(),
      name,
      organization,
      createdBy: requester,
      isDelete: false,
      organizationUser: [],
    }
    return await teamModel.saveTeam(newTeam)
  } catch (error) {
    errorMessage('CONTROLLER', 'team', 'createTeam', error)
    return "error500"
  }
}

export const updateTeamforSocket = async (
  params:any
) => {
  const { id, name } = params
  if (!name || !id) {
    errorMessage('CONTROLLER', 'team', 'invalid data(team)')
    return "error400"
  }

  const organization: OrganizationEntity = params.organization
  const requester: UserEntity = params.requester

  // Get current Team
  const result = await teamModel.getTeamWithId(id, organization)
  if (!result) {
    errorMessage('CONTROLLER', 'team', 'data(team) not found')
    return "error404"
  }

  try {
    // Save team to database
    const newTeam: TeamEntity = {
      ...result,
      id,
      name,
      organization,
      updatedBy: requester,
    }
    return (await teamModel.saveTeam(newTeam))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'updateTeam', error)
    return "error500"
  }
}

export const deleteTeamforSocket = async (
  params: any
) => {
  const { id } = params.params
  if (!id || typeof id !== 'string') {
    errorMessage('CONTROLLER', 'team', 'invalid parameter')
    return "error400"
  }

  const organization: OrganizationEntity = params.organization
  const requester: UserEntity = params.requester

  try {
    const result = await teamModel.getTeamWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'team', ' Team not found')
      return 'team not found'
    }
    // Save team to database
    const newTeam: TeamEntity = {
      ...result,
      isDelete: true,
      updatedBy: requester,
    }
    return (await teamModel.saveTeam(newTeam))
  } catch (error) {
    errorMessage('CONTROLLER', 'tram', 'deleteTeam', error)
    return "error500"
  }
}
