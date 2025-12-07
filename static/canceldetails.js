// Show Cancel Modal
function showCancelModal(button) {
    // Extract data attributes from the cancel button
    const bookingId = button.getAttribute('data-booking-id');
    const serviceProviderId = button.getAttribute('data-service-provider-id');
    const phoneNumber = button.getAttribute('data-phone-number');
    const customerName = button.getAttribute('data-customer-name');
    const customerPhone = button.getAttribute('data-customer-phone');
    const serviceType = button.getAttribute('data-service-type');
    const serviceProviderName = button.getAttribute('data-service-provider-name');
    const customerId = button.getAttribute('data-customer-id');

    // Debugging: Log the values to the console
    console.log({
        bookingId,
        serviceProviderId,
        phoneNumber,
        customerName,
        customerPhone,
        serviceType,
        serviceProviderName,
        customerId
    });

    // Get modal elements
    const cancelModal = document.getElementById('cancelModal');
    const cancelReason = document.getElementById('cancelReason');

    if (!cancelModal || !cancelReason) {
        console.error("Error: Cancel modal or reason textarea not found in DOM.");
        return;
    }

    // Store data in the textarea element for reference
    cancelReason.setAttribute('data-booking-id', bookingId);
    cancelReason.setAttribute('data-service-provider-id', serviceProviderId);
    cancelReason.setAttribute('data-phone-number', phoneNumber);
    cancelReason.setAttribute('data-customer-id', customerId);

    // Display the modal
    cancelModal.style.display = 'flex';
}

// Close Cancel Modal
function closeCancelModal() {
    document.getElementById('cancelModal').style.display = 'none';
}

// Submit Cancel Reason
function submitCancelReason() {
    const cancelReason = document.getElementById('cancelReason');
    const reason = cancelReason.value.trim();

    // Extract stored data
    const bookingId = cancelReason.getAttribute('data-booking-id');
    const serviceProviderId = cancelReason.getAttribute('data-service-provider-id');
    const phoneNumber = cancelReason.getAttribute('data-phone-number');
    const customerId = cancelReason.getAttribute('data-customer-id');

    if (!reason) {
        alert("Please provide a reason for cancellation.");
        return;
    }

    // Debugging: Log the values
    console.log({
        reason,
        bookingId,
        serviceProviderId,
        phoneNumber,
        customerId
    });

    const csrfToken = getCSRFToken();

    // Send cancellation data to the server
    fetch('/cancel-booking/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            reason,
            booking_id: bookingId,
            service_provider_id: serviceProviderId,
            phone_number: phoneNumber,
            customer_id: customerId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Booking cancelled successfully.");
            closeCancelModal(); // Hide the modal
            window.location.href = '/booking-history/'; // Redirect to history page
        } else {
            alert("Error cancelling booking. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    });
}

// CSRF Token Retrieval
function getCSRFToken() {
    let token = document.querySelector('meta[name="csrf-token"]');
    if (token) {
        return token.getAttribute('content');
    }
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))?.split('=')[1];
}
