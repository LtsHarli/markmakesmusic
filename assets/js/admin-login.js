document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/admin-dashboard.html';
        return;
    }

    // Set up form submission
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            window.location.href = '/admin-dashboard.html';
        } else {
            const error = await response.json();
            errorMessage.textContent = error.message || 'Invalid password';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
} 