const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.get('/product/:productId', reviewController.getReviewsByProduct);
router.post('/', authenticate, reviewController.createReview);

module.exports = router;
