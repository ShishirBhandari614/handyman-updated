document.addEventListener('DOMContentLoaded', () => {
    const customerForm = document.getElementById('sign-up-form');

    customerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('signin-username').value;
        const email = document.getElementById('signin-email').value;
        const phoneNumber = document.getElementById('signin-phone').value;
        const password = document.getElementById('signin-password').value;
        const confirmPassword = document.getElementById('signup-confpassword').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/; // Assumes a 10-digit phone number

        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        if (!phoneRegex.test(phoneNumber)) {
            alert('Phone number must be exactly 10 digits.');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }


        const requestData = {
            action:"signup",
            username: username,
            email: email,
            phone: phoneNumber,
            password: password,
            password2: confirmPassword
        };

        const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]').value;

        try {
            const response = await fetch('/signup/customer/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const result = await response.json();
                alert('Customer Sign-up successful!');
                console.log(result);
                window.location.href = '/signup/customer/';
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.error || 'Customer Sign-up failed!'}`);
            }
        } catch (error) {
            console.error('Error during sign-up:', error);
            alert('An unexpected error occurred. Please try again later.');
        }
    });
});
