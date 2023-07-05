import { Router } from 'express'
import lineAPI from './line'
import facebookAPI from './facebook'
import instagramAPI from './instagram'
import woocommerceAPI from './woocommerce'
// import gbpayAPI from './gbpay'
import stripeAPI from './stripe'

// Webhook Router
const webhookRouter = Router()
webhookRouter.use('/line', lineAPI.router)
webhookRouter.use('/facebook', facebookAPI.router)
webhookRouter.use('/instagram', instagramAPI.router)
webhookRouter.use('/woocommerce', woocommerceAPI.router)
// webhookRouter.use('/gbpay', gbpayAPI.router)
webhookRouter.use('/stripe', stripeAPI.router)

export default {
  webhookRouter,
}
