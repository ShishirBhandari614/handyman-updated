import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
    getDatabase,
    ref,
    onChildChanged
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://handyman-fc64d-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const spRef = ref(db, "service_providers");

console.log("🔥 Firebase Realtime initialized");


// ✅ KEEP sorting logic (unchanged)
function reorderProviderCards() {
    const container = document.getElementById("providers-container");
    if (!container) return;

    const cards = Array.from(container.children);

    cards.sort((a, b) => {
        const aOnline = a.dataset.online === "true";
        const bOnline = b.dataset.online === "true";

        if (aOnline !== bOnline) return aOnline ? -1 : 1;

        const aRating = parseFloat(a.dataset.rating || 0);
        const bRating = parseFloat(b.dataset.rating || 0);
        if (aRating !== bRating) return bRating - aRating;

        const aDistance = parseFloat(a.dataset.distance || 999);
        const bDistance = parseFloat(b.dataset.distance || 999);
        return aDistance - bDistance;
    });

    cards.forEach(card => container.appendChild(card));
}


// ✅ Firebase listener (NO distance math)
document.addEventListener("DOMContentLoaded", () => {

    const token = localStorage.getItem("token");
    const serviceType = new URLSearchParams(window.location.search).get("service_type");

    onChildChanged(spRef, async snapshot => {
        const firebaseProvider = snapshot.val();
        const providerId = firebaseProvider.id;
    
        console.log("🔥 Firebase changed:", firebaseProvider);
    
        const res = await fetch(
            `/search-service/?service_type=${encodeURIComponent(serviceType)}&provider_id=${providerId}`,
            {
                headers: {
                    "Authorization": `Token ${token}`
                }
            }
        );
    
        const data = await res.json();
        console.log("📡 Django response for provider", providerId, ":", data);
    
        const provider = data.providers?.[0] || null;
    
        const card = document.getElementById(`provider-${providerId}`);
        console.log("🧩 Existing card:", card);
    
        if (!provider) {
            console.log("🚫 Provider not allowed by backend (2km or filters). Removing card if exists.");
            if (card) card.remove();
            return;
        }
    
        console.log("✅ Using provider from backend:", provider);
    
        // ✅ Firebase is the REAL source of truth for online/offline
const isOnline = firebaseProvider.is_online;

        if (card) {
            console.log("♻️ Updating existing card", provider.id, "to online =", isOnline);

            card.dataset.online = isOnline;
            card.dataset.rating = provider.average_rating;
            card.dataset.distance = provider.distance;

            const statusEl = card.querySelector(".status");
            statusEl.textContent = isOnline ? "Online" : "Offline";
            statusEl.className = `status ${isOnline ? "online" : "offline"}`;

            const distEl = card.querySelector(".distance");
            if (distEl) distEl.textContent = `Distance: ${provider.distance} km`;
        } else {
            console.log("➕ No card found, creating new card for", provider.id);

            // ✅ Override Django’s stale value with Firebase’s real-time value
            provider.is_online = isOnline;

            window.addProviderCard(provider);
        }
    
        reorderProviderCards();
    });
});