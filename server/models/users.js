const { Timestamp } = require('firebase-admin/firestore');

const {db} = require('../db/conn.js');

const collectionRef = db.collection('users');

async function getUserProfile(uid) {
    try {
        var userDoc = await collectionRef.doc(uid).get();
        console.log('User profile created! uid: ', uid);
        return userDoc.data();
    } catch (error) {
        console.log('User profile not created! uid: ', uid);
        console.log(error);
    }
    return undefined;
}

async function createUserProfile(uid, displayName, email, phone, status) {
    try {
        await collectionRef.doc(uid).set({
            userClass : 'customer',
            name : displayName == undefined ? null : displayName,
            email : email == undefined ? null : email,
            phone : phone == undefined ? null : phone,
            uid : uid,
            credit : 0.0,
            creditSpend : 0.0,
            token : 0.0,
            tokenSpend : 0.0,
            createdAt : Timestamp.now(),
            updatedAt : Timestamp.now(),
            status: status == undefined ? null : true
        });
        console.log('User profile created! uid: ', uid);
        return true;
    } catch (error) {
        console.log('User profile not created! uid: ', uid);
        console.log(error);
        return false;
    }
}

async function updateUserProfile(uid, displayName, email, phone) {
    try {
        await collectionRef.doc(uid).update({
            name : displayName == undefined ? null : displayName,
            email : email == undefined ? null : email,
            phone : phone == undefined ? null : phone,
            updatedAt : Timestamp.now(),
        });
        console.log('User profile created! uid: ', uid);
        return true;
    } catch (error) {
        console.log('User profile not created! uid: ', uid);
        console.log(error);
        return false;
    }
}

async function deleteUserProfile(uid) {
    try {
        await collectionRef.doc(uid).delete();
        console.log('User profile deleted! uid: ', uid);
        return true;
    } catch (error) {
        console.log('User profile not deleted! uid: ', uid);
        console.log(error);
        return false;
    }
}

module.exports = {getUserProfile ,createUserProfile, updateUserProfile, deleteUserProfile};