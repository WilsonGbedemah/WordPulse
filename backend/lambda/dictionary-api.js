const https = require('https');

exports.handler = async (event) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight' })
        };
    }

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }
    
    const word = event.queryStringParameters?.word;
    
    if (!word) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Word parameter is required' })
        };
    }
    
    try {
        const dictionaryData = await getDictionaryData(word);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(dictionaryData)
        };
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: error.statusCode || 500,
            headers,
            body: JSON.stringify({ 
                error: error.message || 'Internal Server Error' 
            })
        };
    }
};

function getDictionaryData(word) {
    return new Promise((resolve, reject) => {
        https.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject({
                        statusCode: res.statusCode,
                        message: JSON.parse(data).message || 'Word not found'
                    });
                }
            });
        }).on('error', (error) => {
            reject({
                statusCode: 500,
                message: error.message
            });
        });
    });
}