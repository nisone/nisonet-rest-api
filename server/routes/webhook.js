const express = require('express');
const {db} = require('../db/conn.js');

const router = express.Router();

var crypto = require('crypto');
const { default: axios } = require('axios');
var secret = process.env.PAYSTACK_LIVE_SK;
// Using Express
router.post("/transaction/verify", function(req, res) {
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash != req.headers['x-paystack-signature']) {
        return res.sendStatus(403);
    }
    const event = req.body;
    if(req.body.event == 'charge.success'){
        updatePaymentStatus(req.body.data)
        .then((phone) => {
            // Todo: notify user on successful payment
            console.log(`Payment of N${req.body.data.amount/100} with Ref:${req.body.data.reference} is successful`);
            if(phone != undefined) {
                sendNotification(phone).then(() => {
                    console.log(req.body.data.metadata);
                    console.log(`Notification sent to ${phone}`);
                }).catch((error) => {
                    console.log(`Notification not sent! Error: ${error}`)
                });
            }
        })
        .catch(() => {
            // Todo: notify user on error
            console.log('Server error processing transaction data');
        })
    }
    res.sendStatus(200);
});

router.post("/test/transaction/verify", function(req, res) {
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash == req.headers['x-paystack-signature']) {
        return res.sendStatus(403);
    }
    const event = req.body;
    if(req.body.event == 'charge.success'){
        updatePaymentStatus(req.body.data)
        .then((phone) => {
            // Todo: notify user on successful payment
            if(phone != undefined) {
                console.log(`Payment of N${req.body.data.amount/100} with Ref:${req.body.data.reference} is successful. sent to ${phone}`);
                sendNotification(phone).then(() => {
                    console.log(req.body.data.metadata);
                    console.log(`Notification sent to ${phone}`);
                }).catch((error) => {
                    console.log(`Notification not sent! Error: ${error}`)
                });
            }
        })
        .catch(() => {
            // Todo: notify user on error
            console.log('Server error processing transaction data');
        })
    }
    res.sendStatus(200);
});

const updatePaymentStatus = async (data) => {
    const reference = data.reference;
    const amount = data.amount;
    const meta = data.meta;
    const authorization = data.authorization 
    try {
        const batch = db.batch();

        const snapshot = await db.collection('payment').where("reference", "==", reference).get();
        const member = await db.collection('members').where('memberId', '==', snapshot.docs[0].get('member_id')).get();

        batch.update(snapshot.docs[0].ref, {is_paid: true});
        batch.update(member.docs[0].ref, {membershipStatus: true});
    
        batch.commit();

        return member.docs[0].get('phone');
    } catch (error) {
        console.log(error);
    }
}

const sendNotification = async (phone) => {

    if(phone == undefined ){
        return res.status(400).json({
            'status' : false,
            'message' : 'missing required data'
        });
    }

    var message = "Kaduna Youth Empowerment Foundation Membership status activate.";

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

module.exports = router;