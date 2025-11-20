const express = require('express');
const auth = require('../middlewares/auth');
const controller = require('../controllers/cartController');

const router = express.Router();

router.use(auth);

router.get('/', controller.getCart);
router.post('/items', controller.addItem);
router.patch('/items/:productId', controller.updateItem);
router.delete('/items/:productId', controller.removeItem);
router.delete('/', controller.clear);

module.exports = router;
