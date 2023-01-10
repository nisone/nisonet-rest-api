const axios = require('axios');
const { Timestamp } = require('firebase-admin/firestore');
const {db} = require('../db/conn.js');
const PAYSTACK_ENDPOINT = 'https://api.paystack.co/';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.ENVIRONMENT == 'production' 
    ? process.env.PAYSTACK_LIVE_SK : process.env.PAYSTACK_TEST_SK}`
}

async function createPayment(req, res) {
    var data = req.body;
    var error = [];

    if(data.uid == null){
        error.push({uid : "uid is required"});
    }

    if(data.email == null){
        error.push({email : "email is required"});
    }

    if(data.amount == null){
        error.push({amount : "amount is required"});
    }

    if(error.length > 0) {
        console.log(data);
        return res.status(400).json({message: 'payment initialization error',error: error});
    }

    var transaction_charge = data.amount * 0.015;
    // transaction_charge += data.amount * 0.075;
    if(data.amount > 2500){
        transaction_charge += 100;
    }

    if(transaction_charge < 50){
        transaction_charge = 50;
    }

    console.log('connecting to payment gateway');
    // console.log(`paystack charge: ${transaction_charge}`);
    axios.post('https://api.paystack.co/transaction/initialize', {
        "email" : data.email,
        "amount" : (data.amount + transaction_charge) * 100,
        // "subaccount" : process.env.ENVIRONMENT == 'production' ? 'ACCT_txmkyg2d0nc3g75' : 'ACCT_8bib3eyb12qg2hb',
        // "transaction_charge" : transaction_charge * 100,
        // "bearer" : "account",
        "metadata": data.metadata,
        "channels": ["card"],
        "callback_url": "https://nisonet.cyclic.app/payment/callback"
    }, {
        headers: headers
    }).then(async (response) => {
        if(!response.data.status){
            return res.status(400).json({
                "message": "error communicating with payment services"
            });
        }
        console.log('logging payment record');
        const docRef = db.collection('payment').doc(response.data.data.reference);

        await docRef.set({
            uid: data.uid,
            reference : response.data.data.reference,
            access_code: response.data.data.access_code,
            amount: data.amount,
            status: "pending",
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        console.log('payment recorded');
        return res.status(200).json({
            "message" : "transaction initialized",
            "reference" : response.data.data.reference,
            "authorization_url" : response.data.data.authorization_url
        });
    }).catch((error) => {
        // console.log(error);
        return res.status(400).json({
            "message": `CATCH: ${error.message}`
        });
    });
}

async function verifyPayment(req, res) {
    var reference = req.params.reference;
    axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: headers
    }).then(async (response) => {
        if(!response.data.status){
            return res.status(400).json({
                "message": "error communicating with payment services"
            });
        }

        if(response.data.data.status != "success"){
            return res.status(400).json({
                "status" : response.data.data.status,
                "message": "transaction verification failed"
            });
        }

        const batch = db.batch();

        const paymentRef = await db.collection('payment').doc(reference).get();
        paymentRef.ref.update({
            status: 'success',
            updatedAt: Timestamp.now()
        });
    
        batch.commit();  // Here we return the Promise returned by commit()

        return res.status(200).json({
            "message" : "transaction verified",
            "status" : response.data.data.status
        });
    }).catch((error) => {
        console.log(error);
        return res.status(400).json({
            "message": error.message
        });
    });
}

async function paymentCallback(req, res) {
    var reference = req.query.reference || req.query.txref;

    axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: headers
    }).then(async (response) => {
        if(!response.data.status){
            return res.status(400).json({
                "message": "error communicating with payment services"
            });
        }

        const data = response.data.data;
        const batch = db.batch();
        
        const paymentRef = await db.collection('payment').doc(reference).get();
        console.log('Payment Status: ' + paymentRef.get('status'));
        console.log('Response Status: ' + data.status);
        if(paymentRef.get('status') == data.status && data.status == 'success'){
            return res.status(200).json({
                "message" : "transaction successful",
                "status" : data.status
            });
        } 

        if(paymentRef.get('status') == data.status && data.status != 'success'){
            return res.status(400).json({
                "message" : "transaction not successful",
                "status" : data.status
            });
        } 


        if(paymentRef.get('status') != data.status && data.status != 'success'){
            console.log('Updating payment');
            paymentRef.ref.update({
                status: data.status,
                updatedAt: Timestamp.now()
            });
        
            batch.commit();
            
            return res.status(400).json({
                "message" : "transaction not successful",
                "status" : data.status
            });
        } 

        if(paymentRef.get('status') != data.status && data.status == 'success'){
            const userRef = await db.collection('users').doc(data.metadata.uid).get();
            var creditBalance = Number(userRef.get('credit')) + Number(data.metadata.amount);
            console.log('Updating payment');
            paymentRef.ref.update({
                status: data.status,
                updatedAt: Timestamp.now()
            });
            console.log('Updating credit balance');
            userRef.ref.update({
                credit: creditBalance,
                updated_at: Timestamp.now(),
            });
        
            batch.commit();
            
            return res.status(200).json({
                "message" : "transaction successful",
                "status" : response.data.data.status
            });
        } 

        return res.status(400).json({
            "message" : "transaction can\'t be verified",
            "status" : response.data.data.status
        });
    }).catch((error) => {
        console.log(error);
        return res.status(400).json({
            "message": error.message
        });
    });
}

async function charge(req, res) {
    // Todo: implement charge endpoint

    res.sendStatus(404);
}

module.exports = {createPayment, paymentCallback, verifyPayment, charge}