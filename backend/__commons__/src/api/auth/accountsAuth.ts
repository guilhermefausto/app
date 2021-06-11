import jwt, {VerifyOptions} from 'jsonwebtoken';
import fs from 'fs';
import path from 'path'


const publicKey = fs.readFileSync(path.join(findKeysPath(__dirname),'public.key'),'utf-8');
const jwtAlgorithm = 'RS256';

export type Token = { accountId: number, jwt?: string};

//Função recursiva para procurar a pasta keys
function findKeysPath(currentPath:string): string {
    const keysPath = path.join(currentPath,'keys');
    if(fs.existsSync(keysPath)) return keysPath;
    //A recursividade ocorre exatamente aqui
    else return findKeysPath(path.join(currentPath,'..'));
}


async function verify(token:string) {
    try {
        
        const decoded: Token = await jwt.verify(token, publicKey,{algorithms: [jwtAlgorithm]} as VerifyOptions) as Token;
        return {accountId: decoded.accountId, jwt: token};

    } catch (error) {
        console.log(`verify: ${error}`);
        return null;
    }
}

export default {verify, findKeysPath}