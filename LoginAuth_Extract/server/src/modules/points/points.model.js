const mongoose = require('mongoose');

const { Schema } = mongoose;

const POINT_LEDGER_TYPE = {
  EARN_REVIEW_ORDER: 'earn_review_order',
  SPEND_ORDER: 'spend_order',
  REFUND_ORDER: 'refund_order',
  ADJUST_ADMIN: 'adjust_admin',
};

const PointLedgerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(POINT_LEDGER_TYPE),
      required: true,
      index: true,
    },
    points: {
      type: Number,
      required: true,
    },
    refType: {
      type: String,
      enum: ['order', 'review'],
      required: true,
    },
    refId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

PointLedgerSchema.index({ userId: 1, type: 1, refType: 1, refId: 1 }, { unique: true });

module.exports = {
  PointLedger: mongoose.model('PointLedger', PointLedgerSchema),
  POINT_LEDGER_TYPE,
};
