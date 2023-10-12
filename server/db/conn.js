const { json } = require("body-parser");
const admin = require("firebase-admin");
const firestore = require('firebase-admin/firestore');

const serviceAccount = JSON.parse(process.env.NISONET_FIREBASE_CONFIG);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = firestore.getFirestore();

const fcm = admin.messaging();

async function testFirebase() {
  try {
    console.log('writing to default firestore');
    const r1 = await db.collection('test').doc('nisonet-rest-api-test-doc').set({ title: "Hello, Test!" });
    // const sendVerificationEmail = await db.collection('users').where('user_class', '==', 'reseller').get();

    // sendVerificationEmail.docs.forEach((doc) => {
    //   admin.auth().updateUser(doc.id, {
    //     emailVerified: true,
    //   }).then((user) => {
    //     console.log(doc.id + ' ' + user.emailVerified);
    //   }).catch((er) => {
    //     console.log(er);
    //   });
    // });
    if (r1) {
      console.log('Google fire-store Connected Successfully😀')
    }
  } catch (error) {
    console.log(error);
    console.log('Google fire-store Connection Failed, Please Check your settings')
  }
}

module.exports = { admin, db, testFirebase }