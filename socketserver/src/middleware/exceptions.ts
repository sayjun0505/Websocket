import { NextFunction, Request, Response } from 'express'

export class HttpException {
  status: number
  message: string
  constructor(status: number, message: string = '') {
    this.status = status
    this.message = message
  }
}
export const routeDefaultNotFound = (
  req: Request,
  res: Response,
  next: NextFunction,
) => next(new HttpException(404, `${req.url} not found`))

export const routeError = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let errMsgLog
  try {
    errMsgLog = JSON.stringify(error)
    errMsgLog = errMsgLog.replace(/[[\]]/g, '')
  } catch (e) {
    errMsgLog = error
  }
  console.error('[ROUTE][ERROR]', error.status, errMsgLog)

  const status = error.status || 500
  const message = error.message || 'Unknown Error'

  // Response Status
  if (status) res.status(status)
  // Response Error Message
  res.send({ status, error: message })
  return
}

export const logErrors = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err) {
    console.error('[Log][API][ERROR] ', err)
    next(err)
  }
}
export const log = (req: Request, res: Response, next: NextFunction) => {
  // tslint:disable-next-line:no-console
  // console.info('[Log][API][INFO] ', req.path)
  next()
}

export const ErrorCode = {
  400: 'bad_request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  408: 'request_timeout',
  500: 'internal_server_error',
  501: 'not_implemented',
  502: 'bad_gateway',
  503: 'service_unavailable',
}

export const errorMessage = (
  type: 'MODEL' | 'CONTROLLER' | string,
  filename: string,
  message: string,
  error?: Error | HttpException | string | unknown,
) => {
  if (type && filename && message) {
    console.error(
      '[ERROR][' + type.toUpperCase() + '][' + filename + ']',
      message,
    )
  }
  if (error) {
    if (typeof error === 'string') {
      console.error(
        '[ERROR][' + type.toUpperCase() + '][' + filename + ']',
        error,
      )
    } else if (error instanceof Error || error instanceof HttpException) {
      console.error(
        '[ERROR][' + type.toUpperCase() + '][' + filename + ']',
        error.message,
      )
    } else {
      console.error(
        '[ERROR][' + type.toUpperCase() + '][' + filename + '] unknown',
      )
    }
  }
}
