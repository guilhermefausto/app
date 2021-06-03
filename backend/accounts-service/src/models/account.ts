import { AccountSettings } from 'ms-commons/clients/emailService';
import {AccountStatus} from './accountStatus'

export interface IAccount{
    id?: number,
    name: string,
    email: string,
    password: string,
    status?: AccountStatus,
    domain: string,
    settings?: AccountSettings
}