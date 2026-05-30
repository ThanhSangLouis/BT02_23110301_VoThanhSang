const express = require('express');
const router = express.Router();
const pointsController = require('./points.controller');
const { authenticate } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.get('/me', pointsController.getMyPoints);

module.exports = router;
