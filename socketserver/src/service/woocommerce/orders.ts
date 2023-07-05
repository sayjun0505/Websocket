import axios from 'axios'

// const woocommerceUrl = process.env.WOOCOMMERCE_URL
// const auth = {
//   username: process.env.CONSUMER_KEY + '',
//   password: process.env.CONSUMER_SECRET + '',
// }
export const getAllOrderList = (woocommerceUrl:string, consumerKey:string, consumerSecret:string) => {
  const auth = {
    username: consumerKey + '',
    password: consumerSecret + '',
  }
  const PER_PAGE = 100
  const url = woocommerceUrl + '/wp-json/wc/v3/orders'
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
      console.error('[woocommerce] get orders list: ', error)
      return null
    })
}

export const getOrder = (woocommerceUrl:string, consumerKey:string, consumerSecret:string, id: number) => {
  const auth = {
    username: consumerKey + '',
    password: consumerSecret + '',
  }
  const url = woocommerceUrl + '/wp-json/wc/v3/orders/' + id
  return axios
    .get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      auth,
    })
    .then((result) => {
      return result.data
    })
    .catch((error) => {
      console.error('[woocommerce] get order id: ' + id + ' : ', error)
      return null
    })
}

export const createOrder = (woocommerceUrl:string, consumerKey:string, consumerSecret:string, data: JSON) => {
  const auth = {
    username: consumerKey + '',
    password: consumerSecret + '',
  }
  const url = woocommerceUrl + '/wp-json/wc/v3/orders'
  return axios
    .post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      auth,
    })
    .then((result) => {
      return result.data
    })
    .catch((error) => {
      console.error('[woocommerce] create order: ', error)
      return null
    })
}

export const updateOrder = (
  woocommerceUrl:string,
  consumerKey:string,
  consumerSecret:string,
  id: number,
  data: JSON
) => {
  const auth = {
    username: consumerKey + '',
    password: consumerSecret + '',
  }
  const url = woocommerceUrl + '/wp-json/wc/v3/orders/' + id
  return axios
    .put(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      auth,
    })
    .then((result) => {
      return result.data
    })
    .catch((error) => {
      console.error('[woocommerce] update order: ', error)
      return null
    })
}

export const deleteOrder = (
  woocommerceUrl:string,
  consumerKey:string,
  consumerSecret:string,
  id: number,
  force: boolean = true
) => {
  const auth = {
    username: consumerKey + '',
    password: consumerSecret + '',
  }
  const url = woocommerceUrl + '/wp-json/wc/v3/orders/' + id
  return axios
    .delete(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      auth,
      params: {
        force,
      },
    })
    .then((result) => {
      return result.data
    })
    .catch((error) => {
      console.error('[woocommerce] delete order: ', error)
      return null
    })
}
