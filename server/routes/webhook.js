const express = require('express');
const {db} = require('../db/conn.js');

const router = express.Router();

var crypto = require('crypto');
const { default: axios } = require('axios');
const { Timestamp } = require('firebase-admin/firestore');
var secret = process.env.ENVIRONMENT == 'production' 
? process.env.PAYSTACK_LIVE_SK : process.env.PAYSTACK_TEST_SK;
// Using Express
router.post("/transaction/verify", function(req, res) {
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    if (hash != req.headers['x-paystack-signature']) {
        return res.sendStatus(403);
    }
    const event = req.body;
    if(req.body.event == 'charge.success'){
        updatePaymentStatus(req.body.data)
        .then(() => {
            // Todo: notify user on successful payment
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
        .then(() => {
            // Todo: notify user on successful payment
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
    // const amount = data.amount;
    const metadata = data.metadata;
    // const authorization = data.authorization;
    try {
        const batch = db.batch();

        const paymentSnapshot = await db.collection('payment').doc(reference).get();
        await paymentSnapshot.ref.update({
            status: 'success',
            updatedAt: Timestamp.now()
        });

        console.log('Fetching user data');
        console.log(metadata.uid);
        const customerSnapshot = await db.collection('users').doc(metadata.uid).get();

        var creditBalance = customerSnapshot.get('credit');
        var paymentAmount = paymentSnapshot.get('amount');
        var newCreditBalance = creditBalance + paymentAmount;
        console.log(newCreditBalance);
        await customerSnapshot.ref.update({
            credit: newCreditBalance,
            updated_at: Timestamp.now()
        });
    
        await batch.commit();
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = router;