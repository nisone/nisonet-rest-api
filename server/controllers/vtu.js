const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { Timestamp } = require('firebase-admin/firestore');
const {db} = require('../db/conn.js');
const plans = require('../data/n3tdata.json');
const apiEndpoint = 'https://n3tdata.com/api';

const headers = {
    'Authorization' : `Token 188f68b43c7511fae98ef97bb574323ce0ab6d0d0fd1934147dd09aaa053`,
    // 'Authorization': `Token 116fdc5312b3613d167484b674d3dfd256af330ef3241feb1707f0944d7a`,// 'Authorization': `Token 188f68b43c7511fae98ef97bb574323ce0ab6d0d0fd1934147dd09aaa053`,
    'Content-Type': 'application/json'
};

async function allPlans(req, res) {
    res.status(200).json(plans);
}

async function airtimeTopup(req, res) {
    axios.post(`${apiEndpoint}/topup`,{
        'network' : req.body.network,
        'phone' : req.body.mobile_number,
        'plan_type' : 'VTU',
        'bypass': req.body.portedNumber == undefined ? false : req.body.portedNumber,
        'amount' : req.body.amount,
        'request-id' : `airtime_${Date.now()}`
    }, {
        headers: headers
    }).then(async (response) => {
        
        return res.status(201).json({
            "status": true,
            "message": "Airtime topup successful"
        });
    }).catch((error) => {
        console.log(error);
        return res.status(400).json({
            "message": error.message,
            "data" : error.response.data
        });
    });
}

async function purchaseData(req, res) {
    console.log(req.user)
    try {
        validationResult(req).throw();
        axios.post(`${apiEndpoint}/data`,{
            "network": req.body.network,
            "phone": req.body.mobile_number,
            "data_plan": req.body.plan,
            "bypass": req.body.portedNumber == undefined ? false : req.body.portedNumber,
            "request-id": `data_${Date.now()}`
          }, {
            headers: headers,
        }).then(async (response) => {
            return res.status(201).json({
                "status": true,
                "message": "Data purchase successful",
                "data" : response.data
            });
        }).catch((error) => {
            // console.error(error);
            return res.status(400).json({
                "message": error.message,
                "data": error.response.data
            });
        });
    } catch (error) {
        return res.status(400).json({
            "message": error
        });
    }
}

async function cableSubscription(req, res) {
    axios.post(`${apiEndpoint}/cablesub`, {
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
        console.error(error.message);
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

async function getNetworks(req, res) {
    res.status(200).json({"networks": plans.networks});
}

async function getCables(req, res) {
    res.status(200).json({"cables" : plans.cable});
}

async function getPlansByNetwork(req, res) {
    var networkName = req.params.network;
    if(networkName == undefined){
        return res.sendStatus(404);
    }
    networkName = networkName.toUpperCase();
    res.status(200).json({'data_plans' : plans.data_plans.filter((value) => {
        return value.plan_network == networkName;
    })});
}

async function getNetworkId(req, res) {
    var networkName = req.params.name;
    var id;
    if(plans.networks.find((value) => {
        if(value.name == networkName){
            id = value.id;
            return true;
        }
        return false;
         }) == undefined){
        return res.sendStatus(404);
    }
    res.status(200).json({'id' : id});
}

async function getCableId(req, res) {
    var networkName = req.params.name;
    var id;
    if(plans.cable.find((value) => {
        if(value.name == networkName){
            id = value.id;
            return true;
        }
        return false;
         }) == undefined){
        return res.sendStatus(404);
    }
    res.status(200).json({'id' : id});
}

module.exports = {allPlans,getPlansByNetwork, getCables, getNetworks, getNetworkId, getCableId, airtimeTopup, purchaseData, cableSubscription}