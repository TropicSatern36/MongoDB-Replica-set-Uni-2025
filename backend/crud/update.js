const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const Review = require('../models/review');
const Wishlist = require('../models/wishlist');
const Payment = require('../models/payment');

//User
async function updateUser(userId, updateData) {
  try {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  } catch (error) {
    throw error;
  }
}

// PRODUCT
async function updateProduct(productId, updateData) {
  try {
    updateData.updatedAt = Date.now(); // Ensure updatedAt is refreshed
    return await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true });
  } catch (error) {
    throw error;
  }
}

// ORDER
async function updateOrder(orderId, updateData) {
  try {
    // You may want to restrict updates to only paymentStatus or deliveryStatus depending on business rules //idk if want to implement
    return await Order.findByIdAndUpdate(orderId, updateData, { new: true, runValidators: true });
  } catch (error) {
    throw error;
  }
}

// REVIEW
async function updateReview(reviewId, updateData) {
  try {
    return await Review.findByIdAndUpdate(reviewId, updateData, { new: true, runValidators: true });
  } catch (error) {
    throw error;
  }
}

// WISHLIST
async function updateWishlist(wishlistId, updateData) {
  try {
    return await Wishlist.findByIdAndUpdate(wishlistId, updateData, { new: true, runValidators: true });
  } catch (error) {
    throw error;
  }
}

// PAYMENT
async function updatePayment(paymentId, updateData) {
  try {
    // Protect `transactionId` if already set
    const payment = await Payment.findById(paymentId);
    if (payment && payment.transactionId && updateData.transactionId && payment.transactionId !== updateData.transactionId) {
      throw new Error('Cannot change existing transactionId');
    }

    return await Payment.findByIdAndUpdate(paymentId, updateData, { new: true, runValidators: true });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  updateUser,
  updateProduct,
  updateOrder,
  updateReview,
  updateWishlist,
  updatePayment
};

