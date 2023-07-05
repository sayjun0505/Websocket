import { Router } from 'express'
import { permissionController } from '../../controller/authorization/'

const router = Router()

router.get('/permission/:role', permissionController.getPermission)

export default {
  router,
}
