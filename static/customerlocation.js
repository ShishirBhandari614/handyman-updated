document.addEventListener("DOMContentLoaded", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log("Latitude:", latitude);
                console.log("Longitude:", longitude);
                function getCSRFToken() {
                    // If CSRF token is set in a meta tag:
                    let token = document.querySelector('meta[name="csrf-token"]');
                    if (token) {
                        return token.getAttribute('content');
                    }
                
                    // Or get it from the cookie
                    return getCookie('csrftoken');
                }
                const csrfToken = getCSRFToken();
                console.log("CSRF Token:", csrfToken);
                // Send location data to the server
                fetch('/savelocation/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken':csrfToken , // Ensure CSRF token is passed
                    },
                    body: JSON.stringify({
                        user_type: 'customer',
                        latitude: latitude,
                        longitude: longitude,
                    }),
                })
                    .then((response) => {
                        if (response.ok) {
                            console.log("Location saved successfully for customer.");
                        } else {
                            console.error("Error saving location for customer.");
                        }
                    })
                    .catch((error) => console.error("Error:", error));
            },
            (error) => {
                console.error("Geolocation error:", error);
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
});
