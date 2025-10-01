// server/server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// --- Import Models ---
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');


// --- Initialize Express App ---
const app = express();
app.enable('trust proxy'); // USE THIS INSTEAD OF app.set()
const PORT = process.env.PORT || 3000;


// --- App Configuration and Middlewares ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Explicitly set views directory

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "https://js.stripe.com", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
      "style-src": ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "'unsafe-inline'"],
      "font-src": ["'self'", "https://cdn.jsdelivr.net", "https://fonts.gstatic.com"],
      "connect-src": ["'self'", "https://cdn.jsdelivr.net", "https://api.stripe.com"],
      "img-src": ["'self'", "https://i.imgur.com", "https://res.cloudinary.com", "data:"],
      "frame-src": ["'self'", "https://js.stripe.com", "https://checkout.stripe.com"],
    },
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));


// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


// --- Session Configuration ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, collectionName: 'sessions' }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: (process.env.NODE_ENV === 'production')
  }
}));


// --- Helper Functions (Mailer & Auth) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.EMAIL_HOST,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
async function sendEmail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to, subject, text, html
  });
}
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.redirect('/login.html?error=Please+log+in+to+view+that+page');
}


// --- Page Rendering Routes ---
app.get('/', (req, res) => res.redirect('/login.html'));

app.get('/shop', isAuthenticated, async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.render('shop', { categories: categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.render('shop', { categories: [] });
  }
});

app.get('/cart', isAuthenticated, (req, res) => {
  res.render('cart', { stripePublicKey: process.env.STRIPE_PUBLIC_KEY });
});

app.get('/profile', isAuthenticated, async (req, res) => {
    try {
      const user = await User.findById(req.session.userId);
      res.render('profile', { user: user });
    } catch (err) {
      res.redirect('/shop?error=Could+not+load+profile');
    }
});

// THIS IS THE CORRECTED SECTION
app.get('/orders', isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.session.userId })
            .sort({ createdAt: -1 })
            .populate('products.productId'); // Fetches the full product details

        res.render('orders', { orders: orders });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.redirect('/profile?error=Could+not+load+orders');
    }
});

app.get('/order-success', isAuthenticated, async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        if (session.payment_status === 'paid') {
            const user = await User.findById(req.session.userId).populate('cart.productId');
            const productsInOrder = user.cart.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price
            }));
            const newOrder = new Order({
                userId: user._id,
                products: productsInOrder,
                totalAmount: session.amount_total / 100,
                paymentMethod: 'Card', // Set payment method
                paymentStatus: 'Paid',   // Set payment status
                status: 'Pending'        // Set initial order status
            });
            await newOrder.save();
            user.cart = [];
            await user.save();
            res.render('success');
        } else {
            res.redirect('/cart?error=Payment+not+successful');
        }
    } catch (err) {
        console.error("Order success error:", err);
        res.redirect('/cart?error=Something+went+wrong');
    }
});

// --- Checkout Routes ---
app.get('/checkout/address', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        res.render('address', { user: user });
    } catch (err) {
        res.redirect('/cart?error=Could+not+load+address+page');
    }
});

app.post('/checkout/address', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        user.address = {
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            phone: req.body.phone,
        };
        await user.save();
        const populatedUser = await user.populate('cart.productId');
        
        const subtotal = populatedUser.cart.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);
        const minimumOrderValue = 50; // Minimum order value in Rupees
        if (subtotal < minimumOrderValue) {
            return res.redirect(`/cart?error=Minimum+order+value+is+₹${minimumOrderValue}`);
        }

        const line_items = populatedUser.cart.map(item => ({
            price_data: { currency: 'inr', product_data: { name: item.productId.name }, unit_amount: item.productId.price * 100 },
            quantity: item.quantity,
        }));
        line_items.push({
            price_data: { currency: 'inr', product_data: { name: 'Delivery Fee' }, unit_amount: 15 * 100 },
            quantity: 1,
        });
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`,
        });
        res.render('checkout-redirect', { sessionId: session.id, stripePublicKey: process.env.STRIPE_PUBLIC_KEY });
    } catch (err) {
        console.error("Checkout address error:", err);
        res.redirect('/cart?error=Could+not+process+address');
    }
});


// --- Authentication API Routes ---
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) { return res.redirect('/register.html?error=Email+and+password+are+required'); }
    const existing = await User.findOne({ email });
    if (existing) { return res.redirect('/register.html?error=User+already+exists'); }
    const hashed = await bcrypt.hash(password, 12);
    await User.create({ name, email, password: hashed });
    return res.redirect('/login.html?success=Registration+successful!+Please+log+in.');
  } catch (err) {
    console.error(err);
    return res.redirect('/register.html?error=Server+error');
  }
});
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { return res.redirect('/login.html?error=Please+provide+email+and+password');}
    const user = await User.findOne({ email });
    if (!user) { return res.redirect('/login.html?error=User+not+found.+Please+register.');}
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) { return res.redirect('/login.html?error=Incorrect+password'); }
    req.session.userId = user._id;
    req.session.userName = user.name || user.email;
    return res.redirect('/shop');
  } catch (err) {
    console.error(err);
    return res.redirect('/login.html?error=Server+error');
  }
});
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    res.clearCookie('connect.sid');
    return res.redirect('/login.html');
  });
});
app.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) { return res.redirect('/forgot.html?error=Please+provide+an+email');}
    const successMessage = 'If+an+account+with+that+email+exists,+a+reset+link+has+been+sent.';
    const user = await User.findOne({ email });
    if (!user) { return res.redirect(`/forgot.html?success=${successMessage}`);}
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetToken = hashed;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:' + PORT}/reset.html?token=${resetToken}&id=${user._id}`;
    const message = `Reset your password by clicking this link: ${resetURL}`;
    await sendEmail({ to: user.email, subject: 'Password Reset Request', text: message });
    return res.redirect(`/forgot.html?success=${successMessage}`);
  } catch (err) {
    console.error(err);
    return res.redirect('/forgot.html?error=Server+error');
  }
});

app.post('/reset', async (req, res) => {
  try {
    const { token, id, password } = req.body;
    if (!token || !id || !password) {
      return res.redirect(`/reset.html?token=${token}&id=${id}&error=Missing+required+information`);
    }
    
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({ 
      _id: id, 
      passwordResetToken: hashed, 
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.redirect(`/reset.html?token=${token}&id=${id}&error=Token+is+invalid+or+has+expired`);
    }
    
    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    req.session.userId = user._id;
    req.session.userName = user.name || user.email;
    
    return res.redirect('/shop?success=Password+reset+successful');

  } catch (err) {
    console.error("Error in /reset route:", err);
    return res.redirect('/login.html?error=Server+error+during+password+reset');
  }
});

// --- Shopping API Routes ---
app.get('/api/products', isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
app.get('/api/cart', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('cart.productId');
    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
app.post('/api/cart/update', isAuthenticated, async (req, res) => {
  const { productId, quantity } = req.body;
  const newQuantity = Number(quantity);
  try {
    const user = await User.findById(req.session.userId);
    const cartItemIndex = user.cart.findIndex(item => item.productId.toString() === productId);
    if (newQuantity > 0) {
      if (cartItemIndex > -1) { user.cart[cartItemIndex].quantity = newQuantity; } 
      else { user.cart.push({ productId, quantity: newQuantity }); }
    } else {
      if (cartItemIndex > -1) { user.cart.splice(cartItemIndex, 1); }
    }
    await user.save();
    const updatedUser = await User.findById(req.session.userId).populate('cart.productId');
    res.json(updatedUser.cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating cart' });
  }
});


// --- START THE SERVER ---
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));