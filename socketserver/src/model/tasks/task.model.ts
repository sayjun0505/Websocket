import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, Between, Not, MoreThan } from 'typeorm'
import { TaskEntity } from '.'
import { OrganizationEntity, UserEntity } from '../organization'

export const getTasks = async (organization: OrganizationEntity) => {
  return await getRepository(TaskEntity).find({
    where: {
      organization,
      isDelete: false,
    },
    order: { orderIndex: 'ASC' },
    relations: [
      'createdBy',
      'updatedBy',
      'tags',
      'organizationUser',
      'organizationUser.user',
    ],
  })
}

export const getMaxOrderIndex = async () => {
  // const tasks = await gettasks(organization, board)
  // if (tasks.length > 0) {
  //   return tasks[tasks.length - 1].orderIndex
  // } else {
  //   return -1
  // }
  return await getRepository(TaskEntity).count({
    where: {
      isDelete: false,
    },
  })
}

export const getDeletedTasks = async (organization: OrganizationEntity) => {
  return await getRepository(TaskEntity).find({
    where: {
      organization,
      isDelete: true,
    },
    relations: ['createdBy', 'updatedBy', 'tags', 'organizationUser','organizationUser.user'],
  })
}

export const getStarredTasks = async (organization: OrganizationEntity) => {
  return await getRepository(TaskEntity).find({
    where: {
      starred: true,
      organization,
      isDelete: false,
    },
    relations: ['createdBy', 'updatedBy', 'tags', 'organizationUser','organizationUser.user'],
  })
}

export const getImportantTasks = async (organization: OrganizationEntity) => {
  return await getRepository(TaskEntity).find({
    where: {
      important: true,
      organization,
      isDelete: false,
    },
    relations: ['createdBy', 'updatedBy', 'tags', 'organizationUser','organizationUser.user'],
  })
}

export const getCompletedTasks = async (organization: OrganizationEntity) => {
  return await getRepository(TaskEntity).find({
    where: {
      completed: true,
      organization,
      isDelete: false,
    },
    relations: ['createdBy', 'updatedBy', 'tags', 'organizationUser','organizationUser.user'],
  })
}

export const getDueDateTasks = async (organization: OrganizationEntity) => {
  return await getRepository(TaskEntity).find({
    where: {
      dueDate: MoreThan(new Date()),
      // dueDate: Not(null),
      organization,
      isDelete: false,
    },
    relations: ['createdBy', 'updatedBy', 'tags', 'organizationUser','organizationUser.user'],
  })
}

export const getTodayTasks = async (organization: OrganizationEntity) => {
  return await getRepository(TaskEntity).find({
    where: {
      // dueDate: Between(new Date(), new Date(new Date().setDate(new Date().getDate() + 1))),
      dueDate: Between(new Date(), new Date(new Date().setHours(23, 59, 59, 999))),
      organization,
      isDelete: false,
    },
    // relations: ['createdBy', 'updatedBy', 'tags', 'organizationUser','organizationUser.user'],
  })
}

export const getTaskWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TaskEntity).findOne({
    where: {
      id,
      organization,
    },
    relations: ['createdBy', 'updatedBy', 'tags', 'organizationUser','organizationUser.user'],
    // relations: ['tags'],
  })
}

export const getTaskWithCardId = async (
  cardId: string,
  userId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TaskEntity).findOne({
    where: {
      cardId,
      userId,
      organization,
    },
  })
}

export const saveTask = async (task: TaskEntity) => {
  try {
    return await getRepository(TaskEntity).save(task)
  } catch (error) {
    errorMessage('MODEL', 'task', 'saveTask', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const updateOrderIndex = async (
  taskId: string,
  orderIndex: number,
  updatedBy: UserEntity,
) => {
  try {
    const result = await getRepository(TaskEntity).update(
      { id: taskId },
      { orderIndex, updatedBy },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'task', 'updateTask orderIndex', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const deleteTask = async (id: string, updatedBy: UserEntity) => {
  try {
    const result = await getRepository(TaskEntity).update(
      { id },
      { isDelete: true, updatedBy },
    )
    return result
  } catch (error) {
    errorMessage('MODEL', 'task', 'deleteTask', error)
    throw new HttpException(500, ErrorCode[500])
  }
}

export const getRecentTasks = async (organization: OrganizationEntity) => {
  return await getRepository(TaskEntity).find({
    where: {
      organization,
      isDelete: false,
    },
    order: { orderIndex: 'DESC' },
    relations: [
      'createdBy',
      'updatedBy',
      'tags',
      'organizationUser',
      'organizationUser.user',
    ],
  })
}
