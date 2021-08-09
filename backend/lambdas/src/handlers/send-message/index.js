/**
 * Esta função deve receber um payload da fila
 * Gerar um JWT com a secret das variáveis de ambiente
 * Realizar uma chamada para o backend enviando o jwt + payload
 * O retorno dessa chamada será um 202
 */
const jwt = require('../../../lib/ms-auth');
const fetch = require('node-fetch');
const sqsParse = require('../../../lib/aws-parse-sqs');

async function main(event) {
    try {
        const isSQSMessage = Boolean(event.Records);
        if(isSQSMessage){
            const payloadParsed = await sqsParse.parseMessages(event);
            const payload = payloadParsed[0];
            const msJWT = await jwt.sign(payload);
            const url = `${process.env.MS_URL_MESSAGES}/messages/sending`

            //visualizando conteudo enviado para fila
            console.log(`Link da API messages: ${process.env.MS_URL_MESSAGES}/messages/sending`)
            console.log(`Payload messages: ${JSON.stringify(payload)}`)
            console.log(`JWT: ${msJWT}`)


            // the await eliminates the need for .then
            const res = await fetch(url, {
            method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": msJWT,
                },
                body: JSON.stringify(payload),
            })
            // this code is resumed once the fetch Promise is resolved.
            // res now has a value.
            console.log("Status: ", res.status);
            console.log("StatusText: ", res.statusText);
            return res;

            /*const checkStatus = (res) => {
                if(res.ok){
                    //qualquer status >= 200 e < 300
                    return res;
                }else{
                    throw Error(res.statusText);
                }
            };
            
            fetch(url,{
                method: "POST",
                body: JSON.stringify(payload),
                headers:{
                    "Content-Type": "application/json",
                    "x-access-token": msJWT,
                },
            })
            
            .then(checkStatus)
            .then((res) =>{
                    return {
                        statusCode: 200,
                        body: JSON.stringify(res),
                    };
            });*/
              

        }        
    } catch (error) {
        console.log(`Caiu no erro aqui: ${error}`);
        return{
            statusCode: 500,
            body: JSON.stringify({error})
        };
    }
}

module.exports.sendMessage = main;