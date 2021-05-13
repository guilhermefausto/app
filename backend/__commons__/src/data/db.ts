import {Sequelize} from 'sequelize';

const dbName = process.env.DB_NAME!;
const dbUser = process.env.DB_USER!;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const logging = process.env.SQL_LOG ? true : false; 

const sequelize = new Sequelize(dbName,dbUser,dbPassword,{
    dialect:'mysql',
    host: dbHost,
    logging: logging
})

export default sequelize;