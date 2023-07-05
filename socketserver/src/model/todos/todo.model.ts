import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository, Between, Not, MoreThan } from 'typeorm'
import { TodoEntity } from '.'
import { OrganizationEntity } from '../organization'

export const getTodos = async (organization: OrganizationEntity) => {
  return await getRepository(TodoEntity).find({
    where: {
      organization,
      isDelete: false,
    },
    relations: ['createdBy', 'updatedBy', 'labels', 'organizationUser','organizationUser.user'],
  })
}

export const getDeletedTodos = async (organization: OrganizationEntity) => {
  return await getRepository(TodoEntity).find({
    where: {
      organization,
      isDelete: true,
    },
    relations: ['createdBy', 'updatedBy', 'labels', 'organizationUser','organizationUser.user'],
  })
}

export const getStarredTodos = async (organization: OrganizationEntity) => {
  return await getRepository(TodoEntity).find({
    where: {
      starred: true,
      organization,
      isDelete: false,
    },
    relations: ['createdBy', 'updatedBy', 'labels', 'organizationUser','organizationUser.user'],
  })
}

export const getImportantTodos = async (organization: OrganizationEntity) => {
  return await getRepository(TodoEntity).find({
    where: {
      important: true,
      organization,
      isDelete: false,
    },
    relations: ['createdBy', 'updatedBy', 'labels', 'organizationUser','organizationUser.user'],
  })
}

export const getCompletedTodos = async (organization: OrganizationEntity) => {
  return await getRepository(TodoEntity).find({
    where: {
      completed: true,
      organization,
      isDelete: false,
    },
    relations: ['createdBy', 'updatedBy', 'labels', 'organizationUser','organizationUser.user'],
  })
}

export const getDueDateTodos = async (organization: OrganizationEntity) => {
  return await getRepository(TodoEntity).find({
    where: {
      dueDate: MoreThan(new Date()),
      // dueDate: Not(null),
      organization,
      isDelete: false,
    },
    relations: ['createdBy', 'updatedBy', 'labels', 'organizationUser','organizationUser.user'],
  })
}

export const getTodayTodos = async (organization: OrganizationEntity) => {
  return await getRepository(TodoEntity).find({
    where: {
      // dueDate: Between(new Date(), new Date(new Date().setDate(new Date().getDate() + 1))),
      dueDate: Between(new Date(), new Date(new Date().setHours(23, 59, 59, 999))),
      organization,
      isDelete: false,
    },
    relations: ['createdBy', 'updatedBy', 'labels', 'organizationUser','organizationUser.user'],
  })
}

export const getTodoWithId = async (
  id: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TodoEntity).findOne({
    where: {
      id,
      organization,
    },
    // relations: ['user'],
  })
}

export const getTodoWithCardId = async (
  cardId: string,
  userId: string,
  organization: OrganizationEntity,
) => {
  return await getRepository(TodoEntity).findOne({
    where: {
      cardId,
      userId,
      organization,
    },
  })
}

export const saveTodo = async (todo: TodoEntity) => {
  try {
    return await getRepository(TodoEntity).save(todo)
  } catch (error) {
    errorMessage('MODEL', 'todo', 'saveTodo', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
