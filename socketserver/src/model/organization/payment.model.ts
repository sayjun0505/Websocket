import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { getRepository } from 'typeorm'

import { PaymentEntity } from '.'
import {} from './payment.entity'

export const getPaymentWithId = async (id: string) => {
  return await getRepository(PaymentEntity).findOne({
    where: {
      id,
    },
    relations: ['activation', 'activation.createdBy', 'activation.package'],
  })
}

export const getPaymentWithActivationId = async (activationId: string) => {
  return await getRepository(PaymentEntity).find({
    where: {
      activationId,
    },
    order: {
      paymentAt:"ASC",
    },
  })
}

export const savePayment = async (payment: PaymentEntity) => {
  try {
    return await getRepository(PaymentEntity).save(payment)
  } catch (error) {
    errorMessage('MODEL', 'payment', 'savePayment', error)
    throw new HttpException(500, ErrorCode[500])
  }
}
