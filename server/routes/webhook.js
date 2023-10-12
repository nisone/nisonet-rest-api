const express = require('express');
const { db, admin } = require('../db/conn.js');

const router = express.Router();

let crypto = require('crypto');
const { default: axios } = require('axios');
const { Timestamp } = require('firebase-admin/firestore');
const { handleTransferSuccess, handleTransferFailed, handleTransferReversed } = require('../controllers/webhook.js');
const { getUserByEmail } = require('../controllers/users.js');
const { fcmSendToDevice } = require('../controllers/notification.js');
// Using Express
router.post("/transaction/verify", function (req, res) {
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_LIVE_SK).update(JSON.stringify(req.body)).digest('hex');
    if (hash != req.headers['x-paystack-signature']) {
        return res.sendStatus(403);
    }
    const { event, data } = req.body;

    if (event == 'charge.success') {
        updatePaymentStatus(data)
            .then(() => {
                // Todo: notify user on successful payment
                res.sendStatus(200);
            })
            .catch(() => {
                // Todo: notify user on error
                console.log('Server error processing transaction data');
                res.sendStatus(500);
            });
    }

    // handle successful assigning of DVA to customer
    if (event == 'dedicatedaccount.assign.success') {
        assignDvaToCustomer(data)
            .then(() => {
                // Todo: notify user on successful payment
                res.sendStatus(200);
            })
            .catch(() => {
                // Todo: notify user on error
                console.log('Server error processing transaction data');
                res.sendStatus(500);
            });
    }

    // handle failed assigning of DVA to customer
    if (event == 'dedicatedaccount.assign.failed') {
        res.sendStatus(200);
    }

    // handle tranfer success
    if (event == 'transfer.success') {
        handleTransferSuccess(data)
            .then(() => {
                // Todo: notify user on successful payment
                res.sendStatus(200);
            })
            .catch(() => {
                // Todo: notify user on error
                console.log('Server error processing transaction data');
                res.sendStatus(500);
            });
    }

    // handle tranfer failed
    if (event == 'transfer.failed') {
        handleTransferFailed(data)
            .then(() => {
                // Todo: notify user on successful payment
                res.sendStatus(200);
            })
            .catch(() => {
                // Todo: notify user on error
                console.log('Server error processing transaction data');
                res.sendStatus(500);
            });
    }

    // handle transfer revers
    if (event == 'transfer.reversed') {
        handleTransferReversed(data)
            .then(() => {
                // Todo: notify user on successful payment
                res.sendStatus(200);
            })
            .catch(() => {
                // Todo: notify user on error
                console.log('Server error processing transaction data');
                res.sendStatus(500);
            });

    }

    // res.sendStatus(200);
});

router.get('/update-users', (req, res) => {
    db.collection('users').get().then((docs) => {
        docs.forEach((doc) => {
            if (doc.data.user_class == undefined) {
                doc.ref.update({
                    'user_class': 'customer',
                    'updated_at': Timestamp.now()
                });
            }
        });
    }).catch((e) => { console.log(e.message) });
});

router.post("/test/transaction/verify", function (req, res) {
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_TEST_SK).update(JSON.stringify(req.body)).digest('hex');
    if (hash != req.headers['x-paystack-signature']) {
        return res.sendStatus(403);
    }
    const { event, data } = req.body;

    if (event == 'charge.success') {
        updatePaymentStatus(data)
            .then(() => {
                // Todo: notify user on successful payment
                res.sendStatus(200);
            })
            .catch(() => {
                // Todo: notify user on error
                console.log('Server error processing transaction data');
                res.sendStatus(500);
            })
    }

    // handle successful assigning of DVA to customer
    if (event == 'dedicatedaccount.assign.success') {
        assignDvaToCustomer(data)
            .then(() => {
                // Todo: notify user on successful payment
                res.sendStatus(200);
            })
            .catch(() => {
                // Todo: notify user on error
                console.log('Server error processing transaction data');
                res.sendStatus(500);
            });
    }

    // handle failed assigning of DVA to customer
    if (event == 'dedicatedaccount.assign.failed') {
        res.sendStatus(200);
    }

    // handle tranfer success
    if (event == 'transfer.success') {
        handleTransferSuccess(data);
    }

    // handle tranfer failed
    if (event == 'transfer.failed') {
        handleTransferFailed(data);
    }

    // handle transfer revers
    if (event == 'transfer.reversed') {
        handleTransferReversed(data);
    }
    // res.sendStatus(200);
});

router.post("/vtu", function (req, res) {
    const event = req.body;
    console.log(event);
    res.sendStatus(200);
});

router.post("/vtu/n3tdata", function (req, res) {
    const event = req.body;
    console.log(event);
    res.sendStatus(200);
});

const assignDvaToCustomer = async (data) => {
    try {
        let { customer, dedicated_account } = data;
        let customerUserRecord = await getUserByEmail(customer["email"]);
        let { uid } = customerUserRecord;

        let customerUserDoc = await db.collection('users').doc(uid).get();
        if (!customerUserDoc.exists) {
            console.log(customer['email'], ': user document not exist');
        }

        await customerUserDoc.ref.update({
            'paystack_customer': {
                'customer_code': customer['customer_code'],
                'id': customer['id'],
                'risk_action': customer['risk_action'],
            },
            'paystack_dedicated_account': {
                'account_name': dedicated_account['account_name'],
                'account_number': dedicated_account['account_number'],
                'active': dedicated_account['active'],
                'assigned': dedicated_account['assigned'],
                'account_name': dedicated_account['account_name'],
                'assignment': dedicated_account['assignment'],
                'bank': dedicated_account['bank'],
                'id': dedicated_account['id'],
            }
        });


        await admin.messaging().sendToDevice(customerUserDoc.get('fcm_token'), {
            notification: {
                'body': 'Your Dedicated Account have been assigned successful.',
                'title': 'DVA Assigned'
            }
        });
    } catch (error) {
        console.error(error);
    }
}

const updatePaymentStatus = async (data) => {
    const { reference, metadata } = data;
    // const amount = data.amount;
    // const authorization = data.authorization;
    try {


        const paymentSnapshot = await db.collection('payment').doc(reference).get();
        if (paymentSnapshot.get('status') == data.status) {
            return;
        }
        await paymentSnapshot.ref.update({
            status: data.status,
            updatedAt: Timestamp.now()
        });

        if (data.status != 'success') {
            return;
        }

        console.log('Fetching user data');
        console.log(metadata.uid);

        const batch = db.batch();

        const customerSnapshot = await db.collection('users').doc(metadata.uid).get();

        let creditBalance = customerSnapshot.get('credit');
        let paymentAmount = paymentSnapshot.get('amount');

        // testing session
        let recentTransaction = customerSnapshot.get('recent_transactions');
        console.log('Recent: ', recentTransaction);
        recentTransaction = recentTransaction.map((value) => {
            if (value.reference == reference) {
                value.status = 'success';
            }
            return value;
        });
        console.log('Recent: ', recentTransaction);

        // end testing session

        let newCreditBalance = creditBalance + paymentAmount;
        console.log(newCreditBalance);
        await customerSnapshot.ref.update({
            credit: newCreditBalance,
            recent_transactions: recentTransaction, // testing value
            updated_at: Timestamp.now()
        });

        await batch.commit();
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = router;