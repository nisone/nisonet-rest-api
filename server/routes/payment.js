const express = require('express');

const { createPayment, paymentCallback, verifyPayment, charge, assignDvaToCustomer, requeryCustomerDva, fetchCustomer } = require('../controllers/payments.js');
const router = express.Router();

router.post('/init', createPayment);
router.get('/verify/:reference', verifyPayment);
router.get('/callback', paymentCallback);
router.post('/charge', charge);

// DVA routes
router.post('/dedicated_account/assign', assignDvaToCustomer);
router.post('/dedicated_account/requery', requeryCustomerDva);
router.post('/customer/', fetchCustomer);

module.exports = router;