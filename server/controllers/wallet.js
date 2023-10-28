const { validationResult, matchedData } = require('express-validator');
const { admin, db } = require('../db/conn.js');
const { FieldValue, Timestamp } = require('firebase-admin/firestore');
const { createHmac } = require('node:crypto');

const users = db.collection('users');
const wallets = db.collection('wallets');
const fee = 1;

const transfer = (req, res) => {
  try {
    const errors = validationResult(req);
    const { sender, recipient, amount, memo } = matchedData(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(500).json({ status: false, message: 'missing fields', errors: errors });
    }

    const senderRef = users.doc(sender);
    const recipientRef = users.doc(recipient);
    const walletHistory = wallets.doc();
    let senderFcmToken;
    let recipientFcmToken;


    db.runTransaction(async (transaction) => {
      const senderDoc = await transaction.get(senderRef);
      const recipientDoc = await transaction.get(recipientRef);

      const senderBalance = senderDoc.get('credit');
      const recipientBalance = recipientDoc.get('credit');
      senderFcmToken = senderDoc.get('fcm_token');
      recipientFcmToken = recipientDoc.get('fcm_token');
      const totalAmount = (amount + fee);
      const senderNewBalance = senderBalance - totalAmount;
      const recipientNewBalance = recipientBalance + amount;

      if (senderBalance < totalAmount) {
        return Promise.reject('insufficient balance');
      }

      transaction.update(senderRef, {
        'credit': senderNewBalance,
        'updated_at': Timestamp.now()
      });

      transaction.update(recipientRef, {
        'credit': recipientNewBalance,
        'updated_at': Timestamp.now()
      });

      const timestamp = Timestamp.now();

      const hashed = await hash(sender, `${sender},${recipient},${amount},${fee},${memo},${timestamp}`);

      console.log(hashed);
      transaction.create(walletHistory, {
        'from': sender,
        'to': recipient,
        'amount': amount,
        'fee': fee,
        'memo': memo ?? '',
        'timestamp': timestamp,
        'viewers': [sender, recipient],
        'hash': hashed
      });

    })
      .then((value) => {
        try {
          if (recipientFcmToken) {
            admin.messaging().sendToDevice(recipientFcmToken, {
              notification: {
                title: `You have received ${amount} from ${sender}.`,
                body: `The sum of ${amount} have been received from ${sender}`,
              }
            });
          }

          if (senderFcmToken) {
            admin.messaging().sendToDevice(senderFcmToken, {
              notification: {
                title: `Payment Sent`,
                body: `-${amount} credit transfered to ${recipient} a fee of ${fee} unit is charged`,
              }
            });
          }
        } catch (error) {
          console.log('failed to send notication');
        }

        res.status(200).json({
          status: true, message: 'transfer successful', errors: errors
        });
      })
      .catch((reason) => {
        res.status(500).json({
          status: false, message: 'transaction error', reason: reason, errors: errors
        });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false, message: 'internal server error', errors: error
    });
  }

}

async function hash(secret, data) {
  let crypto;
  try {

    crypto = require('node:crypto');

    const hashed = createHmac('sha256', secret)
      .update(data)
      .digest('hex');
    console.log(hash);
    return hashed
  } catch (error) {
    console.error('crypto support is disabled!');
  }
}

module.exports = { transfer };