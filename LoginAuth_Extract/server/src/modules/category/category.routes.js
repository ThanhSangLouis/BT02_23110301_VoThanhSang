const express = require('express');
const router = express.Router();
const categoryController = require('./category.controller');

router.get('/', categoryController.getAllCategories);
router.get('/featured', categoryController.getFeaturedCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

module.exports = router;
