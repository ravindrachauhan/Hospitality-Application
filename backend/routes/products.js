const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/alerts/low-stock', productController.getLowStock);   // before /:id
router.get('/categories',       productController.getCategories);
router.get('/',                 productController.getAll);
router.get('/:id',              productController.getById);
router.post('/',                productController.create);
router.put('/:id',              productController.update);
router.patch('/:id/stock',      productController.updateStock);
router.delete('/:id',           productController.delete);

module.exports = router;