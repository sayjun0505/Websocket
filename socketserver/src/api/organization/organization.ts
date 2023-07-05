import cors from 'cors'
import { Router } from 'express'
import { organizationController } from '../../controller/organization'
import { getOrganization } from '../../controller/organization/organization'

const router = Router()

router.get('/organization/accept/:id', organizationController.acceptOrganization)
router.get('/organization/:id/workingHours', organizationController.getWorkingHours)
router.get('/organization/:id/motopress', organizationController.getMotopress)
router.get('/organization/:id', organizationController.getOrganization)
router.get('/organizations', organizationController.getOrganizations)
router.post('/organization', organizationController.createOrganization)
router.put('/organization', organizationController.updateOrganization)
router.delete('/organization/:id', organizationController.deleteOrganization)
router.get('/organization/:id/state', organizationController.getOrganizationState)

export default {
  router,
}
