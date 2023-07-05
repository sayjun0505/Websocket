// import {
//   ErrorCode,
//   errorMessage,
//   HttpException,
// } from '../../middleware/exceptions'
// import { getRepository, In } from 'typeorm'
// import { CreditCardEntity, OrganizationEntity, TeamEntity, UserEntity } from '.'

// export const getCreditCards = async (user: UserEntity) => {
//   return await getRepository(CreditCardEntity).find({
//     where: {
//       user,
//     },
//     select: [
//       'createdAt',
//       'id',
//       'name',
//       'number',
//       'expirationMonth',
//       'expirationYear',
//       'token',
//     ],
//   })
// }

// export const getCreditCard = async (id: string) => {
//   return await getRepository(CreditCardEntity).findOne({
//     where: {
//       id,
//     },
//     select: ['recurringNo'],
//   })
// }

// export const saveCreditCard = async (card: CreditCardEntity) => {
//   try {
//     return await getRepository(CreditCardEntity).save(card)
//   } catch (error) {
//     errorMessage('MODEL', 'creditCard', 'saveCreditCard', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }

// export const deleteCreditCard = async (id: string) => {
//   try {
//     return await getRepository(CreditCardEntity).delete(id)
//   } catch (error) {
//     errorMessage('MODEL', 'creditCard', 'deleteCreditCard', error)
//     throw new HttpException(500, ErrorCode[500])
//   }
// }
