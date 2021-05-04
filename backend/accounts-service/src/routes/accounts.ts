import {Router, Request, Response} from 'express';
import accountsController from '../controllers/accounts';

const router = Router();

router.get('/accounts/',accountsController.getAccounts)

router.get('/accounts/:id',accountsController.getAccount);

router.post('/accounts/',accountsController.addAccount)

export default router;