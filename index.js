// const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// const app = express();

// // Middleware
// app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "e-commerce"
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import all models
const Product = require('./models/product');
const User = require('./models/user');
const Order = require('./models/order');
const Review = require('./models/review');
const Wishlist = require('./models/wishlist');
const Payment = require('./models/payment');

//Testing
const { createUser } = require('./crud/create');


(async () => {
  try {
    await createUser({
      username: 'alice123',
      email: 'alice@example.com',
      password: 'securepassword',
      role: 'customer',
      address: {
        street: '42 Garden Ave',
        city: 'Cape Town',
        postalCode: '8001',
        country: 'South Africa'
      }
    });
    console.log('User created');
  } catch (err) {
    console.error('Error creating user:', err);
  }
}); // () to test it

const {updateUser} = require('./crud/update');

(async ()=>{
  try {
    await updateUser('6838255fb4825c62eb7b7650',{username: 'Joseph22'})
    console.log('User updated');
  } catch (err) {
    console.error('Error creating user:', err);
  }
}); //add () to test
//=========================================================================

// // Test route
// app.get('/', (req, res) => {
//   res.send('E-commerce API is running...');
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });
