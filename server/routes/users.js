const { authMiddleWare } = require('../middlewares/auth.js');
const express = require('express');
const { isAdmin } = require('../middlewares/check_admin_claims.js');
const { registerUser, userLogin, updateUser, deleteUser, assignAdmin } = require('../controllers/users.js');

const router = express.Router();

router.post('/', registerUser);
router.post('/login', userLogin);
router.patch('/', authMiddleWare, updateUser);
router.delete('/', authMiddleWare, deleteUser);
router.post('/assignAdmin', isAdmin, assignAdmin);

module.exports = router;