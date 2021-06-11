import sendingModel, {ISendingModel} from './sendingModel';
import {SendingStatus} from './sendingStatus';
import {ISending} from './sending';
import { v4 as uuid } from 'uuid';

async function findQueuedOne(id: string, messageId: number, accountId: number, contactId: number){
    try {
        const sending = await sendingModel.findOne<ISendingModel>({where: {id, contactId, messageId, accountId, status: SendingStatus.QUEUED}});
        return sending
    } catch (error) {
        console.log(`findOneQueued: ${error}`);
        return null;
    }
}

async function findByMessageId(messageId:number, accountId:number) {
    try {
        const sendings = await sendingModel.findAll<ISendingModel>({where: {accountId,messageId}})
        return sendings;
    } catch (error) {
        console.log(`findByMessageId: ${error}`);
        return null;        
    }
}

async function findByContactId(contactId: number, accountId:number){
    try {
        const sendings = await sendingModel.findAll<ISendingModel>({where: {accountId,contactId}})
        return sendings;        
    } catch (error) {
        console.log(`findByContactId: ${error}`);
        return null;        
    }
}

async function add(sending:ISending) {
    sending.id = uuid();
    const result = await sendingModel.create(sending)
    return result;
}

async function addAll(sendings: ISending[]){
    if(!sendings || sendings.length === 0) return null;

    sendings.forEach(item => item.id = uuid());
    const results = await sendingModel.bulkCreate(sendings);
    return results;
}

async function set(sendingId:string, sending:ISending, accountId:number) {
    const originalSending = await sendingModel.findOne({where: {accountId, id: sendingId}});
    if(!originalSending) return null;

    if(sending.status && sending.status != originalSending.status)
        originalSending.status = sending.status;
    
    if(sending.sendDate && sending.sendDate != originalSending.sendDate)
        originalSending.sendDate = sending.sendDate;
    
    const result = await originalSending.save();
    return result;
}

async function removeById(sendingId:string, accountId:number) {
    return await sendingModel.destroy({where: {accountId, id: sendingId}})
}

async function hasQueuedSending(messageId: number, accountId: number){
    return await sendingModel.count({where: {messageId, accountId, status: SendingStatus.QUEUED}}) > 0;
}

export default {
    findQueuedOne,
    findByMessageId,
    findByContactId,
    add,
    addAll,
    set,
    removeById,
    hasQueuedSending
}
