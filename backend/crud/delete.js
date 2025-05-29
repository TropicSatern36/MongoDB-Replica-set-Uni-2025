const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const Review = require('../models/review');
const Wishlist = require('../models/wishlist');
const Payment = require('../models/payment');

//============================================
//Deleting User

async function deleteUser(userId) {
  try {
    const dataDelete = await User.findByIdAndDelete(userId);
    console.log(dataDelete);
    return dataDelete
  } catch (error) {
    throw error;
  }
}
//============================================

//============================================
//Products
async function deleteProduct(productId) {
  try {
    const dataDelete = await Product.findByIdAndDelete(productId);
    console.log(dataDelete);
    return dataDelete;
  } catch (error) {
    throw error;
  }
}
//============================================


//============================================
//Orders
async function deleteOrder(orderId) {
  try {
    const dataDelete = await Order.findByIdAndDelete(orderId);
    console.log(dataDelete);
    return dataDelete;
  } catch (error) {
    throw error;
  }
}
//============================================


//============================================
//Reviews
async function deleteReview(reviewId) {
  try {
    const dataDelete = await Review.findByIdAndDelete(reviewId);
    console.log(dataDelete);
    return dataDelete;
  } catch (error) {
    throw error;
  }
}
//============================================


//============================================
//Wishlist
async function deleteWishlist(wishlistId) {
  try {
    const dataDelete = await Wishlist.findByIdAndDelete(wishlistId);
    console.log(dataDelete);
    return dataDelete;
  } catch (error) {
    throw error;
  }
}
//============================================




//============================================
//Payments
async function deletePayment(paymentId) {
  try {
    const dataDelete = await Payment.findByIdAndDelete(paymentId);
    console.log(dataDelete);
    return dataDelete;
  } catch (error) {
    throw error;
  }
}
//============================================



module.exports = {
  deleteUser,
  deleteProduct,
  deleteOrder,
  deleteReview,
  deleteWishlist,
  deletePayment
};