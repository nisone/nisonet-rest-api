const { json } = require("body-parser");
const admin = require("firebase-admin");
const firestore  = require('firebase-admin/firestore');

const serviceAccount = JSON.parse(process.env.NISONET_FIREBASE_CONFIG);
// const KDYEFServiceAccount = JSON.parse(process.env.KDYEF_FIREBASE_CONFIG);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// const kdyef = admin.initializeApp({
//   credential: admin.credential.cert(KDYEFServiceAccount),
// }, 'kdyef');

const db = firestore.getFirestore();
// const kdyefDb = firestore.getFirestore(kdyef);

async function testFirebase(){
   try {
    console.log('writing to default firestore');
    const r1 = await db.collection('test').doc('nisonet-rest-api-test-doc').set({title: "Hello, Test!"});
    // console.log('writing to default firestore');
    // const r2 = await kdyefDb.collection('test').doc('kdyef-test-doc').set({title: "Hello, Test!"});
    if (r1){
        console.log('Google fire-store Connected Successfully😀')
    }
   } catch (error) {
     console.log(error);
        console.log('Google fire-store Connection Failed, Please Check your settings')
   }
}

module.exports = {admin, db, testFirebase}