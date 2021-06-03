import {Router} from 'express';
import accountsController from '../controllers/accounts';
import {validateAccountSchema,validateLoginSchema, validateUpdateAccountSchema, validateAuthentication, validateAuthorization, validateAccountEmailSchema, validateAccountEmailUpdateSchema} from './middlewares';

const router = Router();

router.get('/accounts/settings/accountEmails/:id', validateAuthentication, accountsController.getAccountEmail);

router.get('/accounts/settings/accountEmails', validateAuthentication, accountsController.getAccountEmails);

router.get('/accounts/settings', validateAuthentication, accountsController.getAccountSettings);

router.get('/accounts/:id',validateAuthentication, validateAuthorization, accountsController.getAccount);

router.get('/accounts/',validateAuthentication,accountsController.getAccounts);

router.patch('/accounts/settings/accountEmails/:id', validateAuthentication, validateAccountEmailUpdateSchema, accountsController.setAccountEmail);

router.patch('/accounts/:id', validateAuthentication, validateAuthorization, validateUpdateAccountSchema, accountsController.setAccount);

router.put('/accounts/settings/accountEmails', validateAuthentication, validateAccountEmailSchema,accountsController.addAccountEmail)

router.post('/accounts/settings', validateAuthentication, accountsController.createAccountSettings);

router.post('/accounts/', validateAccountSchema, accountsController.addAccount);

router.post('/accounts/login', validateLoginSchema, accountsController.loginAccount);

router.post('/accounts/logout', validateAuthentication, accountsController.logoutAccount);

router.delete('/accounts/settings/accountEmails/:id', validateAuthentication, accountsController.deleteAccountEmail);

router.delete('/accounts/:id', validateAuthentication,validateAuthorization, accountsController.deleteAccount);

export default router;