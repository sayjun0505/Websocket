import { Router } from 'express'
import { woocommerceController } from '../../../controller/eCommerce'

const router = Router()

router.get('/', woocommerceController.category.getCategoryController)
router.get('/list', woocommerceController.category.getCategoriesListController)

router.post('/', woocommerceController.category.createCategoryController)
router.put('/', woocommerceController.category.updateCategoryController)
router.delete('/', woocommerceController.category.deleteCategoryController)

export { router }
