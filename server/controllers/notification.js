const { default: axios } = require('axios');
const { admin } = require('../db/conn.js');
const https = require('https');

const BULKSMSNIGERIA_ENDPOINT = 'https://www.bulksmsnigeria.com/api/v1/sms/create';

let headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
};

async function fcmSendToTopic(req, res) {
    var topic = req.body.topic || 'notification';
    var title = req.body.title;
    var body = req.body.body;

    admin.messaging().sendToTopic(
        // 'exnEOC3-SIquDXx1gU1orO:APA91bG_1oF4n72-LrWmqKwK4Qe0xxZ4f5sEqPU4kf0xeHS6QD2ZlY0s5whLN6ghVZCOReG7u6GmtQEWdc-TaBq-64Yeq2xuMkCyvV4rKlOZKN4guYCd8yfxl98k2me48R3ltx7CvkSC',
        topic,
        {
            notification: {
                'body': body,
                'title': title
            }
        }
    ).then((mds) => {
        console.log(mds);
        res.sendStatus(200);
    }).catch(err => {
        console.error(err);
        res.sendStatus(400);
    });
}

async function fcmSendToDevice(req, res) {
    var regToken = req.body.token;
    var title = req.body.title || 'notification';
    var body = req.body.body;
    
    if(regToken == undefined) {
        return res.status(404).json({message: 'invalid device registration token'});
    }

    admin.messaging().sendToDevice(
        regToken,
        {
            notification: {
                'body': body,
                'title': title
            }
        }
    ).then((mds) => {
        console.log(mds);
        res.sendStatus(200);
    }).catch(err => {
        console.error(err);
        res.sendStatus(400);
    });
}



async function sendSmsNotification(req, res) {
    var phone = req.body.to;
    var message = req.body.message;

    if (phone == undefined || message == undefined) {
        return res.status(400).json({
            'status': false,
            'message': 'missing required data'
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


module.exports = { sendSmsNotification, fcmSendToTopic, fcmSendToDevice }