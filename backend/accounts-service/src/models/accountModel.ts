import { func } from 'joi';
import Sequelize, {Model,Optional} from 'sequelize';
import database from '../db';
import {IAccount} from './account';

interface AccountCreationAttributes extends Optional<IAccount,"id">{}

export interface AccountModel extends Model<IAccount, AccountCreationAttributes>, IAccount{}

const accountModel = database.define<AccountModel>('account',{
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.SMALLINT.UNSIGNED,
        defaultValue: 100
    },
    domain: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

function findAll() {
    return accountModel.findAll<AccountModel>();
}

function  findById(id:number) {
    return accountModel.findByPk<AccountModel>(id);
}

function add(account:IAccount) {
    return accountModel.create(account);
}

export default {findAll, findById, add}