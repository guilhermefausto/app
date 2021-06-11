import {Router} from 'express';
import middlewaresCommons from 'ms-commons/api/routes/middlewares';
import controller from '../controllers/contacts';
import {validateContactSchema, validateUpdateContactSchema} from './middlewares';
const router = Router();

//rota para microserviço, o front não chama
router.get('/contacts/:id/accounts/:accountId',middlewaresCommons.validateMicroserviceAuth, controller.getContact);

router.get('/contacts/:id',middlewaresCommons.validateAccountAuth, controller.getContact);

router.get('/contacts/',middlewaresCommons.validateAccountAuth, controller.getContacts);

router.post('/contacts/',middlewaresCommons.validateAccountAuth, validateContactSchema, controller.addContact);

router.patch('/contacts/:id',middlewaresCommons.validateAccountAuth, validateUpdateContactSchema, controller.setContact);

router.delete('/contacts/:id',middlewaresCommons.validateAccountAuth, controller.deleteContact);

export default router;