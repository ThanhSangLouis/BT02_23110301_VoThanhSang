const express = require('express');
const router = express.Router();
const newsController = require('./news.controller');

router.get('/', newsController.getNews);
router.get('/featured', newsController.getFeaturedNews);
router.get('/latest', newsController.getLatestNews);
router.get('/:slug', newsController.getNewsBySlug);

module.exports = router;
