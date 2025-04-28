// script.js — Elegance Perfume

/* ========== MOBILE NAVIGATION ========== */
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 600) navLinks.classList.remove('open');
  });
}

/* ========== SMOOTH SCROLL (for anchor links) ========== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href.length > 1 && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
      if (navLinks) navLinks.classList.remove('open');
    }
  });
});

/* ========== CART LOGIC ========== */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch (e) {
    console.error("Error accessing localStorage:", e);
    return [];
  }
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function addToCart(productId) {
  let cart = getCart();
  const products = JSON.parse(localStorage.getItem('products')) || [];
  const prod = products.find(p => p.id === productId);
  if (!prod) {
    alert("Product not found!");
    return;
  }
  let found = cart.find(item => item.id === prod.id);
  if (found) {
    found.qty += 1;
  } else {
    cart.push({ ...prod, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  alert("Added to cart!");
}
function updateCartQty(productId, change) {
  const cart = getCart();
  const product = cart.find(item => item.id === productId);

  if (product) {
    product.qty += change;
    if (product.qty <= 0) {
      removeFromCart(productId); // Remove product if quantity is 0
    } else {
      saveCart(cart);
      renderCart(); // Re-render the cart
    }
  }
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId); // Remove product by ID
  saveCart(cart);
  renderCart(); // Re-render the cart
}
function clearCart() {
  // Remove the cart data from localStorage
  localStorage.removeItem('cart');

  // Re-render the cart to reflect the cleared state
  renderCart();

  // Optionally, show a confirmation message
  alert("Cart has been cleared!");
}
function updateCartCount() {
  const count = getCart().reduce((sum, it) => sum + it.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count > 0 ? count : '');
}
function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const cartTable = document.querySelector('.cart-table tbody');
  const cartEmpty = document.querySelector('.cart-empty');
  const cartSummary = document.querySelector('.cart-summary');

  cartTable.innerHTML = ''; // Clear existing cart items
  let total = 0;

  if (cart.length === 0) {
    cartEmpty.style.display = 'block'; // Show "cart is empty" message
    cartSummary.textContent = ''; // Clear the total price
    return;
  }

  cartEmpty.style.display = 'none'; // Hide "cart is empty" message

  cart.forEach(item => {
    const subtotal = item.price * item.qty; // Calculate subtotal for each item
    total += subtotal; // Add to total price

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${item.img}" alt="${item.name}" class="cart-product-img"></td>
      <td>${item.name}</td>
      <td>ETB ${item.price.toLocaleString()}</td>
      <td>
        <button class="qty-decrease" data-id="${item.id}">-</button>
        <span>${item.qty}</span>
        <button class="qty-increase" data-id="${item.id}">+</button>
      </td>
      <td>ETB ${subtotal.toLocaleString()}</td>
      <td><button class="cart-remove-btn" data-id="${item.id}">Remove</button></td>
    `;
    cartTable.appendChild(row);
  });

  // Update the total price in the cart summary
  cartSummary.textContent = `Total: ETB ${total.toLocaleString()}`;
}
function attachCartEventListeners() {
  const cartTable = document.querySelector('.cart-table tbody');

  // Increase quantity
  cartTable.querySelectorAll('.qty-increase').forEach(button => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.id);
      updateCartQty(productId, 1);
    });
  });

  // Decrease quantity
  cartTable.querySelectorAll('.qty-decrease').forEach(button => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.id);
      updateCartQty(productId, -1);
    });
  });

  // Remove product
  cartTable.querySelectorAll('.cart-remove-btn').forEach(button => {
    button.addEventListener('click', () => {
      const productId = Number(button.dataset.id);
      removeFromCart(productId);
    });
  });
}

/* ========== PRODUCTS PAGE LOGIC ========== */
function renderProducts() {
  const productSections = document.querySelectorAll('.products-section');
  if (!productSections) return;

  const products = JSON.parse(localStorage.getItem('products')) || [];

  productSections.forEach(section => {
    const category = section.id.replace('-perfumes', '');
    const filteredProducts = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    const grid = section.querySelector('.products-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (filteredProducts.length === 0) {
      grid.innerHTML = `<p class="no-products">No products available in this category.</p>`;
      return;
    }

    filteredProducts.forEach(product => {
      const card = document.createElement('div');
      card.classList.add('product-card');
      card.innerHTML = `
        <img src="${product.img}" alt="${product.name}" class="product-img">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">ETB ${product.price.toLocaleString()}</p>
        <button class="product-add-btn" data-id="${product.id}">Add to Cart</button>
      `;
      grid.appendChild(card);
    });

    section.querySelectorAll('.product-add-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = Number(this.dataset.id);
        addToCart(productId);
      });
    });
  });
}

/* ========== INITIALIZE (ON PAGE LOAD) ========== */
document.addEventListener('DOMContentLoaded', function () {
  updateCartCount();

  if (document.querySelector('.cart-table')) renderCart();
  if (document.querySelector('.products-grid')) renderProducts();
});