import * as admin from 'firebase-admin'
// import { initializeApp } from 'firebase/app'
// import { getAuth, sendPasswordResetEmail } from 'firebase/auth'

import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../../middleware/exceptions'

// admin.initializeApp({
//   credential: admin.credential.cert({
//     projectId: process.env.PROJECT_ID,
//     privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
//     clientEmail: process.env.CLIENT_EMAIL,
//   }),
//   databaseURL: process.env.DATABASE_URL,
// })

// const config = {
//   apiKey: process.env.API_KEY,
//   authDomain: process.env.AUTH_DOMAIN,
//   projectId: process.env.PROJECT_ID,
// }

export const verifyToken = (
  token: string,
): Promise<admin.auth.DecodedIdToken> => {
  return admin.auth().verifyIdToken(token)
}

export const createGoogleUser = async (email: string, password: string) => {
  try {
    return await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
      disabled: false,
    })
  } catch (error) {
    errorMessage(
      'SERVICE',
      'gid',
      'create Google Identity Platform user',
      error,
    )
    throw new HttpException(500, ErrorCode[500])
  }
}

// const sendResetPassword = async (email: string) => {
//   try {
//     await initializeApp(config)
//     return sendPasswordResetEmail(getAuth(), email)
//   } catch (error) {
//     console.error('Create Google identity platform user ', error)
//     throw new HttpException(400, ErrorCode[400])
//   }
// }

// export default {
//   createGoogleUser,
//   verifyToken,
// }
