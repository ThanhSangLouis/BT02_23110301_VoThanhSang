const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');

router.use(authenticate);

router.post('/', orderController.createOrder);

router.get('/', orderController.getOrders);

router.get('/all', authorize('admin'), orderController.getAllOrders);

router.get('/cancellation-requests', authorize('admin'), orderController.getCancellationRequests);

router.post('/cancellation-requests/:requestId/process', authorize('admin'), orderController.processCancellationRequest);

router.get('/:orderId', orderController.getOrderById);

router.post('/:orderId/cancel', orderController.cancelOrder);

router.post('/:orderId/request-cancel', orderController.requestCancellation);

router.put('/:orderId/status', authorize('admin'), orderController.updateOrderStatus);

module.exports = router;
