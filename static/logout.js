document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogoutButton = document.getElementById('confirmLogout');
    const cancelLogoutButton = document.getElementById('cancelLogout');

    // Show logout confirmation modal
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        logoutModal.style.display = 'flex';
    });

    // Cancel logout
    cancelLogoutButton.addEventListener('click', () => {
        logoutModal.style.display = 'none';
    });

    // Confirm logout
    confirmLogoutButton.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            alert('No token found. Please log in first.');
            logoutModal.style.display = 'none';
            return;
        }

        try {
            const response = await fetch('/logout/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert('Logout successful.');
                localStorage.removeItem('token');
                window.location.href = '/';
            } else {
                const errorData = await response.json();
                alert(`Logout failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error during logout:', error);
            alert('An error occurred. Please try again.');
        }

        logoutModal.style.display = 'none';
    });
});
