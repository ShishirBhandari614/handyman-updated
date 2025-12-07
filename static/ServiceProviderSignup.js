document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.getElementById('sign-up-form');

    signUpForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        // Gather form data
        // const action = document.getElementById('signin-action').value;
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
        // const action = 'signup';
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Explicitly construct the request data object
        const requestData = {
            action:"signup", // Add the action field explicitly
            username: username,
            email: email,
            phone: phoneNumber,
            password: password,
            password2: confirmPassword,
        };
        console.log('Request Data:', requestData); 

        // Get CSRF token from the form
        const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
        

        try {
            const response = await fetch('/signup/serviceprovider/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Ensure content type is JSON
                    'X-CSRFToken': csrfToken, // CSRF token in headers
                },
                body: JSON.stringify(requestData), // Send the requestData as JSON
            });

            if (response.ok) {
                const result = await response.json();
                alert('Service provider sign-up successful!');
                console.log(result);
                window.location.href = '/signup/serviceprovider/'; // Redirect to the login page after success
            } else {
                const errorData = await response.json();
                console.log(errorData); // Log error response to console
                alert(`Error: ${errorData.error || 'Sign-up failed!'}`);
            }
        } catch (error) {
            console.error('Error during sign-up:', error);
            alert('An unexpected error occurred. Please try again later.');
        }
    });
});
