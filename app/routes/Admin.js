const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/AdminController');
const auth       = require('../middleware/auth');

router.use(auth);

router.get('/users', controller.getUsers);

module.exports = router;
