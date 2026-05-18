const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

router.get('/', productController.getProducts);
router.get('/new', productController.getNewProducts);
router.get('/bestsellers', productController.getBestsellers);
router.get('/featured', productController.getFeaturedProducts);
router.get('/related/:id', productController.getRelatedProducts);
router.get('/top-selling', productController.getTopSellingProducts);
router.get('/top-viewed', productController.getTopViewedProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.post('/:id/view', productController.incrementViewCount);
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
