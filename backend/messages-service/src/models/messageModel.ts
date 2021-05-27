import Sequelize, {Model, Optional} from 'sequelize';
import database from 'ms-commons/data/db';
import {IMessage} from './message';


interface IMessageAttributes extends Optional<IMessage,"id">{}

export interface IMessageModel extends Model<IMessage,IMessageAttributes>,IMessage{}

const Message = database.define<IMessageModel>('message',{
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    accountId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull:false
    },
    subject: {
        type: Sequelize.STRING(150),
        allowNull: false
    },
    body: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    sendDate: {
        type: Sequelize.DATE,
        allowNull: true
    },
    status: {
        type: Sequelize.SMALLINT(),
        allowNull: false,
        defaultValue: 100
    }
},{
    indexes: [{
        unique: true,
        fields: ['accountId','email']
    }]
});

Message.sync();
export default Message;