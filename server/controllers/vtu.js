const axios = require('axios');
const { Timestamp } = require('firebase-admin/firestore');
const {db} = require('../db/conn.js');
const MASKAWA_API= 'https://www.maskawasub.com/api';

const headers = {
    'Authorization': 'Token d13c4e02092e52c743cccb9dc8a5406adb3202e8',
    'Content-Type': 'application/json'
};

async function airtimeTopup(req, res) {
    axios.post(`${MASKAWA_API}/topup`, {
        headers: headers
    }).then(async (response) => {
        
        return res.status(201).json({
            "status": true,
            "message": "Airtime topup successful"
        });
    }).catch((error) => {
        console.log(error);
        return res.status(400).json({
            "message": error.message
        });
    });
}

async function purchaseData(req, res) {
    axios.post(`${MASKAWA_API}/data`, {
        headers: headers
    }).then(async (response) => {
        
        return res.status(201).json({
            "status": true,
            "message": "Data purchase successful"
        });
    }).catch((error) => {
        console.log(error);
        return res.status(400).json({
            "message": error.message
        });
    });
}

async function cableSubscription(req, res) {
    axios.post(`${MASKAWA_API}/cablesub`, {
        headers: headers
    }).then(async (response) => {
        if(response.status != 201){
            return res.status(response.status).json({
                "status": false,
                "message": response.data.message
            });
        }

        return res.status(201).json({
            "status": true,
            "message": "Cable subscription successful"
        });
    }).catch((error) => {
        console.log(error.message);
        if(error.code === "ENETUNREACH"){
            return res.status(500).json({
                "message": error.message
            });
        }
        return res.status(400).json({
            "message": error.message
        });
    });
}

module.exports = {airtimeTopup, purchaseData, cableSubscription}