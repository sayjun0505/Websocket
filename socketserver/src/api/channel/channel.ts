import { Router } from 'express'
import { channelController } from '../../controller/channel'

const router = Router()

router.get('/channel/list', channelController.getChannels)
router.get('/channel/:id', channelController.getChannel)
router.post('/channel', channelController.createChannel)
router.put('/channel', channelController.updateChannel)
router.delete('/channel/:id', channelController.deleteChannel)

router.get(
  '/channel/exchangeToken/:accessToken',
  channelController.exchangeAccessToken,
)

// router
export default {
  router,
}
