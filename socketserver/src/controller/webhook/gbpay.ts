import { NextFunction, Request, Response } from 'express'
import * as crypto from 'crypto'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'
import { channelModel } from '../../model/channel'
import {
  activationModel,
  OrganizationEntity,
  paymentModel,
  UserEntity,
} from '../../model/organization'
import {
  chatModel,
  MessageEntity,
  messageModel,
  MESSAGE_TYPE,
} from '../../model/chat'
import { ChannelEntity } from '../../model/channel/channel.entity'
import { lineService } from '../../service/channel'
import { gcsService } from '../../service/google'
import { MESSAGE_DIRECTION } from '../../model/chat/message.entity'
import { ChatEntity } from '../../model/chat/chat.entity'
import { CustomerEntity } from '../../model/customer/customer.entity'
import { customerModel } from '../../model/customer'
import * as channelService from '../../service/channel'
import * as replyService from '../../service/reply'
import { notificationUtil, workingHoursUtil } from '../../util'
import { sseController } from '../sse'
import { PaymentEntity } from '../../model/organization/payment.entity'
import {
  ActivationEntity,
  ACTIVATION_STATUS,
  PAYMENT_OPTION,
} from '../../model/organization/activation.entity'

export const receivePaymentResponse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    cardNo,
    gbpReferenceNo,
    referenceNo,
    thbAmount,
    resultCode,
    paymentType,
    date,
    time,
  } = req.body

  let activation = await activationModel.getActivationWithReferenceNo(
    referenceNo,
  )

  const paymentAt = new Date(
    `${date.substr(4, 4)}-${date.substr(2, 2)}-${date.substr(
      0,
      2,
    )}T${time.substr(0, 2)}:${time.substr(2, 2)}:${time.substr(4, 2)}Z`,
  )

  if (activation) {
    /**
     * Update Activation
     */

    const expiration = activation.expiration
      ? activation.expiration
      : new Date()

    // Extend expiration date
    // if (activation.paymentOption === PAYMENT_OPTION.YEARLY) {
    //   expiration.setFullYear(expiration.getFullYear() + 1)
    // } else if (activation.paymentOption === PAYMENT_OPTION.HALF_YEARLY) {
    //   expiration.setFullYear(expiration.getFullYear() + 6)
    // } else if (activation.paymentOption === PAYMENT_OPTION.QUARTERLY) {
    //   expiration.setFullYear(expiration.getFullYear() + 4)
    // } else if (activation.paymentOption === PAYMENT_OPTION.MONTHLY) {
    //   expiration.setFullYear(expiration.getFullYear() + 1)
    // }

    // Update Activation to database
    activation = await activationModel.saveActivation({
      ...activation,
      status: ACTIVATION_STATUS.ACTIVE,
      expiration,
      referenceNo: cardNo ? activation.referenceNo : `${Date.now()}`,
    })

    await paymentModel.savePayment({
      ...new PaymentEntity(),
      gbpReferenceNo,
      amount: Number(thbAmount),
      resultCode,
      paymentType,
      paymentAt,
      activation,
      cardNo: cardNo || '',
    })
  } else {
    await paymentModel.savePayment({
      ...new PaymentEntity(),
      gbpReferenceNo,
      amount: Number(thbAmount),
      resultCode,
      paymentType,
      paymentAt,
      cardNo: cardNo || '',
    })
  }

  res.status(200).send({
    code: 'received',
  })
}
