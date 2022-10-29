const express = require('express');

const {createPayment, verifyPayment, charge} = require('../controllers/payments.js');
const router = express.Router();

router.post('/init', createPayment);
router.get('/verify/:reference', verifyPayment);
router.post('/charge', charge);

module.exports = router;