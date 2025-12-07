document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded, attaching events...");
    
    // Using event delegation on document.body or any parent container
    document.body.addEventListener("click", function(event) {
        // Check if the clicked element has the class "book-now"
        if (event.target && event.target.classList.contains("book-now")) {
            event.preventDefault();  // Prevent the default behavior of the link
            console.log("Book Now button clicked!");

            // Call the handleBooking function
            handleBooking(event.target);
        } else {
            console.log("Clicked element is not a Book Now button:", event.target);
        }
    });
});

// Function to handle the booking when the button is clicked
function handleBooking(button) {
    // Extract attributes from the clicked button
    var serviceType = document.getElementById('service-type').value;
    let userId = button.getAttribute("data-id");
    let phoneNumber = button.getAttribute("data-phone");
    let customerId = button.getAttribute("customerid");
    let customerName = button.getAttribute("customername");
    let customerPhone = button.getAttribute("customerphone");
    let serviceProviderName = button.getAttribute("serviceprovidername");
    let profile = button.getAttribute("profile");

    // Log the extracted values for debugging
    console.log("User ID:", userId);
    console.log("Phone Number:", phoneNumber);
    console.log("Customer ID:", customerId);
    console.log("Customer Name:", customerName);
    console.log("Customer Phone:", customerPhone);
    console.log("Service Provider Name:", serviceProviderName);
    console.log("Profile:", profile);

    // Function to get CSRF token
    function getCSRFToken() {
        let token = document.querySelector('meta[name="csrf-token"]');
        if (token) {
            return token.getAttribute('content');
        }
        return document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='))?.split('=')[1];
    }

    // Get CSRF token for security in AJAX requests
    const csrfToken = getCSRFToken();
    console.log("CSRF Token:", csrfToken);

    // Send booking data to /book/
    fetch("/book/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken
        },
        body: JSON.stringify({
            user_id: userId,
            phone: phoneNumber,
            customer_id: customerId,
            customer_phone: customerPhone,
            customer_name: customerName,
            serviceType: serviceType
        })
    })
    .then(response => response.json())  // Parse JSON response
    .then(result => {
        console.log("Full response from /book/:", result);  // Debugging log
        if (result.success) {  // Check for success key
            alert("Booking successful! SMS Status: " + (result.message || "No message provided"));

            // After /book/ is successful, send data to /viewprofile/
            fetch("/viewprofile/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken
                },
                body: JSON.stringify({
                    user_id: userId,
                    phone: phoneNumber,
                    serviceprovidername: serviceProviderName,
                    profile: profile,
                    customer_id: customerId,
                    customer_phone: customerPhone,
                    customer_name: customerName,
                    serviceType: serviceType
                })
            })
            .then(response => response.json())  // Ensure JSON response from /viewprofile/
            .then(result => {
                console.log("Full response from /viewprofile/:", result);
                if (result.success) {
                    alert("Booking confirmed on profile page!");

                    // Ensure redirect happens **only** after successful response from /viewprofile/
                    window.location.href = `/viewprofile/?user_id=${userId}&phone_number=${phoneNumber}&customer_id=${customerId}&customer_name=${encodeURIComponent(customerName)}&customer_phone=${customerPhone}&service_type=${encodeURIComponent(serviceType)}&service_provider_name=${encodeURIComponent(serviceProviderName)}&profile=${encodeURIComponent(profile)}`;
                } else {
                    alert("Error updating profile: " + (result.message || "Unknown error"));
                }
            })
            .catch(error => {
                console.error("Fetch error from /viewprofile/:", error);
                alert("An error occurred while processing your profile update.");
            });

        } else {
            alert("Booking failed: " + (result.message || "Unknown error"));
        }
    })
    .catch(error => {
        console.error("Fetch error from /book/:", error);
        alert("An error occurred while processing your booking request.");
    });
}
