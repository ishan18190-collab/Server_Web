const router = require('express').Router();
const controller = require('../controllers/product.controller');
const { validateProductBody, validateProductId } = require('../middleware/validate-product');

router.route('/')
  .get(controller.getAllProducts)
  .post(validateProductBody, controller.createProduct);

router.route('/:id')
  .all(validateProductId)
  .get(controller.getProductById)
  .put(validateProductBody, controller.updateProduct)
  .delete(controller.deleteProduct);

module.exports = router;
