const express = require('express');

const {sendSmsNotification, fcmSend, fcmSendToTopic, fcmSendToDevice} = require('../controllers/notification.js');
const router = express.Router();

router.post('/message', sendSmsNotification);
router.post('/fcm/send/topic', fcmSendToTopic);
router.post('/fcm/send/device', fcmSendToDevice);

module.exports = router;