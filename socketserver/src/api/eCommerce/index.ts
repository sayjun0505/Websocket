import { Router } from 'express'
import woocommerceAPI from './woocommerce'
// Keyword Router
const ECommerceRouter = Router()
ECommerceRouter.use('/woocommerce', woocommerceAPI.router)

export default {
    ECommerceRouter
}
