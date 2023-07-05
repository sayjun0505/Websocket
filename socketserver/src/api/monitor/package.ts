import { Router } from 'express'
import { checkAllOrganizationPackage } from '../../controller/monitor/package'

const router = Router()

router.get('/', checkAllOrganizationPackage)
// router.post('/', facebookController.receiveMessage)

export default {
  router,
}
