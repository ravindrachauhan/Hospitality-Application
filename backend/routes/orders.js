const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/',                  orderController.getAll);
router.get('/:id',               orderController.getById);
router.post('/',                 orderController.create);
router.patch('/:id/payment',     orderController.updatePayment);
router.delete('/:id',            orderController.delete);

module.exports = router;