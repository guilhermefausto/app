import database from "ms-commons/data/db";
import Sequelize, {Model, Optional} from 'sequelize';
import {IAccountEmail} from './accountEmail';

interface IAccountEmailCreationAttributes extends Optional<IAccountEmail,"id">{}

export interface IAccountEmailModel extends Model<IAccountEmail,IAccountEmailCreationAttributes>,IAccountEmail{}

const AccountEmail = database.define<IAccountEmailModel>('accountEmail',{
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull:false
    },
    name: {
        type: Sequelize.STRING(150),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true
    },
    accountId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false
    }
})

export default AccountEmail;