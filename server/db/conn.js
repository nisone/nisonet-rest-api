const admin = require("firebase-admin");
const firestore  = require('firebase-admin/firestore');

const serviceAccount = require("./serviceAccountKey.json");
const KDYEFServiceAccount = require("./KDYEFServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const kdyef = admin.initializeApp({
  credential: admin.credential.cert(KDYEFServiceAccount),
}, 'kdyef');

const db = firestore.getFirestore();
const kdyefDb = firestore.getFirestore(kdyef);

async function testFirebase(){
   try {
    console.log('writing to default firestore');
    await db.collection('test').doc('nisonet-rest-api-test-doc2').set({title: "Hello, Test!"});
    console.log('writing to default firestore');
    await kdyefDb.collection('test').doc('kdyef-test-doc2').set({title: "Hello, Test!"});
    const snapshot = await db.collection('test').doc('test').set({data:'Test'})
    if (snapshot){
        console.log('Google fire-store Connected Successfully😀')
    }
   } catch (error) {
     console.log(error);
        console.log('Google fire-store Connection Failed, Please Check your settings')
   }
}

module.exports = {admin, db, kdyefDb, testFirebase}