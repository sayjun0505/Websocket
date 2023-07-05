import { Router } from 'express'
import * as categoryAPI from './category'
import * as productAPI from './product'
import * as orderAPI from './order'

// Webhook Router
const router = Router()
router.use('/category', categoryAPI.router)
router.use('/product', productAPI.router)
router.use('/order', orderAPI.router)

export default {
    router,
}
