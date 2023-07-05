import { Router } from 'express'
import { responseController } from '../../controller/reply'

const router = Router()

router
  .get('/', responseController.getResponse)
  .get('/list', responseController.getResponses)
  .post('/', responseController.createResponse)
  .put('/', responseController.updateResponse)
  .delete('/', responseController.deleteResponse)
  .post('/uploads/:replyId', responseController.uploadContent)

export default {
  router,
}
