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
    let projects = [];
    let admins = [];

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

    // Load projects
    async function loadProjects() {
        try {
            const response = await fetch('/api/products');
            projects = await response.json();
            renderProjectsTable();
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    // Load admins
    async function loadAdmins() {
        try {
            const response = await fetch('/api/admin/list');
            admins = await response.json();
            renderAdminsTable();
        } catch (error) {
            console.error('Error loading admins:', error);
        }
    }

    // Render projects table
    function renderProjectsTable() {
        const tbody = document.getElementById('projectsTableBody');
        tbody.innerHTML = '';
        projects.forEach(project => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${project.name}</td>
                <td>${project.category}</td>
                <td>${project.featured ? 'Yes' : 'No'}</td>
                <td>
                    <button class="btn btn-edit" onclick="editProject('${project.id}')">Edit</button>
                    <button class="btn btn-delete" onclick="deleteProject('${project.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Render admins table
    function renderAdminsTable() {
        const tbody = document.getElementById('adminsTableBody');
        tbody.innerHTML = '';
        admins.forEach(admin => {
            const createdAt = new Date(admin.createdAt).toLocaleDateString();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${admin.username}</td>
                <td>${createdAt}</td>
                <td>
                    <button class="btn btn-delete" onclick="deleteAdmin('${admin.username}')">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Modal functionality
    const modal = document.getElementById('projectModal');
    const adminModal = document.getElementById('adminModal');
    const closeBtns = document.querySelectorAll('.close');

    document.getElementById('addProjectBtn').addEventListener('click', () => {
        document.getElementById('modalTitle').textContent = 'Add Project';
        document.getElementById('projectForm').reset();
        document.getElementById('projectId').value = '';
        modal.style.display = 'block';
    });

    document.getElementById('addAdminBtn').addEventListener('click', () => {
        document.getElementById('adminForm').reset();
        adminModal.style.display = 'block';
    });

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
            adminModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
        if (e.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });

    // Project form submission
    document.getElementById('projectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const projectId = formData.get('id');

        // Handle featured checkbox properly
        const featuredCheckbox = document.getElementById('projectFeatured');
        formData.set('featured', featuredCheckbox.checked ? 'true' : 'false');

        // Debug: Log form data
        console.log('Form data:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        const url = projectId ? `/api/products/update/${projectId}` : '/api/products/create';
        const method = projectId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                body: formData
            });

            if (response.ok) {
                modal.style.display = 'none';
                loadProjects();
                loadStats();
            } else {
                const errorData = await response.json();
                alert('Error saving project: ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Error saving project: ' + error.message);
        }
    });

    // Admin form submission
    document.getElementById('adminForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        try {
            const response = await fetch('/api/admin/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                adminModal.style.display = 'none';
                loadAdmins();
                alert('Admin created successfully');
            } else {
                const errorData = await response.json();
                alert('Error creating admin: ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            alert('Error creating admin: ' + error.message);
        }
    });

    // Edit project
    window.editProject = (id) => {
        const project = projects.find(p => p.id === id);
        if (project) {
            document.getElementById('modalTitle').textContent = 'Edit Project';
            document.getElementById('projectId').value = project.id;
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectCategory').value = project.category;
            document.getElementById('projectShortDescription').value = project.shortDescription || '';
            document.getElementById('projectLongDescription').value = project.longDescription || '';
            document.getElementById('projectPrice').value = project.price;
            document.getElementById('projectFeatured').checked = project.featured;
            // Clear file inputs for editing (optional)
            document.getElementById('projectImages').value = '';
            document.getElementById('projectVideo').value = '';
            document.getElementById('projectAttachments').value = '';
            modal.style.display = 'block';
        }
    };

    // Delete project
    window.deleteProject = async (id) => {
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                const response = await fetch(`/api/products/delete/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    loadProjects();
                    loadStats();
                } else {
                    alert('Error deleting project');
                }
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    // Delete admin
    window.deleteAdmin = async (username) => {
        if (confirm(`Are you sure you want to delete admin "${username}"?`)) {
            try {
                const response = await fetch('/api/admin/delete', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });

                if (response.ok) {
                    loadAdmins();
                    alert('Admin deleted successfully');
                } else {
                    const errorData = await response.json();
                    alert('Error deleting admin: ' + (errorData.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error deleting admin:', error);
                alert('Error deleting admin: ' + error.message);
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
        loadProjects();
        loadAdmins();
    });
}