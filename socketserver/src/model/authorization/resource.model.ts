import { getRepository } from 'typeorm'
import { ResourceEntity } from '.'

export const getResources = async () => {
  return await getRepository(ResourceEntity).find({
    relations: ['permission'],
  })
}
