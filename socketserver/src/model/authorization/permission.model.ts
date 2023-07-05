import { getRepository } from 'typeorm'
import { PermissionEntity } from '.'

export const getPermissions = async (role: string, resource: string) => {
  return await getRepository(PermissionEntity).findOne({
    where: {
      role: {
        name: role,
      },
      resource: {
        name: resource,
      },
    },
    relations: ['role', 'resource'],
  })
}

export const getPermissionWithRole = async (role: string) => {
  return await getRepository(PermissionEntity).find({
    where: {
      role: {
        name: role,
      },
    },
    relations: ['role', 'resource'],
  })
}
