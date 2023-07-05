import { Router } from 'express'
import { woocommerceController } from '../../../controller/eCommerce'

const router = Router()
router.get('/', woocommerceController.product.getProductController)
router.get('/list', woocommerceController.product.getProductsListController)

router.post('/', woocommerceController.product.createProductController)
router.put('/', woocommerceController.product.updateProductController)
router.delete('/', woocommerceController.product.deleteProductController)

export { router }
