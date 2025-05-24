const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  ref_id: { type: String, unique: true, required: true },
  customer_no: { type: String, required: true },
  buyer_sku_code: { type: String, required: true },
  amount: { type: Number, required: true },
  payment_method: { type: String },
  status_payment: { type: String, default: 'UNPAID' }, // UNPAID, PAID
  status_topup: { type: String, default: 'PENDING' }, // PENDING, SUCCESS, FAILED
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

transactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
