import axios from 'axios';

export interface IContact {
    id: number
}

export async function getContacts(jwt:string) {
    try {
        const config = {
            headers: {
                'x-access-token': jwt
            }
        }
        const response = await axios.get(`${process.env.CONTACTS_API}/contacts`,config);
        if(response.status !== 200) return null;

        return response.data as Array<IContact>;
        
    } catch (error) {
        console.log(`contactsService.getContacts: ${error}`)
        return null;
    }
}