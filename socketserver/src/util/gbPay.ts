import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  ErrorCode,
  errorMessage,
  HttpException,
} from '../middleware/exceptions'

const GBPAY_BACKGROUND_URL = process.env.GBPAY_BACKGROUND_URL
const GBPAY_URL = process.env.GBPAY_URL
const GBPAY_SECRET_KEY = process.env.GBPAY_SECRET_KEY

if (!(GBPAY_BACKGROUND_URL && GBPAY_URL && GBPAY_SECRET_KEY)) {
  errorMessage('UTILS', 'gbPay', 'missing env')
  throw new HttpException(500, ErrorCode[500])
}

// Charge Recurring API
export const createRecurring = (
  referenceNo: string,
  recurringAmount: number,
  recurringInterval: string,
  recurringPeriod: string,
  cardToken: string,
) => {
  const token = Buffer.from(`${GBPAY_SECRET_KEY}:`, 'binary').toString('base64')
  const URL = `${GBPAY_URL}/v1/recurring`
  return axios
    .post(
      URL,
      {
        processType: 'I',
        allowAccumulate: 'Y',
        backgroundUrl: GBPAY_BACKGROUND_URL,
        referenceNo,
        recurringAmount,
        recurringInterval,
        recurringPeriod,
        cardToken,
      },
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      },
    )
    .then(async (response: AxiosResponse) => {
      return response.data
    })
    .catch((error: AxiosError) => {
      console.error('[gbPay] createRecurring: ', error.response?.data)
      throw new HttpException(500, ErrorCode[500])
    })
}

// Cancel​ Recurring API
export const cancelRecurring = (recurringNo: string) => {
  const token = Buffer.from(`${GBPAY_SECRET_KEY}:`, 'binary').toString('base64')
  const URL = `${GBPAY_URL}/v1/recurring`
  return axios
    .post(
      URL,
      {
        processType: 'C',
        recurringNo,
      },
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      },
    )
    .then(async (response: AxiosResponse) => {
      return response.data
    })
    .catch((error: AxiosError) => {
      console.error('[gbPay] cancelRecurring: ', error.response?.data)
      throw new HttpException(500, ErrorCode[500])
    })
}
