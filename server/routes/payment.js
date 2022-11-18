const express = require('express');

const {createPayment, paymentCallback, verifyPayment, charge} = require('../controllers/payments.js');
const router = express.Router();

router.post('/init', createPayment);
router.get('/verify/:reference', verifyPayment);
router.get('/callback', paymentCallback);
router.post('/charge', charge);

module.exports = router;