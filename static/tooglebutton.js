const statusToggle = document.getElementById('status-toggle');
const statusOnline = document.getElementById('status-online');
const statusOffline = document.getElementById('status-offline');

let isOnline = false;

// Event listener for the toggle button
statusToggle.addEventListener('click', () => {
    isOnline = !isOnline;
    
    // Update the toggle button state
    if (isOnline) {
        statusToggle.classList.add('active');
        statusOnline.classList.add('show');
        statusOffline.classList.remove('show');
    } else {
        statusToggle.classList.remove('active');
        statusOnline.classList.remove('show');
        statusOffline.classList.add('show');
    }

    // Send the status update to the server
    updateServiceProviderStatus(isOnline);
});

// Function to send the online status update to the server
function updateServiceProviderStatus(isOnline) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    fetch('/update-status/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
            is_online: isOnline,
        }),
    })
    .then(response => {
        if (response.ok) {
            console.log("Service provider status updated.");
        } else {
            console.error("Error updating service provider status.");
        }
    })
    .catch(error => console.error("Error:", error));
}

// Reset is_online when the user closes the browser or navigates away
window.addEventListener('beforeunload', () => {
    // Only send the request if the service provider is online
    if (isOnline) {
        resetServiceProviderStatus();
    }
});

// Function to reset the service provider's status to offline when the page is unloaded
function resetServiceProviderStatus() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    fetch('/update-status/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
            is_online: false,  // Reset to offline when exiting
        }),
    })
    .then(response => {
        if (response.ok) {
            console.log("Service provider status reset.");
        } else {
            console.error("Error resetting service provider status.");
        }
    })
    .catch(error => console.error("Error:", error));
}
