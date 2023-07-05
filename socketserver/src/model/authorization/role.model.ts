import { getRepository } from 'typeorm'
import { RoleEntity } from '.'

export const getRoles = async () => {
  return await getRepository(RoleEntity).find({
    relations: ['permission', 'permission.resource'],
  })
}

export const getRole = async (role: string) => {
  return await getRepository(RoleEntity).findOne({
    where: {
      name: role,
    },
    relations: ['permission', 'permission.resource'],
  })
}
