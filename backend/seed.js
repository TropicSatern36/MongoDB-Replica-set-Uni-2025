const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config({ path: './backend/.env' });

// Import CRUD operations
const { createUser, createProduct, createCategory, createOrder, createReview, createWishlist, createPayment } = require('./crud/create');

// Import models for fetching IDs and clearing data
const User = require('./models/user');
const Product = require('./models/product');
const Category = require('./models/Category');
const Order = require('./models/order');
const Review = require('./models/review');
const Wishlist = require('./models/wishlist');
const Payment = require('./models/payment');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "e-commerce"
})
.then(() => {
  console.log('Connected to MongoDB for seeding');
  seedDatabase();
})
.catch(err => console.error('MongoDB connection error for seeding:', err));

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding process...');

    // Define number of documents to create for each schema
    const numberOfUsers = 20; // Increased count slightly
    const numberOfCategories = 10; // Increased count slightly
    const numberOfProducts = 50; // Increased count significantly
    const numberOfOrders = 30; // Increased count
    const numberOfReviews = 60; // Increased count
    const numberOfWishlists = 15; // Increased count
    const numberOfPayments = 30; // Increased count

    // Clear existing data (optional, but good for a clean restart)
    console.log('\nClearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Wishlist.deleteMany({}),
      Payment.deleteMany({}),
    ]);
    console.log('Existing data cleared.');

    // --- Seed Users ---
    console.log(`\nSeeding ${numberOfUsers} users...`);
    const createdUsers = [];
    for (let i = 0; i < numberOfUsers; i++) {
      const userData = {
        username: faker.internet.userName(), // Use username (not userName) as per faker docs/previous logs
        email: faker.internet.email(),
        password: 'password123', // Default password
        role: faker.helpers.arrayElement(['customer', 'admin']), // Based on User schema enum
        address: { // Based on User schema structure
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            postalCode: faker.location.zipCode(),
            country: faker.location.country()
        }
      };
      try {
        const newUser = await createUser(userData);
        createdUsers.push(newUser);
        process.stdout.write('.'); // Progress indicator
      } catch (error) {
        if (error.code === 11000) {
          process.stdout.write('s'); // s for skipped duplicate
        } else {
          console.error('\nError creating user:', error);
        }
      }
    }
     console.log(`\n${createdUsers.length} users seeded.`);


    // --- Seed Categories ---
    console.log(`\nSeeding ${numberOfCategories} categories...`);
    const createdCategories = [];
    // Keep track of created category names to avoid duplicates with faker's random generation
    const createdCategoryNames = new Set();

    for (let i = 0; i < numberOfCategories; i++) {
      let categoryName;
      // Generate names until a unique one is found or limit reached (simple approach)
      let attempts = 0;
      do {
         categoryName = faker.commerce.department();
         attempts++;
         if (attempts > numberOfCategories * 2) { // Prevent infinite loops
            console.warn('\nCould not generate enough unique category names.');
            break;
         }
      } while(createdCategoryNames.has(categoryName));

      if (attempts > numberOfCategories * 2) break; // Break outer loop if couldn't generate unique names

      const categoryData = {
        name: categoryName,
        description: faker.lorem.sentence(),
      };
      try {
        const newCategory = await createCategory(categoryData);
        createdCategories.push(newCategory);
        createdCategoryNames.add(categoryName);
        process.stdout.write('.'); // Progress indicator
      } catch (error) {
        // This catch is mostly for other potential errors, duplicates handled by loop
        console.error('\nError creating category:', error);
      }
    }
    console.log(`\n${createdCategories.length} categories seeded.`);

    // --- Get IDs for relationships (fetch from DB to be sure) ---
    console.log('\nFetching IDs for relationships...');
    const userIds = (await User.find({}, '_id')).map(doc => doc._id);
    const categoryIds = (await Category.find({}, '_id')).map(doc => doc._id);

    if (userIds.length === 0) {
        console.error('\nNot enough users seeded to create dependent schemas. Aborting.');
        return; // Exit if no users
    }
     if (categoryIds.length === 0) {
        console.warn('\nNo categories seeded. Products will be created without categories.');
     }


    // --- Seed Products ---
    console.log(`\nSeeding ${numberOfProducts} products...`);
    const createdProducts = [];
    for (let i = 0; i < numberOfProducts; i++) {
        const productData = {
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: faker.commerce.price({ min: 1, max: 1000, dec: 2 }),
            category: categoryIds.length > 0 ? categoryIds[Math.floor(Math.random() * categoryIds.length)] : null, // Assign a random category ID or null if no categories
            brand: faker.company.name(), // Ensure brand is added
            stock: faker.number.int({ min: 0, max: 200 }),
            // reviews are added later
        };
        try {
            const newProduct = await createProduct(productData);
            createdProducts.push(newProduct);
            process.stdout.write('.'); // Progress indicator
        } catch (error) {
             console.error('\nError creating product:', error);
        }
    }
    console.log(`\n${createdProducts.length} products seeded.`);


    // --- Get Product IDs for relationships ---
    console.log('\nFetching Product IDs for relationships...');
    const productIds = (await Product.find({}, '_id')).map(doc => doc._id);

     if (productIds.length === 0) {
        console.error('\nNot enough products seeded to create orders/reviews/wishlists. Aborting dependent seeding.');
        return; // Exit if no products
     }


    // --- Seed Orders ---
    console.log(`\nSeeding ${numberOfOrders} orders...`);
    const createdOrders = [];
    for (let i = 0; i < numberOfOrders; i++) {
        const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
        // Select a few random products for the order (between 1 and 5)
        const orderProductItems = [];
        const numProductsInOrder = faker.number.int({ min: 1, max: 5 });
         // Use a Set to ensure unique product IDs in a single order item array
        const uniqueProductIdsInOrder = new Set();
        while(uniqueProductIdsInOrder.size < numProductsInOrder && uniqueProductIdsInOrder.size < productIds.length) {
             uniqueProductIdsInOrder.add(productIds[Math.floor(Math.random() * productIds.length)]);
        }

        if (uniqueProductIdsInOrder.size === 0) continue; // Skip if no products were added to the order

        // For each unique product ID, create an order item with quantity and price
        let totalAmount = 0;
        for (const productId of uniqueProductIdsInOrder) {
             // Find the product to get its price (or generate a price, but using product price is more realistic)
             // This requires fetching products again or passing them down. For simplicity, let's generate a price here.
             const itemPrice = faker.commerce.price({ min: 5, max: 500, dec: 2 });
             const quantity = faker.number.int({min: 1, max: 5});
             orderProductItems.push({ 
                 product: productId,
                 quantity: quantity,
                 price: parseFloat(itemPrice),
             });
             totalAmount += parseFloat(itemPrice) * quantity;
        }

        const orderData = {
            user: randomUserId,
            products: orderProductItems,
            totalAmount: parseFloat(totalAmount.toFixed(2)), // Ensure total amount is a number with 2 decimal places
            // shippingAddress is part of the User schema, so no need to add here unless overriding.
            paymentStatus: faker.helpers.arrayElement(['pending', 'paid', 'failed']), // Based on Order schema enum
            deliveryStatus: faker.helpers.arrayElement(['processing', 'shipped', 'delivered']), // Based on Order schema enum
            orderedAt: faker.date.past(),
        };
        try {
            const newOrder = await createOrder(orderData);
            createdOrders.push(newOrder);
            process.stdout.write('.'); // Progress indicator
        } catch (error) {
            console.error('\nError creating order:', error);
        }
    }
    console.log(`\n${createdOrders.length} orders seeded.`);


    // --- Get Order IDs for relationships ---
    console.log('\nFetching Order IDs for relationships...');
    const orderIds = (await Order.find({}, '_id')).map(doc => doc._id);

    if (orderIds.length === 0) {
        console.warn('\nNo orders seeded. Payments will be created without orders.');
        // Although reviews can be independent of orders, payments need orders.
    }

    // --- Seed Reviews ---
    console.log(`\nSeeding ${numberOfReviews} reviews...`);
    for (let i = 0; i < numberOfReviews; i++) {
        if (userIds.length === 0 || productIds.length === 0) break; // Reviews need users and products

        const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
        const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];
        // Assuming 'order' is not a required field in Review schema based on attached file, so not adding it here.

        const reviewData = {
            user: randomUserId,
            product: randomProductId,
            rating: faker.number.int({ min: 1, max: 5 }), // Based on Review schema min/max
            comment: faker.lorem.paragraph(),
        };
        try {
            await createReview(reviewData);
            process.stdout.write('.'); // Progress indicator
        } catch (error) {
            console.error('\nError creating review:', error);
        }
    }
    console.log(`\n${numberOfReviews} reviews seeded.`); // Note: This counts attempts, not necessarily successful creations if relationships fail


    // --- Seed Wishlists ---
    console.log(`\nSeeding ${numberOfWishlists} wishlists...`);
     for (let i = 0; i < numberOfWishlists; i++) {
        if (userIds.length === 0 || productIds.length === 0) break; // Wishlists need users and products

        const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
        // Select a few random products for the wishlist (between 1 and 5)
        const wishlistProductIds = [];
        const numProductsInWishlist = faker.number.int({ min: 1, max: 5 });
         // Use a Set to ensure unique product IDs in a single wishlist
        const uniqueProductIds = new Set();
        while(uniqueProductIds.size < numProductsInWishlist && uniqueProductIds.size < productIds.length) {
             uniqueProductIds.add(productIds[Math.floor(Math.random() * productIds.length)]);
        }

        if (uniqueProductIds.size === 0) continue; // Skip if no products were added to the wishlist

        const wishlistData = {
            user: randomUserId,
            products: Array.from(uniqueProductIds),
        };
        try {
            await createWishlist(wishlistData);
            process.stdout.write('.'); // Progress indicator
        } catch (error) {
             // Handle potential duplicate wishlist for a user if you have a unique index on user in Wishlist schema
            console.error('\nError creating wishlist:', error);
        }
    }
     console.log(`\n${numberOfWishlists} wishlists seeded.`); // Note: This counts attempts, not necessarily successful creations


    // --- Seed Payments ---
    console.log(`\nSeeding ${numberOfPayments} payments...`);
     for (let i = 0; i < numberOfPayments; i++) {
        if (userIds.length === 0 || orderIds.length === 0) break; // Payments need users and orders

        const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
        const randomOrderId = orderIds[Math.floor(Math.random() * orderIds.length)];

        // Find the corresponding order to get the total amount for the payment
        // This requires the orders array to be complete before seeding payments.
        // We will fetch the order from the database to be certain.
        const order = await Order.findById(randomOrderId);

         if (!order) {
            console.warn(`\nSkipping payment for order ${randomOrderId} as order not found in DB.`);
            continue;
         }

        const paymentData = {
            user: randomUserId,
            order: randomOrderId,
            amount: order.totalAmount, // Use the actual order total amount
            paymentMethod: faker.helpers.arrayElement(['card', 'paypal', 'bank', 'crypto']), // Based on Payment schema enum
            paymentStatus: faker.helpers.arrayElement(['pending', 'completed', 'failed']), // Based on Payment schema enum
            transactionId: faker.string.uuid(), // Generate a unique transaction ID
            paidAt: faker.date.past(), // Add paidAt date
        };
        try {
            await createPayment(paymentData);
            process.stdout.write('.'); // Progress indicator
        } catch (error) {
            if (error.code === 11000) {
                 process.stdout.write('t'); // t for skipped duplicate transactionId
            } else {
                console.error('\nError creating payment:', error);
            }
        }
    }
    console.log(`\n${numberOfPayments} payments seeded.`); // Note: This counts attempts, not necessarily successful creations


    console.log('\nDatabase seeding process finished.');
  } catch (error) {
    console.error('\nError during database seeding:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}; 