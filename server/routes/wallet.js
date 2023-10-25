const { authMiddleWare } = require('../middlewares/auth.js');
const express = require('express');
const { transfer } = require('../controllers/wallet.js');
const { check, body } = require('express-validator');

const router = express.Router();

// router.post('/transfer', authMiddleWare, transfer);
router.post('/transfer', [
  body("sender", "sender uid is required").not().isEmpty().escape(),
  body("recipient", "recipient uid is required").not().isEmpty().escape().custom((value, { req }) => {
    return value !== req.body.sender;
  }),
  body("amount", "amount is required and most be numeric").isFloat().not().isString().custom((value, { req }) => {
    return value > 0;
  }),
  check("memo", "memo is optional but most be a text").optional().isString().escape()
], transfer);

module.exports = router;