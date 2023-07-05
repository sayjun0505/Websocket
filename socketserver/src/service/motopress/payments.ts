import axios from 'axios'

export const getPayment = (motopressUrl:string, consumerKey:string, consumerSecret:string, id:number) => {
  const auth = {
    username: consumerKey + '',
    password: consumerSecret + '',
  }
  const PER_PAGE = 100
  const url = motopressUrl + '/wp-json/mphb/v1/payments/' + id
  return axios
    .get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      auth,
      params: {
        per_page: PER_PAGE,
      },
    })
    .then((result) => {
      return result.data
    })
    .catch((error) => {
      console.error('[motopress] get payment: ', error)
      return null
    })
}