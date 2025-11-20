const express = require('express');
const auth = require('../middlewares/auth');
const adminOnly = require('../middlewares/adminOnly');
const controller = require('../controllers/productController');

const router = express.Router();

// Public list of active products
router.get('/', controller.list);
// Public single product detail
router.get('/:id', controller.getOne);

// Admin-only operations
router.post('/', auth, adminOnly, controller.create);
router.put('/:id', auth, adminOnly, controller.update);
router.delete('/:id', auth, adminOnly, controller.remove);

module.exports = router;
