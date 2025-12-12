import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { 
    getDatabase, 
    ref, 
    onChildChanged, 
    onDisconnect, 
    update 
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
    databaseURL: "https://handyman-fc64d-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const spRef = ref(db, "service_providers");

console.log("🔥 Firebase Realtime initialized");

// ✅ You MUST know the provider's ID on this page
// Example: Django injects it into the template
// <script> const providerId = "{{ provider.id }}"; </script>

if (typeof providerId !== "undefined") {
    const providerRef = ref(db, `service_providers/${providerId}`);

    // ✅ Automatically set offline when browser closes, refreshes, crashes, etc.
    onDisconnect(providerRef).update({
        is_online: false
    });

    console.log("✅ onDisconnect() registered for provider:", providerId);
}

// ✅ Real-time listener for customer UI
document.addEventListener("DOMContentLoaded", () => {
    onChildChanged(spRef, snapshot => {
        const provider = snapshot.val();
        console.log("🔥 Firebase update received:", provider);

        const card = document.getElementById(`provider-${String(provider.id)}`);

        if (card) {
            // --- Update online/offline status ---
            const statusEl = card.querySelector(".status");
            if (statusEl) {
                statusEl.textContent = provider.is_online ? "Online" : "Offline";
                statusEl.classList.toggle("online", provider.is_online);
                statusEl.classList.toggle("offline", !provider.is_online);
            }

            // --- Update name ---
            const nameEl = card.querySelector("h4");
            if (nameEl) nameEl.textContent = provider.name || "Unnamed";

            // --- Update work type and service type ---
            const workTypeEl = card.querySelector(".work-type");
            if (workTypeEl) workTypeEl.textContent = `Work Type: ${provider.work_type || 'N/A'}`;

            const serviceTypeEl = card.querySelector(".service-type");
            if (serviceTypeEl) serviceTypeEl.textContent = `Service Type: ${provider.service_type || 'N/A'}`;

            // --- Optional: update timestamp ---
            const updatedEl = card.querySelector(".updated-at");
            if (updatedEl) updatedEl.textContent = `Updated: ${new Date().toLocaleTimeString()}`;

        } else {
            // Provider not in list → add if online
            if (provider.is_online && window.addProviderCard) {
                window.addProviderCard(provider);
            }
        }
    });
});