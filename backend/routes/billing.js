const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/reports/summary',          billingController.getSummary);    // before /:id
router.get('/customer/:customerId',     billingController.getByCustomer);
router.get('/',                         billingController.getAll);
router.get('/:id',                      billingController.getById);
router.post('/',                        billingController.create);
router.patch('/:id/status',             billingController.updateStatus);
router.delete('/:id',                   billingController.delete);

module.exports = router;