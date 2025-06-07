const https = require('https');

exports.handler = async (event) => {
    const word = event.queryStringParameters.word;
    
    if (!word) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Please provide a word to search' })
        };
    }
    
    try {
        const apiResponse = await lookupWord(word);
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify(apiResponse)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};

function lookupWord(word) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.dictionaryapi.dev',
            path: `/api/v2/entries/en/${encodeURIComponent(word)}`,
            method: 'GET'
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(data));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.end();
    });
}