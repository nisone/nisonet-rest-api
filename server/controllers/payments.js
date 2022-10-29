const axios = require('axios');
const {db} = require('../db/conn.js');
const PAYSTACK_ENDPOINT = 'https://api.paystack.co/';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.ENVIRONMENT == 'production' 
    ? process.env.PAYSTACK_LIVE_SK : process.env.PAYSTACK_TEST_SK}`
}

async function createPayment(req, res) {
    var data = req.body;

    if(data.member_id == null || data.email == null || data.amount == null) {
        return res.status(400).json({
            "message": "field missing"
        });
    }
    var transaction_charge = data.amount * 0.036
    if(data.amount < 2500){
        transaction_charge += 100
    }else {
        transaction_charge += 200
    }
    axios.post('https://api.paystack.co/transaction/initialize', {
        "email" : data.email,
        "amount" : (data.amount + transaction_charge) * 100,
        "subaccount" : process.env.ENVIRONMENT == 'production' ? 'ACCT_txmkyg2d0nc3g75' : 'ACCT_txmkyg2d0nc3g75',//'ACCT_8bib3eyb12qg2hb',
        "transaction_charge" : transaction_charge * 100,
        "bearer" : "account",
        "metadata": data.metadata,
        "callback": `http://kaduna-youths.herokuapp.com/payment/verify/${data.member_id}`
    }, {
        headers: headers
    }).then(async (response) => {
        if(!response.data.status){
            return res.status(400).json({
                "message": "error communicating with payment services"
            });
        }

        const docRef = db.collection('payment').doc();

        await docRef.set({
            "member_id": data.member_id,
            "reference": response.data.data.reference,
            "access_code": response.data.data.access_code,
            "amount": data.amount,
            "is_paid": false
        })

        return res.status(200).json({
            "message" : "transaction initialized",
            "authorization_url" : response.data.data.authorization_url
        });
    }).catch((error) => {
        console.log(error);
        return res.status(400).json({
            "message": error.message
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

        const snapshot = await db.collection('payment').where("reference", "==", reference).get();
        const member = await db.collection('members').where('memberId', '==', snapshot.docs[0].get('member_id')).get();
        member.forEach(doc => {
            batch.update(doc.ref, { membershipStatus: true});
        });
        
        snapshot.forEach(doc => {
            batch.update(doc.ref, { is_paid: true });
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

async function charge(req, res) {
    const docRef = db.collection('payment').doc('test');

    await docRef.set({
        is_paid: true
    }).then((data)=>{
        console.log(data)
    })

    res.sendStatus(200);
}

module.exports = {createPayment, verifyPayment, charge}