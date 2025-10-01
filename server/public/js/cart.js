// In public/js/cart.js
document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total');
  const navCartCountElement = document.getElementById('nav-cart-count');
  const deliveryFee = 15.00;

  // This function draws the cart items on the page
  const renderCart = (cart) => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (navCartCountElement) {
        navCartCountElement.textContent = totalItems;
    }

    if (!cart || cart.length === 0) {
      cartItemsContainer.innerHTML = '<div class="card"><div class="card-body text-center"><p>Your cart is empty.</p></div></div>';
      subtotalEl.textContent = '₹0.00';
      totalEl.textContent = `₹${deliveryFee.toFixed(2)}`;
      // Since the button is now a link, we don't need to disable it, but you could hide it if you want
      return;
    }

    let subtotal = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
      if (!item.productId) return '';
      const itemTotal = item.productId.price * item.quantity;
      subtotal += itemTotal;
      return `
        <div class="card mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-1">${item.productId.name}</h5>
                <p class="mb-0 text-muted" style="font-size: 0.9em;">Quantity: ${item.quantity}</p>
              </div>
              <p class="h5 mb-0">₹${itemTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    totalEl.textContent = `₹${(subtotal + deliveryFee).toFixed(2)}`;
  };

  // This function gets the latest cart data from the server
  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (!res.ok) throw new Error('Server responded with an error');
      const cart = await res.json();
      renderCart(cart);
    } catch (err) {
      cartItemsContainer.innerHTML = '<p class="text-danger">Failed to load cart.</p>';
      console.error(err);
    }
  };
  
  // Load the cart data when the page first opens
  fetchCart();
});