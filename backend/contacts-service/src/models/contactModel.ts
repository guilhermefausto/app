import Sequelize, {Model, Optional} from 'sequelize';
import database from 'ms-commons/data/db';
import {IContact} from './contact';


interface IContactAttributes extends Optional<IContact,"id">{}

export interface IContactModel extends Model<IContact,IContactAttributes>,IContact{}

export default database.define<IContactModel>('contact',{
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    accountId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull:true
    },
    name: {
        type: Sequelize.STRING(150),
        allowNull: true
    },
    email: {
        type: Sequelize.STRING(150),
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING(11),
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