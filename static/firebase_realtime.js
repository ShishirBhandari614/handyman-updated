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

// ✅ Sorting function
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

// ✅ Real-time updates
document.addEventListener("DOMContentLoaded", () => {
    onChildChanged(spRef, snapshot => {
        const provider = snapshot.val();
        const card = document.getElementById(`provider-${provider.id}`);

        if (card) {
            // Update status
            const statusEl = card.querySelector(".status");
            statusEl.textContent = provider.is_online ? "Online" : "Offline";
            statusEl.classList.toggle("online", provider.is_online);
            statusEl.classList.toggle("offline", !provider.is_online);

            // Update sorting metadata
            card.dataset.online = provider.is_online;

            reorderProviderCards();

        } else {
            // Provider not in list → add if online
            if (provider.is_online && window.addProviderCard) {
                window.addProviderCard(provider);
                reorderProviderCards();
            }
        }
    });
});