import { NextFunction, Request, Response } from 'express'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  OrganizationEntity,
  UserEntity,
  organizationModel,
  userModel
} from '../../model/organization'
import {
  TaskEntity,
  taskModel,
  taskTagModel,
  TaskTagEntity
} from '../../model/tasks'

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let tasks: TaskEntity[]
    const { filter, tag } = req.query
    console.log("gettasks:",tag)
    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    tasks = await taskModel.getTasks(organization)

    if (!tasks) {
      errorMessage('CONTROLLER', 'task', 'get tasks')
      return next(new HttpException(500, ErrorCode[500]))
    }

    // filter Tag
    if (tag && typeof tag === 'string') {
      // const inputTag =  tag.split(",")
      tasks = tasks.filter((task, index) => {
        const tagsObj = task.tags
        // no tag
        if (!tagsObj || tagsObj.length <= 0) return false
        // Get Tag text from Object
        const tags = tagsObj.map((element) => element.title.toLowerCase())

        // Return with SOME tag
        // return tags.some(element => element.includes(tag));
        return tags.includes(tag);
        // Return with ALL tag
        // return inputTag.every(element => tags.includes(element));
        // return false
      })
    }

    return res.status(200).send(tasks)

  } catch (error) {
    errorMessage('CONTROLLER', 'task', 'getTasks', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getTasksforSocket = async (
  params: any
) => {
  const { tag,  orgId } = params
  const organization = await organizationModel.getOrganizationWithId(orgId)
  try {
    if (organization != undefined) {
      let tasks: TaskEntity[]
      tasks = await taskModel.getTasks(organization)
      if (!tasks) {
        errorMessage('CONTROLLER', 'task', 'get tasks')
        return "error400"
      }
      if (tag && typeof tag === 'string') {
        tasks = tasks.filter((task, index) => {
          const tagsObj = task.tags
          if (!tagsObj || tagsObj.length <= 0) return false
          const tags = tagsObj.map((element) => element.title.toLowerCase())
          return tags.includes(tag);
        })
      }
      return tasks
    }

  } catch (error) {
    errorMessage('CONTROLLER', 'task', 'getTasks', error)
    return "error400"
  }
}

export const getTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization
    const { id } = req.query
    console.log("org", id)
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'task', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await taskModel.getTaskWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'task', 'task not found')
      return next(new HttpException(404, 'task not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'task', 'getTask', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const getTaskforSocket = async (
  params: any
) => {
  const { task, orgId } = params
  const organization = await organizationModel.getOrganizationWithId(orgId)
  const id = task
  
  try {
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'task', 'invalid parameter')
      return "error400"
    }
    if (organization != undefined) {
      const result = await taskModel.getTaskWithId(id, organization)
      if (!result) {
        errorMessage('CONTROLLER', 'task', 'task not found')
        return "error400"
      }
      return result
    }

  } catch (error) {
    errorMessage('CONTROLLER', 'task', 'getTask', error)
    return "error400"
  }
}

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { task } = req.body
    if (!task || task.id) {
      errorMessage('CONTROLLER', 'task', 'invalid data')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    let newTag = task.tags
    if (task && task.tags && task.tags.length > 0) {
      newTag = await task.tags.map((tag: any) => {
        if (!tag.id) {
          tag.organization = organization
          tag.createdBy = requester
        }
        return tag
      })
    }
    // Get order index for new task
    const maxOrderIndex = await taskModel.getMaxOrderIndex()

    // Add task to database
    const newTask: TaskEntity = {
      ...task,
      tags: newTag,
      orderIndex: maxOrderIndex,
      organization,
      createdBy: requester,
    }
    return res.status(201).send(await taskModel.saveTask(newTask))
  } catch (error) {
    errorMessage('CONTROLLER', 'task', 'createTask', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const createTaskforSocket = async (
  params:any
) => {
  try {
    const { task,  reqid, orgId } = params
    const requester = await userModel.getUserWithId(reqid)
    const organization = await organizationModel.getOrganizationWithId(orgId)
    if (!task || task.id) {
      errorMessage('CONTROLLER', 'task', 'invalid data')
      return "error400"
    }
    

    let newTag = task.tags
    if (task && task.tags && task.tags.length > 0) {
      newTag = await task.tags.map((tag: any) => {
        if (!tag.id) {
          tag.organization = organization
          tag.createdBy = requester
        }
        return tag
      })
    }
    // Get order index for new task
    const maxOrderIndex = await taskModel.getMaxOrderIndex()

    // Add task to database
    const newTask: TaskEntity = {
      ...task,
      tags: newTag,
      orderIndex: maxOrderIndex,
      organization,
      createdBy: requester,
    }
    return await taskModel.saveTask(newTask)
  } catch (error) {
    errorMessage('CONTROLLER', 'task', 'createTask', error)
    return "error400"
  }
}
export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { task } = req.body
    console.log("update:",task.id)
    if (!task || !task.id) {
      errorMessage('CONTROLLER', 'task', 'invalid data')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester
    let newTag: TaskTagEntity[] = []
    if (task && task.tags && task.tags.length > 0) {
      for (let i = 0; i < task.tags.length; i++) {
        let tag = task.tags[i] as TaskTagEntity
        if (!tag.id) {
          let isDuplicate = (await taskTagModel.getTagWithTitle(
            tag.title,
            organization,
          )) as TaskTagEntity
          if (isDuplicate) {
            tag = isDuplicate
          } else {
            // tag.color = stringToColor(tag.title)
            tag.organization = organization
            tag.createdBy = requester
          }
        }
        newTag.push(tag)
      }
    }
    // Save task to database
    const newTask: TaskEntity = {
      ...task,
      tags: newTag,
      organization,
      updatedBy: requester,
    }
    return res.status(201).send(await taskModel.saveTask(newTask))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'updateTask', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
export const updateTaskforSocket = async (
  params: any
) => {
  try {
    const { task, reqid, orgId } = params
    const requester = await userModel.getUserWithId(reqid)
    const organization = await organizationModel.getOrganizationWithId(orgId)
    // const { task } = req.body
    if (!task || !task.id) {
      errorMessage('CONTROLLER', 'task', 'invalid data')
      return "error400"
    }

    // const organization: OrganizationEntity = req.body.organization
    // const requester: UserEntity = req.body.requester
    let newTag: TaskTagEntity[] = []
    if ((organization != undefined) && (requester != undefined)) {
      if (task && task.tags && task.tags.length > 0) {
        for (let i = 0; i < task.tags.length; i++) {
          let tag = task.tags[i] as TaskTagEntity
          if (!tag.id) {
            let isDuplicate = (await taskTagModel.getTagWithTitle(
              tag.title,
              organization,
            )) as TaskTagEntity
            if (isDuplicate) {
              tag = isDuplicate
            } else {
              // tag.color = stringToColor(tag.title)
              tag.organization = organization
              tag.createdBy = requester
            }
          }
          newTag.push(tag)
        }
      }
      // Save task to database
      const newTask: TaskEntity = {
        ...task,
        tags: newTag,
        organization,
        updatedBy: requester,
      }
      return await taskModel.saveTask(newTask)
    }

  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'updateTask', error)
    return "error400"
  }
}

export const updateTasksOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { startIndex, endIndex } = req.body
    if (typeof startIndex !== 'number' || typeof endIndex !== 'number') {
      errorMessage('CONTROLLER', 'task', 'invalid reorder data')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    const rawTasks = await taskModel.getTasks(organization)

    const ordered = reorder(rawTasks, startIndex, endIndex)

    const tasksOrder = ordered.map((task: { id: any }, index: any) => ({
      id: task.id,
      orderIndex: index,
    }))

    for (const task of tasksOrder) {
      await taskModel.updateOrderIndex(
        task.id,
        task.orderIndex,
        requester,
      )
    }

    const tasks = await taskModel.getTasks(organization)

    return res.status(201).send(tasks)
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'reorderTasks', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'task', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    await taskModel.deleteTask(id, requester)

    const rawTasks = await taskModel.getTasks(organization)

    // Update Order Index
    rawTasks.forEach((task: TaskEntity) => {
      taskModel.updateOrderIndex(task.id, task.orderIndex, requester)
    })

    return res.status(200).send(id)
  } catch (error) {
    errorMessage('CONTROLLER', 'tram', 'deleteTask', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

const reorder = (arr: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(arr)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}
