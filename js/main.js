// Main JavaScript for Rezar Aluminium Website

// Cart Management
class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cart')) || [];
    this.updateBadge();
  }

  addItem(product, quantity = 1) {
    const existing = this.items.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += quantity;
      if (existing.quantity > product.stock) {
        existing.quantity = product.stock;
      }
    } else {
      this.items.push({ ...product, quantity });
    }
    this.save();
    this.updateBadge();
    showToast(`${product.name} added to cart`);
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.save();
    this.updateBadge();
  }

  updateQuantity(id, quantity) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(0, Math.min(quantity, item.stock));
      if (item.quantity === 0) {
        this.removeItem(id);
      } else {
        this.save();
      }
    }
  }

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.save();
    this.updateBadge();
  }

  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  updateBadge() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
      const count = this.getItemCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }
}

const cart = new Cart();

// Product Management
let products = [];

async function loadProducts() {
  try {
    const response = await fetch('https://rezaraluminium-production.up.railway.app/api/products');
    products = await response.json();
  } catch (error) {
    console.error('Error loading products:', error);
    // Fallback to local data if API fails
    try {
      const fallbackResponse = await fetch('/data/products.json');
      products = await fallbackResponse.json();
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
  }
}

// DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();

  // Initialize components based on page
  const path = window.location.pathname;

  if (path === '/' || path.endsWith('index.html')) {
    initHomePage();
  } else if (path.endsWith('products.html')) {
    initProductsPage();
  } else if (path.endsWith('product.html')) {
    initProductPage();
  } else if (path.endsWith('cart.html')) {
    initCartPage();
  } else if (path.endsWith('checkout.html')) {
    initCheckoutPage();
  } else if (path.endsWith('contact.html')) {
    initContactPage();
  }

  // Common components
  initHeader();
  initWhatsAppButton();
  initModal();
});

// Header
function initHeader() {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }
}

// WhatsApp Button
function initWhatsAppButton() {
  const whatsappBtn = document.querySelector('.whatsapp-btn');
  if (!whatsappBtn) return;

  let isDragging = false;
  let startX, startY, initialX, initialY;

  whatsappBtn.addEventListener('mousedown', startDrag);
  whatsappBtn.addEventListener('touchstart', startDrag, { passive: false });

  function startDrag(e) {
    isDragging = true;
    const event = e.type === 'mousedown' ? e : e.touches[0];
    startX = event.clientX;
    startY = event.clientY;
    initialX = whatsappBtn.offsetLeft;
    initialY = whatsappBtn.offsetTop;

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
  }

  function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const event = e.type === 'mousemove' ? e : e.touches[0];
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    whatsappBtn.style.left = `${initialX + dx}px`;
    whatsappBtn.style.top = `${initialY + dy}px`;
  }

  function endDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchend', endDrag);
  }

  whatsappBtn.addEventListener('click', (e) => {
    if (isDragging) {
      e.preventDefault();
      return;
    }
    window.open('https://wa.me/message/B42ODIFA73VQA1', '_blank');
  });
}

// Modal
function initModal() {
  const modal = document.querySelector('.modal');
  const modalClose = document.querySelector('.modal__close');

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  }
}

function openModal(content) {
  const modal = document.querySelector('.modal');
  const modalContent = modal.querySelector('.modal__content');
  modalContent.innerHTML = content + '<button class="modal__close" aria-label="Close modal">&times;</button>';
  modal.classList.add('open');

  // Re-init close button
  const closeBtn = modalContent.querySelector('.modal__close');
  closeBtn.addEventListener('click', () => modal.classList.remove('open'));
}

// Toast
function showToast(message) {
  const toast = document.querySelector('.toast') || createToast();
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function createToast() {
  const toast = document.createElement('div');
  toast.className = 'toast';
  document.body.appendChild(toast);
  return toast;
}

// Home Page
function initHomePage() {
  renderFeaturedProducts();
  renderServices();
}

async function renderFeaturedProducts() {
  const container = document.querySelector('.featured-products .grid');
  if (!container) return;

  try {
    const response = await fetch('https://rezaraluminium-production.up.railway.app/api/products/featured');
    const featured = await response.json();
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
  } catch (error) {
    console.error('Error loading featured products:', error);
    // Fallback to first 4 products
    const featured = products.slice(0, 4);
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
  }
}

function renderServices() {
  const container = document.querySelector('.services .grid');
  if (!container) return;

  const services = [
    { title: 'Swing Doors', description: 'High-quality aluminium swing doors' },
    { title: 'Frameless Doors', description: 'Modern frameless door solutions' },
    { title: 'Sliding Windows & Doors', description: 'Energy-efficient sliding systems' },
    { title: 'Curtain Wall & Aloco Board', description: 'Commercial cladding solutions' },
    { title: 'Inch Doors', description: 'Compact access doors' }
  ];

  container.innerHTML = services.map(service => `
    <div class="card service-card">
      <div class="card__content">
        <h3 class="card__title">${service.title}</h3>
        <p class="card__description">${service.description}</p>
      </div>
    </div>
  `).join('');
}

// Products Page
function initProductsPage() {
  renderProducts(products);
  initFilters();
}

function renderProducts(productList) {
  const container = document.querySelector('.products-grid');
  if (!container) return;

  container.innerHTML = productList.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
  return `
    <div class="card product-card" data-id="${product.id}">
      <img src="${product.images[0]}" alt="${product.name}" class="card__image">
      <div class="card__content">
        <h3 class="card__title">${product.name}</h3>
        <p class="card__description">${product.description}</p>
        <p class="card__price">${product.currency} ${product.price.toFixed(2)}</p>
        <div class="card__actions">
          <button class="btn btn--secondary add-to-cart" data-id="${product.id}">Add to Cart</button>
          <a href="product.html?id=${product.id}" class="btn btn--primary">View More</a>
        </div>
      </div>
    </div>
  `;
}

function initFilters() {
  const categoryFilter = document.querySelector('#category-filter');
  const sortFilter = document.querySelector('#sort-filter');

  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterProducts);
  }

  if (sortFilter) {
    sortFilter.addEventListener('change', sortProducts);
  }
}

function filterProducts() {
  const category = document.querySelector('#category-filter').value;
  let filtered = category ? products.filter(p => p.category === category) : products;
  renderProducts(filtered);
}

function sortProducts() {
  const sort = document.querySelector('#sort-filter').value;
  let sorted = [...products];

  switch (sort) {
    case 'price-low':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
    default:
      // Assume products are already in order
      break;
  }

  renderProducts(sorted);
}

// Product Page
function initProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const product = products.find(p => p.id === productId);

  if (product) {
    renderProductDetail(product);
  }
}

function renderProductDetail(product) {
  const container = document.querySelector('.product-detail');
  if (!container) return;

  container.innerHTML = `
    <div class="product-gallery">
      <img src="${product.images[0]}" alt="${product.name}" id="main-image">
      <div class="gallery-thumbs">
        ${product.images.map((img, index) => `<img src="${img}" alt="${product.name} ${index + 1}" class="thumb" data-index="${index}">`).join('')}
      </div>
    </div>
    <div class="product-info">
      <h1>${product.name}</h1>
      <p class="product-description">${product.description}</p>
      <p class="product-price">${product.currency} ${product.price.toFixed(2)}</p>
      <div class="quantity-selector">
        <button class="quantity-btn" id="decrease-qty">-</button>
        <input type="number" class="quantity-input" id="product-qty" value="1" min="1" max="${product.stock}">
        <button class="quantity-btn" id="increase-qty">+</button>
      </div>
      <button class="btn btn--primary" id="add-to-cart-detail">Add to Cart</button>
      <button class="btn btn--secondary" id="request-quote">Request Quote</button>
    </div>
  `;

  // Gallery functionality
  const mainImage = document.querySelector('#main-image');
  const thumbs = document.querySelectorAll('.thumb');

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      mainImage.src = thumb.src;
      mainImage.alt = thumb.alt;
    });
  });

  // Quantity controls
  const qtyInput = document.querySelector('#product-qty');
  const decreaseBtn = document.querySelector('#decrease-qty');
  const increaseBtn = document.querySelector('#increase-qty');

  decreaseBtn.addEventListener('click', () => {
    const current = parseInt(qtyInput.value);
    if (current > 1) qtyInput.value = current - 1;
  });

  increaseBtn.addEventListener('click', () => {
    const current = parseInt(qtyInput.value);
    if (current < product.stock) qtyInput.value = current + 1;
  });

  // Add to cart
  document.querySelector('#add-to-cart-detail').addEventListener('click', () => {
    const quantity = parseInt(qtyInput.value);
    cart.addItem(product, quantity);
  });
}

// Cart Page
function initCartPage() {
  renderCart();
}

function renderCart() {
  const container = document.querySelector('.cart-items');
  const subtotalEl = document.querySelector('.cart-subtotal');
  const clearBtn = document.querySelector('.clear-cart');

  if (!container) return;

  if (cart.items.length === 0) {
    container.innerHTML = '<p>Your cart is empty</p>';
    if (subtotalEl) subtotalEl.textContent = 'GHS 0.00';
    return;
  }

  container.innerHTML = cart.items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <img src="${item.images[0]}" alt="${item.name}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>${item.currency} ${item.price.toFixed(2)}</p>
        <div class="quantity-selector">
          <button class="quantity-btn decrease-qty">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="${item.stock}">
          <button class="quantity-btn increase-qty">+</button>
        </div>
      </div>
      <button class="remove-item" data-id="${item.id}">Remove</button>
    </div>
  `).join('');

  if (subtotalEl) {
    subtotalEl.textContent = `GHS ${cart.getTotal().toFixed(2)}`;
  }

  // Event listeners
  document.querySelectorAll('.decrease-qty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.cart-item');
      const id = itemEl.dataset.id;
      const input = itemEl.querySelector('.quantity-input');
      const current = parseInt(input.value);
      if (current > 1) {
        input.value = current - 1;
        cart.updateQuantity(id, current - 1);
        renderCart();
      }
    });
  });

  document.querySelectorAll('.increase-qty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.cart-item');
      const id = itemEl.dataset.id;
      const input = itemEl.querySelector('.quantity-input');
      const current = parseInt(input.value);
      const item = cart.items.find(i => i.id === id);
      if (current < item.stock) {
        input.value = current + 1;
        cart.updateQuantity(id, current + 1);
        renderCart();
      }
    });
  });

  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const itemEl = e.target.closest('.cart-item');
      const id = itemEl.dataset.id;
      const quantity = parseInt(e.target.value);
      cart.updateQuantity(id, quantity);
      renderCart();
    });
  });

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      cart.removeItem(id);
      renderCart();
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      cart.clear();
      renderCart();
    });
  }
}

// Checkout Page
function initCheckoutPage() {
  renderCheckoutSummary();
  initCheckoutForm();
}

function renderCheckoutSummary() {
  const container = document.querySelector('.checkout-summary');
  if (!container) return;

  container.innerHTML = cart.items.map(item => `
    <div class="checkout-item">
      <img src="${item.images[0]}" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <p>Qty: ${item.quantity} × ${item.currency} ${item.price.toFixed(2)}</p>
      </div>
      <p>${item.currency} ${(item.price * item.quantity).toFixed(2)}</p>
    </div>
  `).join('');

  const totalEl = document.querySelector('.checkout-total');
  if (totalEl) {
    totalEl.textContent = `GHS ${cart.getTotal().toFixed(2)}`;
  }
}

function initCheckoutForm() {
  const form = document.querySelector('.checkout-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = 'red';
        valid = false;
      } else {
        field.style.borderColor = '#ddd';
      }
    });

    if (!valid) {
      showToast('Please fill in all required fields');
      return;
    }

    // Simulate order submission
    const orderData = {
      customer: {
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value,
        company: form.company.value,
        address: form.address.value,
        city: form.city.value,
        country: form.country.value
      },
      items: cart.items,
      total: cart.getTotal(),
      paymentMethod: form.payment.value
    };

    // Send WhatsApp message
    sendOrderToWhatsApp(orderData);

    // Clear cart and show confirmation
    cart.clear();
    showOrderConfirmation(orderData);
  });
}

function showOrderConfirmation(order) {
  const modalContent = `
    <div class="order-confirmation">
      <h2>Order Confirmed!</h2>
      <p>Thank you for your order, ${order.customer.name}.</p>
      <p>Order Total: GHS ${order.total.toFixed(2)}</p>
      <p>You will receive a confirmation email shortly.</p>
      <button class="btn btn--primary" onclick="window.location.href='index.html'">Continue Shopping</button>
    </div>
  `;
  openModal(modalContent);
}

function sendOrderToWhatsApp(order) {
  const whatsappBusinessLink = 'https://wa.me/message/B42ODIFA73VQA1'; // Business WhatsApp link

  let message = `New Order Received\n\n`;
  message += `Customer Details:\n`;
  message += `Name: ${order.customer.name}\n`;
  message += `Email: ${order.customer.email}\n`;
  message += `Phone: ${order.customer.phone}\n`;
  if (order.customer.company) message += `Company: ${order.customer.company}\n`;
  message += `Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.country}\n\n`;

  message += `Order Items:\n`;
  order.items.forEach(item => {
    message += `- ${item.name} (Qty: ${item.quantity}) - GHS ${(item.price * item.quantity).toFixed(2)}\n`;
  });

  message += `\nTotal: GHS ${order.total.toFixed(2)}\n`;
  message += `Payment Method: ${order.paymentMethod}\n`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `${whatsappBusinessLink}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
}

// Contact Page
function initContactPage() {
  initContactForm();
}

function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = 'red';
        valid = false;
      } else {
        field.style.borderColor = '#ddd';
      }
    });

    if (!valid) {
      showToast('Please fill in all required fields');
      return;
    }

    // Send WhatsApp message
    const contactData = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      subject: form.subject.value,
      message: form.message.value
    };

    sendContactToWhatsApp(contactData);
    showToast('Message sent successfully!');
    form.reset();
  });
}

function sendContactToWhatsApp(contact) {
  const whatsappBusinessLink = 'https://wa.me/message/B42ODIFA73VQA1'; // Business WhatsApp link

  let message = `New Contact Message\n\n`;
  message += `Name: ${contact.name}\n`;
  message += `Email: ${contact.email}\n`;
  if (contact.phone) message += `Phone: ${contact.phone}\n`;
  message += `Subject: ${contact.subject}\n\n`;
  message += `Message:\n${contact.message}\n`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `${whatsappBusinessLink}?text=${encodedMessage}`;

  window.open(whatsappUrl, '_blank');
}

// Event delegation for dynamic elements
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('add-to-cart')) {
    e.preventDefault();
    const id = e.target.dataset.id;
    const product = products.find(p => p.id === id);
    if (product) {
      cart.addItem(product);
    }
  }
});