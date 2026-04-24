const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/AdminController');
const { auth, isAdmin } = require('../middleware/auth');

router.use(auth);
router.use(isAdmin);

router.get('/users', controller.getUsers);

module.exports = router;
