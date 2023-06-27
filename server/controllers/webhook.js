const axios = require('axios');
const { Timestamp } = require('firebase-admin/firestore');
const {db, kdyefDb} = require('../db/conn.js');
const PAYSTACK_ENDPOINT = 'https://api.paystack.co/';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.ENVIRONMENT == 'production' 
    ? process.env.PAYSTACK_LIVE_SK : process.env.PAYSTACK_TEST_SK}`
}

async function createPayment() {
    
}

const handleTransferSuccess = async (data) => {
    try {
        console.log(data);
    } catch (error) {
        console.error(error.message);
    }
}

const handleTransferFailed = async (data) => {
    try {
        console.log(data);
    } catch (error) {
        console.error(error.message);
    }
}

const handleTransferReversed = async (data) => {
    try {
        console.log(data);
    } catch (error) {
        console.error(error.message);
    }
}

module.exports = {createPayment, handleTransferSuccess, handleTransferFailed, handleTransferReversed}