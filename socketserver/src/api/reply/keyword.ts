import { Router } from 'express'
import { keywordController } from '../../controller/reply'

const router = Router()

router
  .get('/', keywordController.getKeyword)
  .get('/list', keywordController.getKeywords)
  .post('/', keywordController.createKeyword)
  .put('/', keywordController.updateKeyword)
  .delete('/', keywordController.deleteKeyword)

export default {
  router,
}
