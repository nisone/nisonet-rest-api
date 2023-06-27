const { db, testFirebase } = require('../db/conn')


const COLLECTION_NAME = "payments"
const DOCUMENTS_NAME = "kalyfa"

export async function createPayment(params) {
    const docRef = db.collection('kalifa').doc('payment');

    await docRef.set({
        is_paid: true
    }).then((data)=>{
        console.log(data)
    })
    const docRef1 = db.collection('kalifa').doc('products');
}

