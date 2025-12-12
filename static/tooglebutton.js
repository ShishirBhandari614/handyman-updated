import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, update, onDisconnect } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { firebaseConfig } from "./firebase_config.js";   // ✅ imported config

// ✅ Initialize Firebase immediately
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Provider ID from Django
console.log("Provider ID:", providerId);

const providerRef = ref(db, `service_providers/${providerId}`);

// ✅ Auto offline on disconnect (browser close, crash, network loss)
onDisconnect(providerRef).update({ is_online: false });
console.log("✅ onDisconnect registered");

// ✅ DOM logic
document.addEventListener("DOMContentLoaded", () => {

    const statusToggle = document.getElementById('status-toggle');
    const statusOnline = document.getElementById('status-online');
    const statusOffline = document.getElementById('status-offline');

    // ✅ Force offline on every page load / refresh
    update(providerRef, { is_online: false });
    console.log("✅ Forced offline on page load");

    let isOnline = false;

    // ✅ Toggle button click
    statusToggle.addEventListener('click', () => {
        isOnline = !isOnline;

        if (isOnline) {
            statusToggle.classList.add('active');
            statusOnline.classList.add('show');
            statusOffline.classList.remove('show');
        } else {
            statusToggle.classList.remove('active');
            statusOnline.classList.remove('show');
            statusOffline.classList.add('show');
        }

        // ✅ Update Django backend
        updateServiceProviderStatus(isOnline);

        // ✅ Update Firebase
        update(providerRef, { is_online: isOnline });
    });
});

// ✅ Django update function
function updateServiceProviderStatus(isOnline) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    const token = localStorage.getItem('token');

    fetch('/update-status/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
            'Authorization': `Token ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ is_online: isOnline }),
    })
    .then(response => {
        if (response.ok) {
            console.log("✅ Django status updated");
        } else {
            console.error("❌ Django update failed");
        }
    })
    .catch(error => console.error("❌ Error:", error));
}