const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const Review = require('../models/review');
const Wishlist = require('../models/wishlist');
const Payment = require('../models/payment');


//============================================
//Creating a User
async function createUser(userData) {
  try {
    const newUser = new User(userData);
    console.log(newUser);
    return await newUser.save();
  } catch (error) {
    throw error;
  }
}

//============================================



//============================================
//Products
async function createProduct(productData) {
  try {
    const newProduct = new Product(productData);
    console.log(newProduct);
    return await newProduct.save();
  } catch (error) {
    throw error;
  }
}
//============================================


//============================================
//Orders
async function createOrder(orderData) {
  try {
    const newOrder = new Order(orderData);
    console.log(newOrder);
    return await newOrder.save();
  } catch (error) {
    throw error;
  }
}
//============================================

//============================================
//Rerviews
async function createReview(reviewData) {
  try {
    const newReview = new Review(reviewData);
    console.log(newReview);
    return await newReview.save();
  } catch (error) {
    throw error;
  }
}
//============================================


//============================================
//Wishlist
async function createWishlist(wishlistData) {
  try {
    const newWishlist = new Wishlist(wishlistData);
    console.log(newWishlist);
    return await newWishlist.save();
  } catch (error) {
    throw error;
  }
}

// ================= PAYMENT ==================
async function createPayment(paymentData) {
  try {
    const newPayment = new Payment(paymentData);
    console.log(newPayment);
    return await newPayment.save();
  } catch (error) {
    throw error;
  }
}


module.exports = {
  createUser,
  createProduct,
  createOrder,
  createReview,
  createWishlist,
  createPayment
};

