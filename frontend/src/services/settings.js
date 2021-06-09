import baseApi from './api';
import baseURLs from '../configs/baseURLs';

class SettingsService{
    constructor(){
        this.api = baseApi(baseURLs.API_ACCOUNTS);
    }

    //get configs dominio
    async get(){
        const result = await this.api.get('accounts/settings');
        
        return result.data
    }

    //addAccountEmail
    async addAccountEmail(accountEmailModel){
        const result = await this.api.put('accounts/settings/accountEmails',accountEmailModel);

        return result.data
    }

    //getOneAccountEmail
    async getOneAccountEmail(accountEmailId){
        const result = await this.api.get(`accounts/settings/accountEmails/${accountEmailId}`);

        return result.data;
    }

    //getAllAcocountEmail
    async getAllAccountEmail(){
        const result = await this.api.get('accounts/settings/accountEmails');

        return result.data;
    }
}

export default SettingsService;