import jwt from 'jsonwebtoken';

const SECRET: string = `${process.env.MS_JWT_SECRET}`;
const EXPIRATION: number = parseInt(`${process.env.MS_JWT_EXPIRES}`);

async function sign(token:any) {
    try {
        return jwt.sign(token, SECRET,{expiresIn: EXPIRATION})
    } catch (error) {
        console.log(`sign ${error}`);
        return null;
    }
}

async function verify(token:string) {
    try {
        return jwt.verify(token,SECRET);
    } catch (error) {
        console.log(`verify ${error}`);
        return null;
    }   
}

export default {sign, verify}