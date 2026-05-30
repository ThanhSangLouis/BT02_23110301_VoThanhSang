const express = require('express');
const router = express.Router();
const wishlistController = require('./wishlist.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/', wishlistController.getMyWishlist);
router.get('/:productId/status', wishlistController.getWishlistStatus);
router.post('/:productId', wishlistController.toggleWishlist);

module.exports = router;
