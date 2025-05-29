const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const Review = require('../models/review');
const Wishlist = require('../models/wishlist');
const Payment = require('../models/payment');


//============================================
//Users

//Displaying all users
async function getAllUsers() {
  try {
    console.log('Attempting to fetch all users...');
    const users = await User.find();
    console.log('Fetched users:', users);
    return users;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
}

//getting the user by ID
async function getUserById(userId) {
  try {
    const dataUser = await User.findById(userId);
    return dataUser 
  } catch (error) {
    throw error;
  }
}

//getting the user by their email
async function getUserByEmail(email) {
    try {
    const dataUser = await User.findOne({ email });
    return dataUser;
  } catch (error) {
    throw error;
  }
}

//getting the user their username
async function getUserByUsername(username) {
  try {
    const dataUser = await User.findOne({ username });
    console.log(dataUser);
    return dataUser;
  } catch (error) {
    throw error;
  }
}

//============================================



//============================================

//Products
//Returns all the products
async function getAllProducts() {
  try {
    return await Product.find().populate('category').populate('reviews');
  } catch (error) {
    throw error;
  }
}

//Searches for a specific product at returns it
async function getProductById(productId) {
  try {
    return await Product.findById(productId).populate('category').populate('reviews');
  } catch (error) {
    throw error;
  }
}

//Searches products by name (case-insensitive, partial match)
async function searchProductsByName(nameQuery) {
  try {
    return await Product.find({ name: { $regex: nameQuery, $options: 'i' } });
  } catch (error) {
    throw error;
  }
}
//============================================



//============================================

//Orders
//Gets all orders
async function getAllOrders() {
  try {
    return await Order.find()
      .populate('products.product')
      .populate('user');
  } catch (error) {
    throw error;
  }
}

//Gets all the orders from a specific user
async function getOrdersByUserId(userId) {
  try {
    return await Order.find({ user: userId })
      .populate('products.product')
      .populate('user');
  } catch (error) {
    throw error;
  }
}

//Gets a specific order 
async function getOrderById(orderId) {
  try {
    return await Order.findById(orderId).populate('user').populate('products.product');
  } catch (error) {
    throw error;
  }
}
//============================================



//============================================

//Review
//Gets all reviews
async function getAllReviews() {
  try {
    return await Review.find()
      .populate('user')
      .populate('product'); 
  } catch (error) {
    throw error;
  }
}

//Gets the reviews for certain products
async function getReviewsByProductId(productId) {
  try {
    return await Review.find({ product: productId })
      .populate('user');
  } catch (error) {
    throw error;
  }
}

//Gets a specific review
async function getReviewById(reviewId) {
  try {
    return await Review.findById(reviewId).populate('user').populate('product');
  } catch (error) {
    throw error;
  }
}
//============================================



//============================================

//Wishlist
//Gets all wishlists
async function getAllWishlists() {
  try {
    return await Wishlist.find().populate('user').populate('products');
  } catch (error) {
    throw error;
  }
}

//Gets a users wishlist
async function getWishlistByUserId(userId) {
  try {
    return await Wishlist.findOne({ user: userId }).populate('products');
  } catch (error) {
    throw error;
  }
}
//============================================



//============================================

//Payments
//Gets all payments
async function getAllPayments() {
  try {
    return await Payment.find().populate('user').populate('order');
  } catch (error) {
    throw error;
  }
}

//Gets the total of payments from a specific date
async function getPaymentsTotalByDateRange(startDate, endDate) {
  try {
    const result = await Payment.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          paidAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    return result[0]?.totalAmount || 0;
  } catch (error) {
    throw error;
  }
}

//Gets a specific payment by id
async function getPaymentById(paymentId) {
  try {
    return await Payment.findById(paymentId).populate('user').populate('order');
  } catch (error) {
    throw error;
  }
}
//============================================


module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  getAllProducts,
  getProductById,
  searchProductsByName,
  getAllOrders,
  getOrdersByUserId,
  getOrderById,
  getAllReviews,
  getReviewsByProductId,
  getReviewById,
  getAllWishlists,
  getWishlistByUserId,
  getAllPayments,
  getPaymentsTotalByDateRange,
  getPaymentById
};
