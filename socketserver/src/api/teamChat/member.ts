import { Router } from 'express'
import { memberController } from '../../controller/teamChat'

const router = Router()

router.get('/getChannelMembers/:channelId', memberController.getChannelMembers)
router.delete(
  '/deleteChannelMembers/:id',
  memberController.deleteChannelMembers,
)

// router
export default {
  router,
}
