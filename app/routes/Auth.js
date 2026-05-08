const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/AuthController');
const { loginLimiter } = require('../middleware/rateLimiter');

router.post('/login',    loginLimiter, controller.login);
router.post('/register', controller.register);

module.exports = router;
