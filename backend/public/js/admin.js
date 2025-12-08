// Admin JavaScript

// Login/Register functionality
if (document.getElementById('loginForm')) {
    let isLogin = true;

    document.getElementById('toggleForm').addEventListener('click', (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        document.getElementById('formTitle').textContent = isLogin ? 'Admin Login' : 'Admin Register';
        document.getElementById('submitBtn').textContent = isLogin ? 'Login' : 'Register';
        document.getElementById('toggleForm').textContent = isLogin ? "Don't have an account? Register here" : "Already have an account? Login here";
        document.getElementById('message').textContent = '';
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const endpoint = isLogin ? '/api/admin/login' : '/api/admin/register';

        try {
            console.log('Sending request to:', endpoint, 'with:', { username, password });
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                if (isLogin) {
                    console.log('Login successful, redirecting to dashboard');
                    window.location.href = '/admin/dashboard';
                } else {
                    document.getElementById('message').textContent = 'Registration successful! You can now login.';
                    // Switch back to login
                    document.getElementById('toggleForm').click();
                }
            } else {
                document.getElementById('message').textContent = data.message || 'Login failed';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('message').textContent = 'Network error: ' + error.message;
        }
    });
}

// Dashboard functionality
if (document.querySelector('.dashboard')) {
    let products = [];

    // Check authentication
    async function checkAuth() {
        try {
            const response = await fetch('/api/admin/check');
            const data = await response.json();
            if (!data.authenticated) {
                window.location.href = '/admin/login';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/admin/login';
        }
    }

    // Load stats
    async function loadStats() {
        try {
            const response = await fetch('/api/products/stats');
            const data = await response.json();
            document.getElementById('totalProducts').textContent = data.totalProducts;
            document.getElementById('featuredCount').textContent = data.featuredCount;
            document.getElementById('recentUploads').textContent = data.recentUploads.length;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    // Load products
    async function loadProducts() {
        try {
            const response = await fetch('/api/products');
            products = await response.json();
            renderProductsTable();
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    // Render products table
    function renderProductsTable() {
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.price} ${product.currency}</td>
                <td>${product.featured ? 'Yes' : 'No'}</td>
                <td>
                    <button class="btn btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="btn btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Modal functionality
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close');

    document.getElementById('addProductBtn').addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Add Product';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Product form submission
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const productId = formData.get('id');

        // Ensure featured checkbox value is sent
        if (!formData.has('featured')) {
            formData.append('featured', 'false');
        }

        // Debug: Log form data
        console.log('Form data:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        const url = productId ? `/api/products/update/${productId}` : '/api/products/create';
        const method = productId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                body: formData
            });

            if (response.ok) {
                modal.style.display = 'none';
                loadProducts();
                loadStats();
            } else {
                const errorData = await response.json();
                alert('Error saving product: ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product: ' + error.message);
        }
    });

    // Edit product
    window.editProduct = (id) => {
        const product = products.find(p => p.id === id);
        if (product) {
            document.getElementById('modalTitle').textContent = 'Edit Product';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productFeatured').checked = product.featured;
            modal.style.display = 'block';
        }
    };

    // Delete product
    window.deleteProduct = async (id) => {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await fetch(`/api/products/delete/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    loadProducts();
                    loadStats();
                } else {
                    alert('Error deleting product');
                }
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    // Navigation
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.sidebar-menu a').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const target = link.getAttribute('href').substring(1);
            document.querySelectorAll('.content > div').forEach(div => div.style.display = 'none');
            document.getElementById(target + '-section').style.display = 'block';
        });
    });

    // Initial load
    checkAuth().then(() => {
        loadStats();
        loadProducts();
    });
}