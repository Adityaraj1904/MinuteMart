// In public/js/cart-count.js
document.addEventListener('DOMContentLoaded', async () => {
  const navCartCountElement = document.getElementById('nav-cart-count');
  if (navCartCountElement) {
    try {
      const res = await fetch('/api/cart');
      const cart = await res.json();
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      navCartCountElement.textContent = totalItems;
    } catch (err) {
      console.error('Failed to fetch cart count.');
    }
  }
});