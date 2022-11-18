const express = require('express');

const {airtimeTopup, purchaseData, cableSubscription} = require('../controllers/vtu.js');
const router = express.Router();

router.post('/topup', airtimeTopup);
router.post('/data', purchaseData);
router.post('/cablesub', cableSubscription);

module.exports = router;