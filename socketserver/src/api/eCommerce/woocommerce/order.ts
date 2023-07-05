import { Router } from 'express'
import { woocommerceController } from '../../../controller/eCommerce'

const router = Router()

router.get('/list', woocommerceController.order.getOrdersListController)

export { router }
