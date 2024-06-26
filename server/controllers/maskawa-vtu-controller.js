const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { Timestamp } = require('firebase-admin/firestore');
const {db} = require('../db/conn.js');
const plans = require('../data/n3tdata.json');
const apiEndpoint = 'https://www.maskawasub.com/api';

const headers = {
    'Authorization' : `Token d13c4e02092e52c743cccb9dc8a5406adb3202e8`,
    // 'Authorization': `Token 116fdc5312b3613d167484b674d3dfd256af330ef3241feb1707f0944d7a`,// 'Authorization': `Token 188f68b43c7511fae98ef97bb574323ce0ab6d0d0fd1934147dd09aaa053`,
    'Content-Type': 'application/json'
};

async function allPlans(req, res) {
    try {
        var response = await axios.get(`${apiEndpoint}/user`, {
            headers: headers
        }).then(async (response) => {
            var plans = response.data.Dataplans;
            
            if(plans == undefined){
                return res.status(404).json({
                    "message": "Plan not found!" 
                });
            }
            return res.status(200).json(plans);
        }).catch((error) => {
            console.log(error);
            return res.status(400).json({
                "message": error.message,
                "data" : error.response.data
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            "message": error.message,
            "data" : error.response.data
        });
    }
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
            "mobile_number": req.body.mobile_number,
            "plan": req.body.plan,
            "Ported_number": req.body.portedNumber == undefined ? false : req.body.portedNumber
          }, {
            headers: headers,
        }).then((response) => {
            if(response.data.status.count == 0){
                return res.status(400).json({
                    "error": 'Data purchase failed!',
                });
            }
            return res.status(201).json({
                "status": response.data,
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
    try {
        validationResult(req).throw();
        axios.post(`${apiEndpoint}/cablesub`,{
            "cable": req.body.cable,
            "iuc": req.body.iuc,
            "cable_plan": req.body.plan,
            "bypass": req.body.bypass == undefined ? false : req.body.bypass,
            "request-id": `cable_${Date.now()}`
          }, {
            headers: headers,
        }).then(async (response) => {
            if(response.data.status == 'success'){
                return res.status(201).json({
                    "status": true,
                    "message": "Cable subscription successful",
                    "data" : response.data
                });
            }
        }).catch((error) => {
            if(error.code === "ENETUNREACH"){
                return res.status(500).json({
                    "message": error.message
                });
            }
            return res.status(400).json({
                "message": error.message,
                "error": error.response.data
            });
        });
    } catch (error) {
        return res.status(400).json({
            "error": error,
            "message": "Oops! something breaks."
        });
    }
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