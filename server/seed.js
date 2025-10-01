// In server/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// This array has new, working image links
// In server/seed.js
const sampleProducts = [
  // Fruits & Vegetables
  { name: 'Fresh Banana', unit: '6 pieces', price: 40, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759265136/Banana-Quad_wjken1.jpg', category: 'Fruits & Vegetables' },
  { name: 'Fresh Apples', unit: '1kg', price: 120, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268510/red-apples_l11d7h.jpg', category: 'Fruits & Vegetables', offer: '15% OFF' },
  { name: 'Carrots', unit: '500g', price: 30, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268493/static.onecms.io__wp-content__uploads__sites__37__2020__04__30__carrots-106dce5c-74aa64b81c184bffb80b7381b72615a1_gm6yu8.jpg', category: 'Fruits & Vegetables' },
  { name: 'Spinach', unit: '1 bunch', price: 20, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268433/Spinach_accrza.jpg', category: 'Fruits & Vegetables' },
  { name: 'Onions', unit: '1kg', price: 45, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268537/90_hgbtnr.jpg', category: 'Fruits & Vegetables' },
  { name: 'Tomatoes', unit: '1kg', price: 50, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268552/AN313-Tomatoes-732x549-Thumb_yxp26a.jpg', category: 'Fruits & Vegetables' },

  // Dairy & Bread
  { name: 'Amul Taaza Milk', unit: '500ml pouch', price: 27, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268615/40090894_7-amul-taaza_ay2afq.png', category: 'Dairy & Bread' },
  { name: 'Whole Wheat Bread', unit: '400g pack', price: 50, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268600/Hearty-Whole-Grain_2048-x-2048_jprpqq.png', category: 'Dairy & Bread' },
  { name: 'Nestle Curd', unit: '400g cup', price: 45, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268660/71mR4PEHbZL_lpkzty.jpg', category: 'Dairy & Bread' },
  { name: 'Amul Butter', unit: '100g', price: 55, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268674/Amul_butter_aienzq.jpg', category: 'Dairy & Bread', offer: 'BUY 1 GET 1' },
  { name: 'Britannia Cheese Slices', unit: '100g pack', price: 80, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268694/lGgYSrIusr0zi7GoyxlHxRuvDDueC33LG5bxFAaQ_lfx8cm.jpg', category: 'Dairy & Bread' },

  // Snacks
  { name: 'Lay\'s Classic Chips', unit: '52g pack', price: 20, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268711/Lay-s-Classic-Potato-Chips-8-oz-Bag_f1852517-59f2-467f-b176-3ea1f2b098ae.a06a239111071c1595ab75cf3bf2323f_m7czya.jpg', category: 'Snacks' },
  { name: 'Oreo Biscuits', unit: '120g pack', price: 30, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268729/image_sqptgl.png', category: 'Snacks' },
  { name: 'Good Day Biscuits', unit: '75g pack', price: 10, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268742/ac9ffd6c-bb59-48f8-9e5d-9d6125fd5357.__CR0_0_300_300_PT0_SX300_V1____r5h4kf.jpg', category: 'Snacks' },
  { name: 'Bingo Mad Angles', unit: '72g pack', price: 20, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268759/bingo-mad-angles-achaari-masti-indian-flavour-tangy-shop-429401_xrwoyz.jpg', category: 'Snacks' },
  { name: 'Haldiram\'s Bhujia', unit: '200g pack', price: 50, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268772/bhujiya_sev_1_hzk61c.jpg', category: 'Snacks', offer: '20% OFF' },

  // Beverages
  { name: 'Coca-Cola Can', unit: '300ml can', price: 40, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268796/208206_niify9.jpg', category: 'Beverages' },
  { name: 'Tropicana Orange Juice', unit: '1 Litre', price: 125, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268821/e11d4f95-ab08-45cd-b36c-c68951427eea.85ed1706b52598fa3281803fc6622f66_bfrsnv.jpg', category: 'Beverages' },
  { name: 'Tata Tea Gold', unit: '250g pack', price: 150, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268834/61m1sZRyMqL._UF894_1000_QL80__eptmlx.jpg', category: 'Beverages' },
  { name: 'Bru Instant Coffee', unit: '50g jar', price: 95, imageUrl: 'https://res.cloudinary.com/dhurg99i3/image/upload/v1759268852/61cRNxujFLL._UF894_1000_QL80__ola311.jpg', category: 'Beverages' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    await Product.deleteMany({});
    console.log('🧹 Cleared existing products');

    await Product.insertMany(sampleProducts);
    console.log('🌱 Database seeded with sample products!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();