// Show Order Complete Message
function showOrderCompleteMessage(button) {
    const bookingId = button.getAttribute('data-booking-id');
    const serviceProviderId = button.getAttribute('data-service-provider-id');
    const phoneNumber = button.getAttribute('data-phone-number');
    const customerName = button.getAttribute('data-customer-name');
    const customerPhone = button.getAttribute('data-customer-phone');
    const serviceType = button.getAttribute('data-service-type');
    const serviceProviderName = button.getAttribute('data-service-provider-name');
    const profile = button.getAttribute('data-profile');
    const customerId = button.getAttribute('data-customer-id');

    // Log the data to verify it's passed correctly
    console.log({
        bookingId,
        serviceProviderId,
        phoneNumber,
        customerName,
        customerPhone,
        serviceType,
        serviceProviderName,
        profile,
        customerId
    });

    alert('Order completed for booking ID: ' + bookingId);
    setTimeout(() => {
        document.getElementById('ratingModal').style.display = 'flex';
    }, 1000);
}

// Close Rating Modal
function closeRatingModal() {
    window.location.href = '/booking-history/'; // Replace with your dashboard URL
}

// Submit Rating
function submitRating() {
    const stars = document.querySelectorAll('.rating-stars i.selected').length;
    if (stars === 0) {
        alert('Please select a rating before submitting.');
        return;
    }

    // Retrieve data from the button element
    const completeButton = document.querySelector('.complete-button');
    const bookingId = completeButton.getAttribute('data-booking-id');
    const serviceProviderId = completeButton.getAttribute('data-service-provider-id');
    const customerId = completeButton.getAttribute('data-customer-id');
    const ratingValue = stars;

    // Log the data to verify it's correct
    console.log({
        bookingId,
        serviceProviderId,
        customerId,
        ratingValue
    });

    const csrfToken = getCSRFToken();

    fetch('/submit-rating/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            rating_value: ratingValue,
            booking_id: bookingId,
            service_provider_id: serviceProviderId,
            customer_id: customerId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Thank you for your feedback!');
            document.getElementById('ratingModal').style.display = 'none'; // Close the modal
            window.location.href = '/booking-history/'; // Redirect to customer dashboard
        } else {
            alert('Error submitting rating. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

// CSRF Token
function getCSRFToken() {
    let token = document.querySelector('meta[name="csrf-token"]');
    if (token) {
        return token.getAttribute('content');
    }
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))?.split('=')[1];
}

// Star Rating Selection
document.getElementById('starsContainer').addEventListener('click', (e) => {
    if (e.target.classList.contains('fa-star')) {
        const stars = document.querySelectorAll('.rating-stars i');
        const rating = parseInt(e.target.getAttribute('data-value'));

        stars.forEach((star, index) => {
            star.classList.toggle('selected', index < rating);
        });
    }
});
