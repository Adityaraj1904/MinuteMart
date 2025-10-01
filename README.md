# 🛒 MinuteMart – Fast, Simple & Reliable Grocery Shopping  

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) 
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) 
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) 
![EJS](https://img.shields.io/badge/EJS-FFCA28?style=for-the-badge&logo=javascript&logoColor=black) 
![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)  

MinuteMart is a **quick-commerce web platform** that reimagines online grocery shopping.  
It combines **speed, convenience, and security** in a full-stack web application where customers can explore products, manage carts, and place orders with just a few clicks.  

---

## 🌍 Live Preview  

🔗 **Try it here:** [minutemart](https://minutemart.onrender.com)  

---

## 📸 Screenshots  

Here’s a walkthrough of the main pages of **MinuteMart**:

### 🏪 Shop Page  
Users can explore available grocery items and add them to their cart.  
<img src="https://github.com/user-attachments/assets/66317ba0-9c87-4e1e-b7df-e9e4a440c902" width="800" />  

---

### 🛒 Cart Page  
A dynamic cart where users can update quantities and see live price changes.  
<img src="https://github.com/user-attachments/assets/f9e15da1-81c6-4883-819f-c223290a963b" width="800" />  

---

### 💳 Secure Checkout (Stripe)  
Seamless payment processing with **Stripe Checkout**.  
<img src="https://github.com/user-attachments/assets/58e6d4ca-25f0-4735-924c-013ac779bec5" width="800" />  

---

### ✅ Order Success  
Once payment is completed, users see an order confirmation.  
<img width="1897" height="825" alt="Screenshot 2025-10-02 014805" src="https://github.com/user-attachments/assets/276ee832-0b56-41ff-804b-0e3adfe32560" />
  

---

### 👤 Profile Page  
Users can manage personal information and saved addresses.  
<img src="https://github.com/user-attachments/assets/566976f0-30b9-42eb-9941-d886bd4e33c6" width="800" />  

---

### 📦 Orders Page  
Complete history of past purchases for easy tracking.  
<img src="https://github.com/user-attachments/assets/bec8f6c3-e0a6-46fb-a4ab-841676ab8cd1" width="800" />  

---

## ✨ Key Features   

- 🔐 **Secure Authentication** – User registration, login, and session handling  
- ✉️ **Password Recovery** – Reset forgotten passwords via Gmail  
- 🛍 **Dynamic Product Catalog** – Real-time product listing powered by MongoDB  
- 🗂 **Category Filters** – Organize and explore products by category  
- 🛒 **Interactive Cart** – Add, update, and remove items with live price calculations  
- 💳 **Payment Options** – Encrypted and secure **Stripe Checkout**  
- 📦 **Order History** – View and track past purchases  
- 📱 **Responsive Design** – Optimized for all screen sizes  

---

## 🛠️ Tech Overview  

- **Backend** → Node.js, Express.js  
- **Frontend** → EJS templates, Bootstrap, HTML, CSS   
- **Database** → MongoDB Atlas (via Mongoose)  
- **Authentication** → Express-session, connect-mongo
- **Payments** → Stripe Checkout  
- **Email Service** → Nodemailer (SMTP with Gmail)  
- **Deployment** → Render  

---

## 🚀 Getting Started (Local Setup)  

### 📌 Prerequisites  
- [Node.js](https://nodejs.org/) and npm installed  
- A MongoDB Atlas cluster  
- Stripe account (for API keys)  
- Gmail account with App Password (for sending emails)  

---

### ⚙️ Setup Steps  

1. **Clone the repository**  
   ```bash
   git clone https://github.com/Adityaraj1904/MinuteMart.git
   cd minutmart/server

2. **Install dependencies**
   ```bash
   npm install

3. **Create a .env file inside root folder/ and add:**
    ```bash
    # Server  
    PORT=3000  
    NODE_ENV=development

    # Database  
    MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/yourDBname

    # Session  
    SESSION_SECRET=some_secure_random_string

    # Frontend URL  
    FRONTEND_URL=http://localhost:3000

    # Email / Nodemailer  
    EMAIL_HOST=smtp.gmail.com  
    EMAIL_USER=your-email@gmail.com  
    EMAIL_PASS=your-app-password  
    EMAIL_FROM="MinuteMart <your-email@gmail.com>"

    # Stripe  
    STRIPE_PUBLIC_KEY=pk_test_...  
    STRIPE_SECRET_KEY=sk_test_...


4. **Run in development mode Or in normal mode:**
    ```bash
    npm run dev → Runs the server with nodemon (auto restart on save)
    npm start → Runs the server normally

---

## 📂 Folder Structure

<img width="582" height="571" alt="image" src="https://github.com/user-attachments/assets/7232a6d7-3056-44c7-8acd-811e6e21c381" />

---

## ⚠️ Known Issues
- Free Render deployment may take 30–60 seconds to wake from sleep (cold start).
- Stripe keys are in test mode only – real payments not supported.
   ### How to test payments
   When you reach the Stripe Checkout page, use the following test card details:
    - **Card number:** `4242 4242 4242 4242`
    - **Expiry:** any future date (e.g., `12/34`)
    - **CVC:** any 3 digits (e.g., `123`)
      
---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
Feel free to fork this repo and submit a pull request.

---
