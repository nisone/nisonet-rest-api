const {authMiddleWare} = require('../middlewares/auth.js');
const express = require('express');
const { registerUser, updateUser, deleteUser } = require('../controllers/users.js');

const router = express.Router();

router.post('/', registerUser);
router.patch('/', authMiddleWare, updateUser);
router.delete('/', authMiddleWare, deleteUser);

module.exports = router;