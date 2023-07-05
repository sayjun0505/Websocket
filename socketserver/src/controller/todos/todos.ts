import { NextFunction, Request, Response } from 'express'
import { labelModel } from 'src/model/customer'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import {
  OrganizationEntity,
  UserEntity,
} from '../../model/organization'
import {
  TodoEntity,
  todoModel,
  todoLabelModel,
  TodoLabelEntity
} from '../../model/todos'
import { stringToColor } from './label'

export const getTodos = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let todos: TodoEntity[]
    const { folder, filter, label } = req.query

    const organization: OrganizationEntity = req.body.organization
    const requester: UserEntity = req.body.requester

    if (!filter || typeof filter !== 'string') {
      // errorMessage('CONTROLLER', 'todo', 'invalid parameter(filter)')
      // return next(new HttpException(400, ErrorCode[400]))
      return todos = await todoModel.getTodos(organization)
    } else {
      switch (filter.toLowerCase()) {
        case 'deleted':
          todos = await todoModel.getDeletedTodos(organization)
          break
        case 'important':
          todos = await todoModel.getImportantTodos(organization)
          break
        case 'duedate':
          todos = await todoModel.getDueDateTodos(organization)
          break
        case 'today':
          todos = await todoModel.getTodayTodos(organization)
          break
        case 'starred':
          todos = await todoModel.getStarredTodos(organization)
          break
        case 'completed':
          todos = await todoModel.getCompletedTodos(organization)
          break
        default:
          todos = await todoModel.getTodos(organization)
          break
      }
    }

    if (!todos) {
      errorMessage('CONTROLLER', 'todo', 'get todos')
      return next(new HttpException(500, ErrorCode[500]))
    }

    // filter Label
    if(label && typeof label === 'string'){
      // const inputLabel =  label.split(",")
      todos = todos.filter((todo,index) => {
        const labelsObj = todo.labels
        // no label
        if(!labelsObj || labelsObj.length <= 0) return false
        // Get Label text from Object
        const labels = labelsObj.map((element) => element.title.toLowerCase())

        // Return with SOME label
        // return labels.some(element => element.includes(label));
        return labels.includes(label);
        // Return with ALL label
        // return inputLabel.every(element => labels.includes(element));
        // return false
      })
    }

    return res.status(200).send(todos)
    
  } catch (error) {
    errorMessage('CONTROLLER', 'todo', 'getTodos', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const getTodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const organization: OrganizationEntity = req.body.organization

    const { id } = req.query
    if (!id || typeof id !== 'string') {
      errorMessage('CONTROLLER', 'todo', 'invalid parameter')
      return next(new HttpException(400, ErrorCode[400]))
    }

    const result = await todoModel.getTodoWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'todo', 'todo not found')
      return next(new HttpException(404, 'todo not found'))
    }
    return res.status(200).send(result)
  } catch (error) {
    errorMessage('CONTROLLER', 'todo', 'getTodo', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const createTodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { todo } = req.body  
  if (!todo || todo.id) {
    errorMessage('CONTROLLER', 'todo', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  let newLabel = todo.labels
  if(todo  && todo.labels  && todo.labels.length > 0 ){
    newLabel = await todo.labels.map((label: any)=> {
      if(!label.id){
        label.color = stringToColor(label.title)
        label.organization = organization
        label.createdBy = requester
      }
      return label
    })
  }
  try {
    // Add todo to database
    const newTodo: TodoEntity = {
      ...todo,
      labels: newLabel,
      organization,
      createdBy: requester,
    }
    return res.status(201).send(await todoModel.saveTodo(newTodo))
  } catch (error) {
    errorMessage('CONTROLLER', 'todo', 'createTodo', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const updateTodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { todo } = req.body
  if (!todo || !todo.id) {
    errorMessage('CONTROLLER', 'todo', 'invalid data')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester
  let newLabel: TodoLabelEntity[] = []
  for(let i = 0; i < todo.labels.length; i ++) {
    let label = todo.labels[i] as TodoLabelEntity
    if (!label.id) {
      let isDuplicate = await todoLabelModel.getLabelWithTitle(label.title, organization) as TodoLabelEntity
      if (isDuplicate){
        label = isDuplicate
      }else{
        label.color = stringToColor(label.title)
        label.organization = organization
        label.createdBy = requester
      }
    }
    newLabel.push(label)
  } 
  try {
    // Save todo to database
    const newTodo: TodoEntity = {
      ...todo,
      labels: newLabel,
      organization,
      updatedBy: requester,
    }
    return res.status(201).send(await todoModel.saveTodo(newTodo))
  } catch (error) {
    errorMessage('CONTROLLER', 'user', 'updateTodo', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}

export const deleteTodo = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.query
  if (!id || typeof id !== 'string') {
    errorMessage('CONTROLLER', 'todo', 'invalid parameter')
    return next(new HttpException(400, ErrorCode[400]))
  }

  const organization: OrganizationEntity = req.body.organization
  const requester: UserEntity = req.body.requester

  try {
    const result = await todoModel.getTodoWithId(id, organization)
    if (!result) {
      errorMessage('CONTROLLER', 'todo', ' Todo not found')
      return next(new HttpException(404, 'todo not found'))
    }
    // Save todo to database
    const newTodo: TodoEntity = {
      ...result,
      isDelete: true,
      updatedBy: requester,
    }
    return res.status(201).send(await todoModel.saveTodo(newTodo))
  } catch (error) {
    errorMessage('CONTROLLER', 'tram', 'deleteTodo', error)
    return next(new HttpException(500, ErrorCode[500]))
  }
}
