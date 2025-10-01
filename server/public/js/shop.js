// In public/js/shop.js
document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('product-grid');
  const navCartCountElement = document.getElementById('nav-cart-count');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  // --- NEW: Category Elements ---
  const categoryBar = document.querySelector('.category-bar');
  const productsHeading = document.getElementById('products-heading');

  let cart = [];
  let allProducts = [];
  let selectedCategory = 'All'; // --- NEW: To track the selected category

  const renderProducts = (productsToRender) => {
    if (productsToRender.length === 0) {
      productGrid.innerHTML = `<div class="col-12"><p class="text-center text-muted">No products found.</p></div>`;
      return;
    }
    productGrid.innerHTML = productsToRender.map(product => {
      const cartItem = cart.find(item => item.productId && item.productId._id === product._id);
      const quantity = cartItem ? cartItem.quantity : 0;
      const buttonHtml = quantity > 0 ?
        `<div class="input-group"><button class="btn btn-outline-danger minus-btn" data-quantity="${quantity}">-</button><input type="text" class="form-control text-center" value="${quantity}" readonly><button class="btn btn-outline-success plus-btn" data-quantity="${quantity}">+</button></div>` :
        `<button class="btn btn-outline-success add-btn">Add</button>`;
      return `<div class="col-md-4 col-lg-3 mb-4"><div class="card h-100" data-product-id="${product._id}"><img src="${product.imageUrl}" class="card-img-top" alt="${product.name}"><div class="card-body d-flex flex-column"><h5 class="card-title">${product.name}</h5><p class="card-text text-muted">${product.unit}</p><div class="mt-auto d-flex justify-content-between align-items-center"><p class="h5 mb-0">₹${product.price}</p><div class="add-btn-container">${buttonHtml}</div></div></div></div></div>`;
    }).join('');
  };

  const updateCardUI = (productId, newQuantity) => {
    const card = document.querySelector(`.card[data-product-id="${productId}"]`);
    if (!card) return;
    const container = card.querySelector('.add-btn-container');
    if (newQuantity > 0) {
      container.innerHTML = `<div class="input-group"><button class="btn btn-outline-danger minus-btn" data-quantity="${newQuantity}">-</button><input type="text" class="form-control text-center" value="${newQuantity}" readonly><button class="btn btn-outline-success plus-btn" data-quantity="${newQuantity}">+</button></div>`;
    } else {
      container.innerHTML = `<button class="btn btn-outline-success add-btn">Add</button>`;
    }
  };

  const updateCartWidget = () => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (navCartCountElement) {
        navCartCountElement.textContent = totalItems;
    }
  };

  const updateCartAPI = async (productId, quantity) => {
    try {
      const response = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!response.ok) throw new Error('Network response was not ok');
      cart = await response.json();
      updateCardUI(productId, quantity);
      updateCartWidget();
    } catch (error) {
      console.error('Failed to update cart:', error);
    }
  };

  productGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const productId = card.dataset.productId;
    if (e.target.classList.contains('add-btn')) { updateCartAPI(productId, 1); } 
    else if (e.target.classList.contains('plus-btn')) { let quantity = parseInt(e.target.dataset.quantity); updateCartAPI(productId, quantity + 1); } 
    else if (e.target.classList.contains('minus-btn')) { let quantity = parseInt(e.target.dataset.quantity); updateCartAPI(productId, quantity - 1); }
  });

  // --- UPDATED: Filter Functionality for both Search and Category ---
  const filterProducts = () => {
    const searchTerm = searchInput.value.toLowerCase();
    let filteredProducts = allProducts;

    // 1. Filter by category first
    if (selectedCategory !== 'All') {
      filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
    }

    // 2. Then, filter by search term
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
      );
    }
    
    renderProducts(filteredProducts);
  };

  searchBtn.addEventListener('click', filterProducts);
  searchInput.addEventListener('keyup', filterProducts);

  // --- NEW: Event Listener for Category Bar ---
  categoryBar.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent page jump
    const target = e.target;
    if (target.classList.contains('category-item')) {
      // Update the active state
      categoryBar.querySelector('.active').classList.remove('active');
      target.classList.add('active');
      
      // Store selected category and update heading
      selectedCategory = target.dataset.category;
      productsHeading.textContent = selectedCategory === 'All' ? 'All Products' : selectedCategory;
      
      // Run the filter
      filterProducts();
    }
  });


  const initializeShop = async () => {
    try {
      const [cartRes, productsRes] = await Promise.all([ fetch('/api/cart'), fetch('/api/products') ]);
      if (!cartRes.ok) throw new Error('Failed to fetch cart');
      cart = await cartRes.json();
      updateCartWidget();
      if (!productsRes.ok) throw new Error('Failed to fetch products');
      allProducts = await productsRes.json();
      renderProducts(allProducts);
    } catch (error) {
      productGrid.innerHTML = `<p class="text-danger">Failed to load products. Please try again later.</p>`;
      console.error('Initialization failed:', error);
    }
  };

  initializeShop();
});