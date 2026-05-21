const mongoose = require('mongoose');

const CANCELLATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const cancellationRequestSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: Object.values(CANCELLATION_STATUS),
      default: CANCELLATION_STATUS.PENDING,
    },
    shopResponse: {
      type: String,
      default: '',
    },
    processedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

cancellationRequestSchema.index({ orderId: 1 });
cancellationRequestSchema.index({ userId: 1 });
cancellationRequestSchema.index({ status: 1 });

const CancellationRequest = mongoose.model(
  'CancellationRequest',
  cancellationRequestSchema
);

module.exports = { CancellationRequest, CANCELLATION_STATUS };
