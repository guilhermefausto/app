import axios from 'axios';
import microserviceAuth from '../api/auth/microservicesAuth';

export type IAccountEmail = {
    name:string,
    email:string
}

export async function getAccountEmail(accountId:number, accountEmailId:number) {
    try {
        const config = {
            headers: {
                'x-access-token': await microserviceAuth.sign({accountId,accountEmailId})
            }
        }
        const response = await axios.get(`${process.env.ACCOUNTS_API}/accounts/${accountId}/accountEmails/${accountEmailId}`,config);
        if(response.status !== 200) return null;

        return response.data as IAccountEmail;
        
    } catch (error) {
        console.log(`accountsService.getAccountEmail: ${error}`)
        return null;
    }    
}