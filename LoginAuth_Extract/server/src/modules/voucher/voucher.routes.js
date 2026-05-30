const express = require('express');
const router = express.Router();
const VoucherController = require('./voucher.controller');
const { requireAuth, requireAdmin } = require('../../middleware/auth.middleware');

router.post('/validate', requireAuth, VoucherController.validateVoucher);

router.get('/admin', requireAuth, requireAdmin, VoucherController.getVouchersAdmin);
router.post('/admin', requireAuth, requireAdmin, VoucherController.createVoucherAdmin);
router.put('/admin/:id', requireAuth, requireAdmin, VoucherController.updateVoucherAdmin);
router.delete('/admin/:id', requireAuth, requireAdmin, VoucherController.deleteVoucherAdmin);

module.exports = router;
