const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { Timestamp } = require('firebase-admin/firestore');
const { db } = require('../db/conn.js');
const plans = require('../data/n3tdata.json');
const apiEndpoint = 'https://n3tdata.com/api';

const headers = {
    'Authorization': `Token 188f68b43c7511fae98ef97bb574323ce0ab6d0d0fd1934147dd09aaa053`,
    // 'Authorization': `Token 116fdc5312b3613d167484b674d3dfd256af330ef3241feb1707f0944d7a`,// 'Authorization': `Token 188f68b43c7511fae98ef97bb574323ce0ab6d0d0fd1934147dd09aaa053`,
    'Content-Type': 'application/json'
};

async function allPlans(req, res) {
    res.status(200).json(plans);
}

async function airtimeTopup(req, res) {
    axios.post(`${apiEndpoint}/topup`, {
        'network': req.body.network,
        'phone': req.body.mobile_number,
        'plan_type': 'VTU',
        'bypass': req.body.portedNumber == undefined ? false : req.body.portedNumber,
        'amount': req.body.amount,
        'request-id': req.body.request_id
    }, {
        headers: headers
    }).then(async (response) => {

        const { status, message } = response.data;

        if (status == "fail") {
            console.log(response.data.response);

            return res.status(500).json({
                "status": status,
                "message": message,
                "data": response.data
            });
        }

        return res.status(201).json({
            "status": status,
            "message": message,
            "data": response.data
        });
    }).catch((error) => {
        console.log(error);

        if (error.code === "ENETUNREACH") {
            return res.status(500).json({
                "message": error.message
            });
        }

        if (error.response.data.message.startsWith('Insufficient Account Kindly Fund Your Wallet')) {
            return res.status(400).json({
                "message": error.message,
                "data": {
                    'status': 'fail',
                    'data': 'Account out of service'
                }
            });
        }

        return res.status(400).json({
            "message": error.message,
            "data": {
                'status': 'fail',
                'data': error.message
            }
        });
    });
}

async function purchaseData(req, res) {
    console.log(req.user)
    try {
        validationResult(req).throw();
        axios.post(`${apiEndpoint}/data`, {
            "network": req.body.network,
            "phone": req.body.mobile_number,
            "data_plan": req.body.plan,
            "bypass": req.body.portedNumber == undefined ? false : req.body.portedNumber,
            "request-id": req.body.request_id
        }, {
            headers: headers,
        }).then(async (response) => {

            const { status, message } = response.data;

            if (status == "fail") {
                console.log(response.data.response);

                return res.status(500).json({
                    "status": status,
                    "message": message,
                    "data": response.data
                });
            }

            return res.status(201).json({
                "status": status,
                "message": message,
                "data": response.data
            });
        }).catch((error) => {
            console.log(error);

            if (error.code === "ENETUNREACH") {
                return res.status(500).json({
                    "message": error.message
                });
            }

            if (error.response.data.message.startsWith('Insufficient Account Kindly Fund Your Wallet')) {
                return res.status(400).json({
                    "message": error.message,
                    "data": {
                        'status': 'fail',
                        'data': 'Account out of service'
                    }
                });
            }

            return res.status(400).json({
                "message": error.message,
                "data": {
                    'status': 'fail',
                    'data': error.message
                }
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
        axios.post(`${apiEndpoint}/cablesub`, {
            "cable": req.body.cable,
            "iuc": req.body.iuc,
            "cable_plan": req.body.plan,
            "bypass": req.body.bypass == undefined ? false : req.body.bypass,
            "request-id": req.body.request_id
        }, {
            headers: headers,
        }).then(async (response) => {
            const { status, message } = response.data;

            if (status == "fail") {
                console.log(response.data.response);

                return res.status(500).json({
                    "status": status,
                    "message": message,
                    "data": response.data
                });
            }

            else if (status == 'success') {
                return res.status(201).json({
                    "status": true,
                    "message": "Cable subscription successful",
                    "data": response.data
                });
            }

            return res.status(201).json({
                "status": status,
                "message": message,
                "data": response.data
            });
        }).catch((error) => {
            console.log(error);

            if (error.code === "ENETUNREACH") {
                return res.status(500).json({
                    "message": error.message
                });
            }

            if (error.response.data.message.startsWith('Insufficient Account Kindly Fund Your Wallet')) {
                return res.status(400).json({
                    "message": error.message,
                    "data": {
                        'status': 'fail',
                        'data': 'Account out of service'
                    }
                });
            }

            return res.status(400).json({
                "message": error.message,
                "data": {
                    'status': 'fail',
                    'data': error.message
                }
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
    res.status(200).json({ "networks": plans.networks });
}

async function getCables(req, res) {
    res.status(200).json({ "cables": plans.cable });
}

async function getPlansByNetwork(req, res) {
    const networkName = req.params.network;
    if (networkName == undefined) {
        return res.sendStatus(404);
    }
    networkName = networkName.toUpperCase();
    res.status(200).json({
        'data_plans': plans.data_plans.filter((value) => {
            return value.plan_network == networkName;
        })
    });
}

async function getNetworkId(req, res) {
    const networkName = req.params.name;
    let id;
    if (plans.networks.find((value) => {
        if (value.name == networkName) {
            id = value.id;
            return true;
        }
        return false;
    }) == undefined) {
        return res.sendStatus(404);
    }
    res.status(200).json({ 'id': id });
}

async function getCableId(req, res) {
    const networkName = req.params.name;
    let id;
    if (plans.cable.find((value) => {
        if (value.name == networkName) {
            id = value.id;
            return true;
        }
        return false;
    }) == undefined) {
        return res.sendStatus(404);
    }
    res.status(200).json({ 'id': id });
}

module.exports = { allPlans, getPlansByNetwork, getCables, getNetworks, getNetworkId, getCableId, airtimeTopup, purchaseData, cableSubscription }