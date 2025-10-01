// In server/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 }
    }
  ],

  // --- ADD THIS NEW SECTION ---
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    phone: { type: String }
  }
});

module.exports = mongoose.model("User", userSchema);