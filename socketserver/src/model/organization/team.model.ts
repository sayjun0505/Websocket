import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository,In } from 'typeorm'
import { OrganizationEntity, TeamEntity } from '.'

export const getTeams = async (organization: OrganizationEntity) => {
  return await getRepository(TeamEntity).find({
    where: {
      organization,
      isDelete: false,
    },
    select:['createdAt','id','name','organizationUser'],
    relations: ['organizationUser'],
  })
}

export const getTeamWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TeamEntity).findOne({
    where: {
      id,
      organization,
      isDelete: false,
    },
    select:['createdAt','updatedAt','id','name'],
    // relations: ['organizationUser'],
  })
}

export const saveTeam = async (team: TeamEntity) => {
  try {
    return await getRepository(TeamEntity).save(team)
  } catch (error) {
    errorMessage('MODEL', 'team', 'saveTeam', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
