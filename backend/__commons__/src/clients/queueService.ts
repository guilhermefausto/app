import AWS from 'aws-sdk';

function sendMessage(message: any) {
    AWS.config.update({region: process.env.AWS_QUEUE_REGION})
    const sqs = new AWS.SQS();
    return sqs.sendMessage({
        MessageBody: JSON.stringify(message),
        QueueUrl: `${process.env.AWS_QUEUE_URL}`,
        MessageGroupId: `${process.env.AWS_MESSAGE_GROUP}`
    }).promise();
};

function paginate(messages:any[], pageSize: number, pageNumber:number) {
    return messages.slice((pageNumber-1) * pageSize, pageNumber * pageSize);
}

function sendMessageBacth(messages:any[]) {
    AWS.config.update({region: process.env.AWS_QUEUE_REGION})
    const sqs = new AWS.SQS();
    
    const promises = [];
    const pageSize = 10;
    const qtyPages = Math.ceil(messages.length / pageSize);

    for(let x=1; x <= qtyPages; x++){
        const messagesPage = paginate(messages,pageSize,x)

        const entries = messagesPage.map(item => {
            return {
                Id:item.id,
                MessageBody: JSON.stringify(item),
                MessageGroupId: `${process.env.AWS_MESSAGE_GROUP}`
            }
        })

        promises.push(sqs.sendMessageBatch({
            Entries: entries,
            QueueUrl: `${process.env.AWS_QUEUE_URL}`
        }).promise())
    }
    return promises;
}

export default {sendMessage, sendMessageBacth};