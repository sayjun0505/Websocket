// import { NextFunction, Request, Response } from 'express'
// import { gbPayUtil } from '../../util'
// import {
//   ErrorCode,
//   errorMessage,
//   HttpException,
// } from '../../middleware/exceptions'
// import {
//   activationModel,
//   CreditCardEntity,
//   creditCardModel,
//   PAYMENT_OPTION,
//   UserEntity,
// } from '../../model/organization'

// export const getCreditCards = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const requester: UserEntity = req.body.requester

//     const cards = await creditCardModel.getCreditCards(requester)
//     if (!cards) {
//       errorMessage('CONTROLLER', 'creditCard', 'getCreditCards')
//       return next(new HttpException(500, ErrorCode[500]))
//     }
//     return res.status(200).send(cards)
//   } catch (error) {
//     errorMessage('CONTROLLER', 'creditCard', 'getCreditCards', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }

// export const createCreditCard = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { card, activationId } = req.body
//   if (
//     !card ||
//     !card.name ||
//     !card.number ||
//     !card.expirationMonth ||
//     !card.expirationYear ||
//     !card.token ||
//     !activationId
//   ) {
//     errorMessage('CONTROLLER', 'creditCard', 'invalid data')
//     return next(new HttpException(400, ErrorCode[400]))
//   }

//   /**
//    * Charge Recurring API
//    * https://doc.gbprimepay.com/recurring
//    */
//   const activation = await activationModel.getActivationWithId(activationId)
//   if (!activation) {
//     errorMessage('CONTROLLER', 'creditCard', 'activation not found')
//     return next(new HttpException(400, ErrorCode[400]))
//   } else if (activation.paymentType === 'CreditCard') {
//     let price = 0
//     let interval = 'Y'
//     if (activation.paymentOption === PAYMENT_OPTION.MONTHLY) {
//       interval = 'M'
//       price = activation.package.monthlyPrice
//     } else if (activation.paymentOption === PAYMENT_OPTION.QUARTERLY) {
//       interval = 'Q'
//       price = activation.package.quarterlyPrice
//     } else if (activation.paymentOption === PAYMENT_OPTION.YEARLY) {
//       interval = 'Y'
//       price = activation.package.yearlyPrice
//     }
//     const recurring = await gbPayUtil.createRecurring(
//       activation.referenceNo,
//       price,
//       interval,
//       '01',
//       card.token,
//     )

//     if (recurring && recurring.resultCode === '00') {
//       const requester: UserEntity = req.body.requester
//       try {
//         // Add Credit Card to database
//         const newCreditCardResult = await creditCardModel.saveCreditCard({
//           ...new CreditCardEntity(),
//           name: card.name,
//           number: card.number,
//           expirationMonth: card.expirationMonth,
//           expirationYear: card.expirationYear,
//           token: card.token,
//           createdBy: requester,
//         })
//         return res.status(201).send(newCreditCardResult)
//       } catch (error) {
//         errorMessage('CONTROLLER', 'creditCard', 'createCreditCard', error)
//         return next(new HttpException(400, ErrorCode[400]))
//       }
//     } else {
//       errorMessage(
//         'CONTROLLER',
//         'creditCard',
//         'recurring errorCode: ' + recurring.resultCode,
//       )
//       return next(new HttpException(400, ErrorCode[400]))
//     }
//   } else {
//     errorMessage('CONTROLLER', 'creditCard', 'invalid data')
//     return next(new HttpException(400, ErrorCode[400]))
//   }
// }

// export const deleteCreditCard = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const { id } = req.params
//   if (!id || typeof id !== 'string') {
//     errorMessage('CONTROLLER', 'creditCard', 'invalid parameter')
//     return next(new HttpException(400, ErrorCode[400]))
//   }
//   const creditCard = await creditCardModel.getCreditCard(id)
//   if (!creditCard) {
//     errorMessage('CONTROLLER', 'creditCard', 'not found')
//     return next(new HttpException(404, ErrorCode[404]))
//   }

//   try {
//     /**
//      * Cancel​ Recurring API
//      * https://doc.gbprimepay.com/recurring
//      */
//     const recurring = await gbPayUtil.cancelRecurring(creditCard.recurringNo)
//     if (recurring && recurring.resultCode === '00') {
//       const result = await creditCardModel.deleteCreditCard(id)
//       if (!result) {
//         errorMessage('CONTROLLER', 'creditCard', ' deleteCreditCard')
//         return next(new HttpException(500, ErrorCode[400]))
//       }
//       return res.status(201).json({ message: 'success' })
//     } else {
//       errorMessage(
//         'CONTROLLER',
//         'creditCard',
//         'cancel recurring errorCode: ' + recurring.resultCode,
//       )
//       return next(new HttpException(400, ErrorCode[400]))
//     }
//   } catch (error) {
//     errorMessage('CONTROLLER', 'creditCard', 'deleteCreditCard', error)
//     return next(new HttpException(500, ErrorCode[500]))
//   }
// }
