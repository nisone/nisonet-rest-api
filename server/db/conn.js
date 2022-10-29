const admin = require("firebase-admin");
const firestore  = require('firebase-admin/firestore');

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = firestore.getFirestore();

async function testFirebase(){
   try {
        const snapshot = await db.collection('test').doc('test').set({data:'Test'})
        if (snapshot){
            console.log('Google fire-store Connected Successfully😀')
        }
   } catch (error) {
     console.log(error);
        console.log('Google fire-store Connection Failed, Please Check your settings')
   }
}

module.exports = {admin, db, testFirebase}