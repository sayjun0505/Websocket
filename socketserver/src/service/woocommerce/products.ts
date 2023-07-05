import axios from 'axios'

// const woocommerceUrl = process.env.WOOCOMMERCE_URL
// const auth = {
//   username: process.env.CONSUMER_KEY + '',
//   password: process.env.CONSUMER_SECRET + '',
// }
export const getAllProductList = (woocommerceUrl:string, consumerKey:string, consumerSecret:string) => {
  const auth = {
    username: consumerKey + '',
    password: consumerSecret + '',
  }
  const PER_PAGE = 100
  const productURL = woocommerceUrl + '/wp-json/wc/v3/products'
  return axios
    .get(productURL, {
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
      console.error('[woocommerce] get products list: ', error.response)
      return null
    })
}

export const getProduct = (woocommerceUrl:string, consumerKey:string, consumerSecret:string, id: number) => {
  const auth = {
    username: consumerKey + '',
    password: consumerSecret + '',
  }
  const productURL = woocommerceUrl + '/wp-json/wc/v3/products/' + id
  return axios
    .get(productURL, {
      headers: {
        'Content-Type': 'application/json',
      },
      auth,
    })
    .then((result) => {
      return result.data
    })
    .catch((error) => {
      console.error(
        '[woocommerce] get products id: ' + id + ' : ',
        error.response,
      )
      return null
    })
}

export const createProduct = (woocommerceUrl:string, consumerKey:string, consumerSecret:string, data: JSON) => {
  const auth = {
    username: consumerKey + '',
    password: consumerSecret + '',
  }
  const productURL = woocommerceUrl + '/wp-json/wc/v3/products'
  return axios
    .post(productURL, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      auth,
    })
    .then((result) => {
      return result.data
    })
    .catch((error) => {
      console.error('[woocommerce] create product: ', error.response)
      return null
    })
}

export const updateProduct = (
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
  const productURL = woocommerceUrl + '/wp-json/wc/v3/products/' + id
  return axios
    .put(productURL, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      auth,
    })
    .then((result) => {
      return result.data
    })
    .catch((error) => {
      console.error('[woocommerce] update product: ', error.response)
      return null
    })
}

export const deleteProduct = (
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
  const productURL = woocommerceUrl + '/wp-json/wc/v3/products/' + id
  return axios
    .delete(productURL, {
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
      console.error('[woocommerce] delete product: ', error.response)
      return null
    })
}
