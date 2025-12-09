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
      item.quantity = Math.max(0, quantity);
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

// Project Management
let projects = [];

async function loadProducts() {
  try {
    console.log('Frontend: Loading products from Railway production backend...');
    // Use the Railway production backend URL
    const apiUrl = 'https://rezaraluminium-production.up.railway.app/api/products';
    console.log('Frontend: Fetching from:', apiUrl);

    const startTime = Date.now();
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    });

    const endTime = Date.now();
    console.log('Frontend: API response status:', response.status);
    console.log('Frontend: API response time:', endTime - startTime + 'ms');
    console.log('Frontend: Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    products = await response.json();
    console.log(`Frontend: Successfully loaded ${products.length} projects from Railway production backend`);
    console.log('Frontend: Full projects array:', products);

    if (products.length > 0) {
      console.log('Sample project:', {
        id: products[0].id,
        name: products[0].name,
        featured: products[0].featured,
        category: products[0].category,
        price: products[0].price,
        images: products[0].images?.length || 0
      });
    } else {
      console.warn('Frontend: No projects found in the database - check if projects have been added via admin');
    }

  } catch (error) {
    console.error('Frontend: Failed to load products from Railway production backend:', error.message);
    console.error('Frontend: Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });

    // Show user-friendly error message
    showToast('Could not load projects. Please refresh the page or try again later.');

    // Try to provide more specific error information
    if (error.message.includes('Failed to fetch')) {
      console.error('Frontend: Network error - check if Railway backend is running');
      console.error('Frontend: Check if CORS is properly configured on Railway');
      console.error('Frontend: Verify that the Railway backend URL is correct');
    } else if (error.message.includes('404')) {
      console.error('Frontend: API endpoint not found on Railway - check backend routes');
    } else if (error.message.includes('403') || error.message.includes('401')) {
      console.error('Frontend: Authentication/Authorization error with Railway backend');
    } else if (error.message.includes('500')) {
      console.error('Frontend: Server error on Railway backend - check backend logs');
    }

    products = [];
  }
}

// DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();

  // Initialize components based on page
  const path = window.location.pathname;

  if (path === '/' || path.endsWith('index.html')) {
    initHomePage();
  } else if (path.endsWith('projects.html')) {
    initProjectsPage();
  } else if (path.endsWith('product.html')) {
    initProjectPage();
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
    console.log('Frontend: Fetching featured products from Railway production backend...');
    const response = await fetch('https://rezaraluminium-production.up.railway.app/api/products/featured');
    console.log('Frontend: Featured API response status:', response.status);
    console.log('Frontend: Featured API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
    }

    const featured = await response.json();
    console.log('Frontend: Featured products received:', featured.length, 'products');

    if (featured.length > 0) {
      console.log('Frontend: Sample featured product:', {
        id: featured[0].id,
        name: featured[0].name,
        category: featured[0].category
      });
    }

    if (featured.length === 0) {
      console.log('Frontend: No featured projects found in database');
      container.innerHTML = '<p class="no-projects">No featured projects available. Check back soon for our latest work!</p>';
    } else {
      container.innerHTML = featured.map(project => createProjectCard(project)).join('');
      console.log('Frontend: Featured projects rendered to DOM');
    }
  } catch (error) {
    console.error('Frontend: Error loading featured products from Railway production backend:', error.message);
    console.error('Frontend: Featured products error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });

    // Show user-friendly error message
    if (container) {
      container.innerHTML = '<p class="error-message">Could not load featured projects. Please refresh the page.</p>';
    }

    // Try fallback only if we have projects loaded
    try {
      if (projects && projects.length > 0) {
        const allProjects = projects.filter(p => p.featured);
        if (allProjects.length > 0) {
          console.log('Frontend: Using fallback - showing featured projects from main projects array');
          if (container) {
            container.innerHTML = allProjects.map(project => createProjectCard(project)).join('');
          }
        } else {
          console.log('Frontend: No featured projects in fallback array either');
        }
      } else {
        console.log('Frontend: No projects loaded yet for fallback');
      }
    } catch (fallbackError) {
      console.error('Frontend: Fallback also failed:', fallbackError);
    }

    // Show toast notification for critical errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      showToast('Network error. Please check your internet connection.');
    }
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

// Projects Page
function initProjectsPage() {
  console.log('Projects Page: Initializing with', projects.length, 'projects loaded');
  console.log('Projects Page: Global projects array contents:', projects);

  const container = document.querySelector('.projects-grid');
  if (!container) {
    console.error('Projects Page: Container not found');
    return;
  }

  if (projects.length === 0) {
    console.warn('Projects Page: No projects available to display');
    container.innerHTML = '<p class="no-projects">No projects available. Check back soon for our latest work!</p>';
  } else {
    console.log('Projects Page: Rendering', projects.length, 'projects');
    renderProjects(projects);
  }
  initFilters();
}

function renderProjects(projectList) {
  const container = document.querySelector('.projects-grid');
  if (!container) return;

  if (projectList.length === 0) {
    container.innerHTML = '<p class="no-projects">No projects available. Check back soon for our latest work!</p>';
  } else {
    container.innerHTML = projectList.map(project => createProjectCard(project)).join('');
  }
}

function createProjectCard(project) {
  const imageSrc = project.images && project.images[0] ? project.images[0] : '/assets/products/placeholder-image.jpg';
  return `
    <div class="card project-card" data-id="${project.id}">
      <img src="${imageSrc}" alt="${project.name}" class="card__image">
      <div class="card__content">
        <h3 class="card__title">${project.name}</h3>
        <p class="card__description">${project.shortDescription || project.description}</p>
        ${project.price && project.price > 0 ? `<p class="card__price">${project.currency} ${project.price.toFixed(2)}</p>` : '<p class="card__price">Price available on request</p>'}
        <div class="card__actions">
          ${project.price && project.price > 0 ? `<button class="btn btn--secondary add-to-cart" data-id="${project.id}">Add to Cart</button>` : ''}
          <a href="product.html?id=${project.id}" class="btn btn--primary">View Details</a>
        </div>
      </div>
    </div>
  `;
}

function initFilters() {
  const categoryFilter = document.querySelector('#category-filter');
  const sortFilter = document.querySelector('#sort-filter');

  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterProjects);
  }

  if (sortFilter) {
    sortFilter.addEventListener('change', sortProjects);
  }
}

function filterProjects() {
  const category = document.querySelector('#category-filter').value;
  let filtered = category ? projects.filter(p => p.category === category) : projects;
  renderProjects(filtered);
}

function sortProjects() {
  const sort = document.querySelector('#sort-filter').value;
  let sorted = [...projects];

  switch (sort) {
    case 'price-low':
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-high':
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'newest':
    default:
      // Assume projects are already in order
      break;
  }

  renderProjects(sorted);
}

// Project Detail Page
function initProjectPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');
  const project = projects.find(p => p.id === projectId);

  if (project) {
    renderProjectDetail(project);
  }
}

function renderProductDetail(product) {
  const container = document.querySelector('.product-detail');
  if (!container) return;

  // Combine main images and additional images for gallery
  const allImages = [...(product.images || []), ...(product.additionalImages || [])];

  container.innerHTML = `
    <div class="product-gallery">
      <img src="${allImages[0] || '/assets/products/placeholder-image.jpg'}" alt="${product.name}" id="main-image">
      <div class="gallery-thumbs">
        ${allImages.map((img, index) => `<img src="${img}" alt="${product.name} ${index + 1}" class="thumb" data-index="${index}">`).join('')}
      </div>
    </div>
    <div class="product-info">
      <h1>${product.name}</h1>
      <div class="product-description">
        <p><strong>Short Description:</strong> ${product.shortDescription || product.description}</p>
        ${product.longDescription ? `<p><strong>Full Description:</strong> ${product.longDescription}</p>` : ''}
        ${product.category ? `<p><strong>Category:</strong> ${product.category}</p>` : ''}
        ${product.specs && Object.keys(product.specs).length > 0 ? `
          <div class="product-specs">
            <h3>Specifications:</h3>
            <ul>
              ${Object.entries(product.specs).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
      <p class="product-price">${product.currency} ${product.price.toFixed(2)}</p>
      <div class="quantity-selector">
        <button class="quantity-btn" id="decrease-qty">-</button>
        <input type="number" class="quantity-input" id="product-qty" value="1" min="1">
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
      mainImage.src = thumb.src || '/assets/products/placeholder-image.jpg';
      mainImage.alt = thumb.alt;
    });
  });

  // Quantity controls - remove existing listeners first
  const qtyInput = document.querySelector('#product-qty');
  const decreaseBtn = document.querySelector('#decrease-qty');
  const increaseBtn = document.querySelector('#increase-qty');

  if (decreaseBtn && increaseBtn && qtyInput) {
    // Clone and replace to remove existing listeners
    const newDecreaseBtn = decreaseBtn.cloneNode(true);
    const newIncreaseBtn = increaseBtn.cloneNode(true);
    const newQtyInput = qtyInput.cloneNode(true);

    decreaseBtn.parentNode.replaceChild(newDecreaseBtn, decreaseBtn);
    increaseBtn.parentNode.replaceChild(newIncreaseBtn, increaseBtn);
    qtyInput.parentNode.replaceChild(newQtyInput, qtyInput);

    // Add new listeners
    newDecreaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = parseInt(newQtyInput.value);
      if (current > 1) newQtyInput.value = current - 1;
    });

    newIncreaseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = parseInt(newQtyInput.value);
      newQtyInput.value = current + 1;
    });
  }

  // Add to cart
  document.querySelector('#add-to-cart-detail').addEventListener('click', () => {
    const quantity = parseInt(newQtyInput.value);
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
          <button class="quantity-btn decrease-qty" data-id="${item.id}">-</button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
          <button class="quantity-btn increase-qty" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="remove-item" data-id="${item.id}">Remove</button>
    </div>
  `).join('');

  if (subtotalEl) {
    subtotalEl.textContent = `GHS ${cart.getTotal().toFixed(2)}`;
  }

  // Remove existing event listeners to prevent duplicates
  const cartContainer = document.querySelector('.cart-items');
  if (cartContainer) {
    const newContainer = cartContainer.cloneNode(true);
    cartContainer.parentNode.replaceChild(newContainer, cartContainer);
  }

  // Attach event listeners directly to buttons after rendering
  document.querySelectorAll('.decrease-qty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = e.target.dataset.id;
      const itemEl = e.target.closest('.cart-item');
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
      e.preventDefault();
      const id = e.target.dataset.id;
      const itemEl = e.target.closest('.cart-item');
      const input = itemEl.querySelector('.quantity-input');
      const current = parseInt(input.value);
      const item = cart.items.find(i => i.id === id);
      if (item) {
        input.value = current + 1;
        cart.updateQuantity(id, current + 1);
        renderCart();
      }
    });
  });

  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.dataset.id;
      const quantity = parseInt(e.target.value);
      const item = cart.items.find(i => i.id === id);
      if (item) {
        const validQuantity = Math.max(1, quantity);
        e.target.value = validQuantity;
        cart.updateQuantity(id, validQuantity);
        renderCart();
      }
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
      <img src="${item.images && item.images[0] ? item.images[0] : '/assets/products/placeholder-image.jpg'}" alt="${item.name}">
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
      total: cart.getTotal()
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

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `${whatsappBusinessLink}?text=${encodedMessage}`;

  // Try to open WhatsApp, fallback to regular link if blocked
  try {
    const newWindow = window.open(whatsappUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      // Popup was blocked, redirect instead
      window.location.href = whatsappUrl;
    }
  } catch (error) {
    // Fallback for any errors
    window.location.href = whatsappUrl;
  }
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
    const project = projects.find(p => p.id === id);
    if (project) {
      cart.addItem(project);
    }
  }
});