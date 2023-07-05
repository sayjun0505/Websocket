import { Router } from 'express'
import { teamController } from '../../controller/user'

const router = Router()

router.get('/team/list', teamController.getTeams)
router.get('/team/:id', teamController.getTeam)
router.post('/team', teamController.createTeam)
router.put('/team', teamController.updateTeam)
router.delete('/team/:id', teamController.deleteTeam)

export default {
  router,
}
