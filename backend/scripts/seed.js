const mongoose = require('mongoose');
require('dotenv').config();
const { faker } = require('@faker-js/faker');

// Import your models
const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');
const Review = require('../models/review');
const Wishlist = require('../models/wishlist');
const Payment = require('../models/payment');
const Category = require('../models/Category'); // Import Category model

// Import your create CRUD functions
const { createUser, createProduct, createOrder, createReview, createWishlist, createPayment } = require('../crud/create');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "e-commerce"
})
.then(() => console.log('Connected to MongoDB for seeding'))
.catch(err => {
  console.error('MongoDB connection error for seeding:', err);
  process.exit(1);
});

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');

    // Clear existing data (optional, but good for fresh seeding)
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Wishlist.deleteMany({});
    await Payment.deleteMany({});
    await Category.deleteMany({}); // Clear categories
    console.log('Cleared existing data.');

    // --- Create Categories ---
    const categories = [];
    const categoryNames = ['Electronics', 'Books', 'Clothing', 'Home & Garden', 'Sports', 'Toys'];
    for (const name of categoryNames) {
      const category = new Category({
        name,
        description: faker.lorem.sentence(),
      });
      await category.save();
      categories.push(category);
      console.log(`Created category: ${category.name}`);
    }

    // --- Create Users ---
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = await createUser({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: faker.helpers.arrayElement(['customer', 'admin']),
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
      });
      users.push(user);
      console.log(`Created user: ${user.email}`);
    }

    // --- Create Products ---
    const products = [];
    for (let i = 0; i < 20; i++) {
      const randomCategory = faker.helpers.arrayElement(categories); // Select a random category
      const product = await createProduct({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        category: randomCategory._id, // Assign the category's ObjectId
        stock: faker.number.int({ min: 0, max: 100 }),
        // Assuming reviews will be linked later
      });
      products.push(product);
      console.log(`Created product: ${product.name}`);
    }

    // --- Create Orders ---
    const orders = [];
    for (let i = 0; i < 15; i++) {
      const randomUser = faker.helpers.arrayElement(users);
      const randomProducts = faker.helpers.arrayElements(products, faker.number.int({ min: 1, max: 5 }));

      const orderProducts = randomProducts.map(p => ({
        product: p._id,
        quantity: faker.number.int({ min: 1, max: 3 }),
      }));

      // Calculate total amount based on selected products and quantities
      const totalAmount = orderProducts.reduce((sum, item) => {
        const product = products.find(p => p._id.equals(item.product));
        return sum + (product ? product.price * item.quantity : 0);
      }, 0).toFixed(2);

      const order = await createOrder({
        user: randomUser._id,
        products: orderProducts,
        totalAmount: totalAmount,
        shippingAddress: randomUser.address, // Using user's address for simplicity
        status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
      });
      orders.push(order);
      console.log(`Created order for user ${randomUser.email}`);
    }

    // --- Create Reviews ---
    const reviews = [];
    // Create reviews for some products by some users
    for (let i = 0; i < 30; i++) {
      const randomUser = faker.helpers.arrayElement(users);
      const randomProduct = faker.helpers.arrayElement(products);
      const review = await createReview({
        product: randomProduct._id,
        user: randomUser._id,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
      });
      reviews.push(review);
      console.log(`Created review for product ${randomProduct.name}`);
    }

    // --- Create Wishlists ---
    // Create wishlists for some users
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const randomProducts = faker.helpers.arrayElements(products, faker.number.int({ min: 0, max: 5 }));
      const wishlist = await createWishlist({
        user: user._id,
        products: randomProducts.map(p => p._id),
      });
      console.log(`Created wishlist for user ${user.email}`);
    }

     // --- Create Payments ---
     const payments = [];
     for (let i = 0; i < 20; i++) {
       const randomOrder = faker.helpers.arrayElement(orders);
       // Prevent creating payment if order already has one (optional)
        // In a real app, you'd check if a payment exists for the order

       const payment = await createPayment({
         order: randomOrder._id,
         user: randomOrder.user,
         amount: randomOrder.totalAmount,
         paymentMethod: faker.helpers.arrayElement(['credit_card', 'paypal', 'bank_transfer']),
         paymentStatus: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
         paidAt: faker.date.recent({ days: 30 }),
       });
       payments.push(payment);
       console.log(`Created payment for order ${randomOrder._id}`);
     }

    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Database seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase(); 