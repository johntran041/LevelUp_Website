
document.addEventListener('DOMContentLoaded', () => {
  // delegate clicks from the body
  document.body.addEventListener('click', async e => {
    const btn = e.target.closest('.cart-btn[data-id]');
    if (!btn) return;

    const courseId = btn.dataset.id;
    try {
      // hit your add‐to‐cart endpoint
      const res = await fetch(`/cart/add/${courseId}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { success, cartCount } = await res.json();
      if (!success) throw new Error('Server error');

      // update *all* red badges on the page
      document.querySelectorAll('.badge.bg-danger').forEach(b => {
        b.textContent = cartCount;
      });

      // if there wasn't one on the cart icon, create it
      const cartLink = document.querySelector('a[href="/cart"]');
      if (cartLink && !cartLink.querySelector('.badge.bg-danger')) {
        const badge = document.createElement('span');
        badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
        badge.textContent = cartCount;
        cartLink.appendChild(badge);
      }

    } catch (err) {
      console.error('Add to cart failed:', err);
      // you can show a toast here if you like
    }
  });
});
