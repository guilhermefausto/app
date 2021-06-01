import baseApi from './api';
import baseURLs from '../configs/baseURLs';

class ContactsService{
    constructor(){
        this.api = baseApi(baseURLs.API_CONTACTS);
    }

    async getAll(){
        const result = await this.api.get('contacts');
        return result.data;
    }

    async getOne(contactId){
        const result = await this.api.get(`contacts/${contactId}`);
        return result.data;
    }

    async add(contactModel){
        const result = await this.api.post('contacts',contactModel);
        return result;
    }

    async delete(contactId){
        const result = await this.api.delete(`contacts/${contactId}`);
        return result;
    }

    async send(messageId) {
        const result = await this.api.post(`messages/${messageId}/send`);
        return result;
    }


}

export default ContactsService;