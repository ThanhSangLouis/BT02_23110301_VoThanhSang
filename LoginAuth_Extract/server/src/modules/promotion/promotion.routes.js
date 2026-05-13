const express = require('express');
const router = express.Router();
const promotionController = require('./promotion.controller');

router.get('/', promotionController.getActivePromotions);
router.get('/featured', promotionController.getFeaturedPromotions);
router.get('/:slug', promotionController.getPromotionBySlug);

module.exports = router;
