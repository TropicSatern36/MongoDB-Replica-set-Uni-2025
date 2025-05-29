const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  deliveryStatus: { type: String, enum: ['processing', 'shipped', 'delivered'], default: 'processing' },
  orderedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
