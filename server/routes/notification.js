const express = require('express');

const {sendSmsNotification, fcmSend} = require('../controllers/notification.js');
const router = express.Router();

router.post('/message', sendSmsNotification);
router.post('/fcm/send', fcmSend);

module.exports = router;