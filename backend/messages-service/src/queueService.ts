import AWS from 'aws-sdk';
import { IQueueMessage } from './models/queueMessage';

function sendMessage(message: IQueueMessage) {
    AWS.config.update({region: process.env.AWS_QUEUE_REGION})
    const sqs = new AWS.SQS();
    return sqs.sendMessage({
        MessageBody: JSON.stringify(message),
        QueueUrl: `${process.env.AWS_QUEUE_URL}`,
        MessageGroupId: `${process.env.AWS_MESSAGE_GROUP}`
    }).promise();
};

export default {sendMessage};