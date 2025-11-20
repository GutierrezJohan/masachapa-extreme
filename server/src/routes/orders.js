const express = require('express');
const auth = require('../middlewares/auth');
const controller = require('../controllers/orderController');

const router = express.Router();
router.use(auth);

router.post('/checkout', controller.checkout);

module.exports = router;
