const express = require('express');

const {sendSmsNotification} = require('../controllers/notification.js');
const router = express.Router();

router.post('/message', sendSmsNotification);

module.exports = router;