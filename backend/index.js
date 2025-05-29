const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
//require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });


// Connect to MongoDB (moved up)
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "e-commerce"
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const app = express();

console.log('Backend received a request!');

// Middleware
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`Request path: ${req.path}`);
  next();
});

// Import all models (moved up)
const Product = require('./models/product');
const User = require('./models/user');
const Order = require('./models/order');
const Review = require('./models/review');
const Wishlist = require('./models/wishlist');
const Payment = require('./models/payment');
const Category = require('./models/Category');

// Import CRUD operations (moved up)
const { createUser, createProduct, createOrder, createReview, createWishlist, createPayment } = require('./crud/create');
const { updateUser, updateProduct, updateOrder, updateReview, updateWishlist, updatePayment } = require('./crud/update');
const { deleteUser, deleteProduct, deleteOrder, deleteReview, deleteWishlist, deletePayment } = require('./crud/delete');
const { getAllUsers, getAllProducts, getAllOrders, getAllReviews, getAllWishlists, getAllPayments, getUserById, getUserByEmail, getUserByUsername, getProductById, searchProductsByName, getOrdersByUserId, getOrderById, getReviewsByProductId, getReviewById, getWishlistByUserId, getPaymentsTotalByDateRange, getPaymentById } = require('./crud/read');

// Add a simple test route
app.get('/test', (req, res) => {
  console.log('Test route hit!');
  res.send('Test route is working!');
});

// API Routes
app.get('/api/:model', async (req, res) => {
  try {
    console.log(`Received GET request for model: ${req.params.model}`);
    const { model } = req.params;
    let data;
    switch (model.toLowerCase()) {
      case 'user':
        data = await getAllUsers();
        break;
      case 'product':
        data = await getAllProducts();
        break;
      case 'order':
        data = await getAllOrders();
        break;
      case 'review':
        data = await getAllReviews();
        break;
      case 'wishlist':
        data = await getAllWishlists();
        break;
      case 'payment':
        data = await getAllPayments();
        break;
      default:
        console.warn(`Model not found for GET request: ${model}`);
        return res.status(404).json({ error: 'Model not found' });
    }
    console.log(`Successfully fetched data for model: ${model}`);
    res.json(data);
  } catch (error) {
    console.error(`Detailed error in GET /api/${req.params.model}:`, error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/:model', async (req, res) => {
  try {
    const { model } = req.params;
    const data = req.body;
    let result;
    switch (model.toLowerCase()) {
      case 'user':
        result = await createUser(data);
        break;
      case 'product':
        result = await createProduct(data);
        break;
      case 'order':
        result = await createOrder(data);
        break;
      case 'review':
        result = await createReview(data);
        break;
      case 'wishlist':
        result = await createWishlist(data);
        break;
      case 'payment':
        result = await createPayment(data);
        break;
      default:
        return res.status(404).json({ error: 'Model not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/:model/:id', async (req, res) => {
  try {
    const { model, id } = req.params;
    const data = req.body;
    let result;
    switch (model.toLowerCase()) {
      case 'user':
        result = await updateUser(id, data);
        break;
      case 'product':
        result = await updateProduct(id, data);
        break;
      case 'order':
        result = await updateOrder(id, data);
        break;
      case 'review':
        result = await updateReview(id, data);
        break;
      case 'wishlist':
        result = await updateWishlist(id, data);
        break;
      case 'payment':
        result = await updatePayment(id, data);
        break;
      default:
        return res.status(404).json({ error: 'Model not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/:model/:id', async (req, res) => {
  try {
    const { model, id } = req.params;
    let result;
    switch (model.toLowerCase()) {
      case 'user':
        result = await deleteUser(id);
        break;
      case 'product':
        result = await deleteProduct(id);
        break;
      case 'order':
        result = await deleteOrder(id);
        break;
      case 'review':
        result = await deleteReview(id);
        break;
      case 'wishlist':
        result = await deleteWishlist(id);
        break;
      case 'payment':
        result = await deletePayment(id);
        break;
      default:
        return res.status(404).json({ error: 'Model not found' });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
