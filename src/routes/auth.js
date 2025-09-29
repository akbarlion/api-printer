const express = require('express');
const { login, register, refreshToken, logout } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;