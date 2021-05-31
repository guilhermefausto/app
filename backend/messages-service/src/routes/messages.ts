import {Router} from 'express';
import middlewaresCommons from 'ms-commons/api/routes/middlewares';
import controller from '../controllers/messages';
import {validateMessageSchema, validateUpdateMessageSchema} from './middlewares';
const router = Router();

router.get('/messages/:id',middlewaresCommons.validateAuth, controller.getMessage);
router.get('/messages/',middlewaresCommons.validateAuth, controller.getMessages);
router.post('/messages/',middlewaresCommons.validateAuth, validateMessageSchema, controller.addMessage);
router.patch('/messages/:id',middlewaresCommons.validateAuth, validateUpdateMessageSchema, controller.setMessage)
router.delete('/messages/:id',middlewaresCommons.validateAuth, controller.deleteMessage);
router.post('/messages/:id/send', middlewaresCommons.validateAuth, controller.sendMessage);

export default router;