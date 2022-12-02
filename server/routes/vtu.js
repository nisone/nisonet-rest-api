const express = require('express');

const {allPlans, getCables, getNetworks, getNetworkId, getCableId, airtimeTopup, purchaseData, cableSubscription} = require('../controllers/vtu.js');
const router = express.Router();


router.get('/plans', allPlans);
router.get('/cables', getCables);
router.get('/networks', getNetworks);
router.get('/cables/:name', getCableId);
router.get('/networks/:name', getNetworkId);
router.post('/topup', airtimeTopup);
router.post('/data', purchaseData);
router.post('/cablesub', cableSubscription);

module.exports = router;