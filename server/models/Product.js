const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'] 
  },
  unit: { 
    type: String, 
    required: [true, 'Product unit (e.g., 500g, 1L) is required'] 
  },
  price: { 
    type: Number, 
    required: [true, 'Product price is required'] 
  },
  imageUrl: { 
    type: String, 
    required: [true, 'Product image URL is required'] 
  },
  category: { 
    type: String, 
    required: [true, 'Product category is required'],
    enum: ['Fruits & Vegetables', 'Dairy & Bread', 'Snacks', 'Beverages'] // Example categories
  }
});

module.exports = mongoose.model('Product', productSchema);