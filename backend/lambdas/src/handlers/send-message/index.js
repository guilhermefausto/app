/**
 * Esta função deve receber um payload da fila
 * Gerar um JWT com a secret das variáveis de ambiente
 * Realizar uma chamada para o backend enviando o jwt + payload
 * O retorno dessa chamada será um 202
 */
const jwt = require('../../../lib/ms-auth');
const request = require('request');
const sqsParse = require('../../../lib/aws-parse-sqs');

async function main(event) {
    try {
        const isSQSMessage = Boolean(event.Records);
        if(isSQSMessage){
            const payloadParsed = await sqsParse.parseMessages(event);
            const payload = payloadParsed[0];

            const msJWT = await jwt.sign(payload);

            const options = {
                url: `${process.env.MS_URL_MESSAGES}/messages/sending`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': payload.length,
                    'x-access-token': msJWT
                },
                body: payload,
                json: true,
            }

            //Correção request que na verdade não retorna promise e sim função de callback
            request(options, (error, response, body) => {
                if (error) {
                    return{
                        statusCode: 500,
                        body: JSON.stringify({error})
                    }
                } else if (response.statusCode !== 200) {
                    return{
                        statusCode: 500,
                        body: JSON.stringify({error})
                    }
                }
                return{
                    statusCode: 200,
                    body: JSON.stringify({body})
                }
              });

            /*await request(options)
                .then(result => {
                    return{
                        statusCode: 200,
                        body: JSON.stringify({result})
                    }
                })
                .catch(error => {
                    return{
                        statusCode: 500,
                        body: JSON.stringify({error})
                    }
                })*/
        }        
    } catch (error) {
        console.log(error);
        return{
            statusCode: 500,
            body: JSON.stringify({error})
        };
    }
}

module.exports.sendMessage = main;