const express = require('express');
const { body } = require('express-validator');
const { authMiddleWare } = require('../middlewares/auth.js');
const { allPlans, getCables, getNetworks, getNetworkId, getCableId, airtimeTopup, purchaseData, cableSubscription, getPlansByNetwork } = require('../controllers/vtu.js');
const router = express.Router();

router.get('/plans', allPlans);
router.get('/plans/:network', getPlansByNetwork);
router.get('/cables', getCables);
router.get('/networks', getNetworks);
router.get('/cables/:name', getCableId);
router.get('/networks/:name', getNetworkId);
router.post('/topup', authMiddleWare, airtimeTopup);
router.post('/data', authMiddleWare, purchaseData);
router.post('/cablesub', authMiddleWare, cableSubscription); 

module.exports = router;