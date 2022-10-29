const https = require('https');

const BULKSMSNIGERIA_ENDPOINT = 'https://www.bulksmsnigeria.com/api/v1/sms/create';

let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

async function sendSmsNotification(req, res) {
    var phone = req.body.to;
    var message = req.body.message;

    if(phone == undefined || message == undefined){
        return res.status(400).json({
            'status' : false,
            'message' : 'missing required data'
        });
    }

    var params = {
        'api_token': process.env.BULKSMSNIGERIA_API_KEY,
        'from': 'KADUNAYOUTH',
        'to': phone,
        'body': message,
        'dnd': 2,
    }

    https.get(`https://www.bulksmsnigeria.com/api/v1/sms/create?api_token=${params.api_token}&from=${params.from}&to=${params.to}&body=${params.body}&dnd=${params.dnd}`, (response) => {
        console.log('statusCode:', response.statusCode);
        // console.log('headers:', res.headers);
      
        var body = '';
        response.on('data', (chunk) => {
          process.stdout.write(chunk);
          body += chunk;
        });

        response.on('end', () => {
            res.status(200).json(JSON.parse(body));
        });
      }).on('error', (e) => {
        console.error(e);
        res.status(400).json(e);
      });
}


module.exports = {sendSmsNotification}