document.addEventListener('DOMContentLoaded', function () {
    // Handling register and login buttons
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');

    if (registerBtn && loginBtn) {
        registerBtn.addEventListener('click', () => {
            container.classList.add("active");
        });

        loginBtn.addEventListener('click', () => {
            container.classList.remove("active");
        });
    } else {
        console.error('Register or login button not found');
    }
document.getElementById("sign-in-form").addEventListener("submit", function(event) {
    // Check if you need to prevent default or do any other operations
    // event.preventDefault(); // This will stop form submission
});

    // Handling forgot password form and pop-up
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const popup = document.getElementById('popup');
    const closeBtn = document.querySelector('.popup .close-btn');

    if (forgotPasswordForm && popup && closeBtn) {
        forgotPasswordForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent form from submitting normally

            // Display the pop-up with animation
            popup.classList.add('show');

            // Optionally, hide the pop-up after a few seconds
            setTimeout(() => {
                popup.classList.remove('show');
            }, 5000); // Hide after 5 seconds
        });

        closeBtn.addEventListener('click', function () {
            popup.classList.remove('show');
        });

        // Hide the popup when clicking outside of it
        window.addEventListener('click', function (event) {
            if (event.target === popup) {
                popup.classList.remove('show');
            }
        });
    } else {
        console.error('Form or popup elements not found');
    }

    // Handle Sign-In Button
    

});





