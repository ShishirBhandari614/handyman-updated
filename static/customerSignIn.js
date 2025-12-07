document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.getElementById('sign-in-form');

    signUpForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // Explicitly construct the request data object
        const requestData = {
            action:"login", // Add the action field explicitly
            username: username,
            password: password,
         
        };
        console.log('Request Data:', requestData); 

        // Get CSRF token from the form
        const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
    
        try {
            const response = await fetch('/signup/customer/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Ensure content type is JSON
                    'X-CSRFToken': csrfToken, // CSRF token in headers
                },
                body: JSON.stringify(requestData), // Send the requestData as JSON
            });

            if (response.ok) {
                const result = await response.json();
                localStorage.setItem('token', result.token);
                alert('customer login successful!');
                console.log(result);
                window.location.href = '/customerdashboard/'; // Redirect to the login page after success
            } else {
                const errorData = await response.json();
                console.log(errorData); // Log error response to console
                alert(`Error: ${errorData.error || 'Sign-in failed!'}`);
            }
        } catch (error) {
            console.error('Error during sign-in:', error);
            alert('An unexpected error occurred. Please try again later.');
        }
    });
});
