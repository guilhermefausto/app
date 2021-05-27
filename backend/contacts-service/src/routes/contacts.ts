import {Router} from 'express';
import middlewaresCommons from 'ms-commons/api/routes/middlewares';
import controller from '../controllers/contacts';
import {validateContactSchema, validateUpdateContactSchema} from './middlewares';
const router = Router();

router.get('/contacts/:id',middlewaresCommons.validateAuth, controller.getContact);

router.get('/contacts/',middlewaresCommons.validateAuth, controller.getContacts);

router.post('/contacts/',middlewaresCommons.validateAuth, validateContactSchema, controller.addContact);

router.patch('/contacts/:id',middlewaresCommons.validateAuth, validateUpdateContactSchema, controller.setContact);

router.delete('/contacts/:id',middlewaresCommons.validateAuth, controller.deleteContact);

export default router;