const express = require('express');
const router = express.Router();
const recentlyViewedController = require('./recentlyViewed.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.post('/:productId', recentlyViewedController.trackView);
router.get('/', recentlyViewedController.getMyRecentlyViewed);

module.exports = router;
