import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://handyman-fc64d-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const db = getDatabase(app);

// ---------------------------------------------------------
// ✅ Resolve providerId
// ---------------------------------------------------------
let providerId = null;
if (typeof window !== "undefined" && window.providerId) {
    providerId = String(window.providerId);
} else {
    providerId = "6"; // fallback for testing
}

const notifPath = `notifications/${providerId}/latest`;
const notifRef = ref(db, notifPath);

// ---------------------------------------------------------
// ✅ Track last bookingId and skip first snapshot
// ---------------------------------------------------------
let lastBookingId = null;
let firstSnapshot = true;

onValue(notifRef, (snapshot) => {
    if (!snapshot.exists()) return;

    const notif = snapshot.val();

    // Skip the very first snapshot (page refresh)
    if (firstSnapshot) {
        firstSnapshot = false;
        lastBookingId = notif.booking_id; // record current booking so we don't alert again
        console.log("ℹ️ [PushNoti] Initial snapshot ignored:", notif);
        return;
    }

    // Only show popup if booking_id is new
    if (notif.booking_id !== lastBookingId) {
        lastBookingId = notif.booking_id;
        showNotificationPopup(notif.message || "You have a new booking request");
        playNotificationSound();
    } else {
        console.log("ℹ️ [PushNoti] Duplicate notification ignored:", notif);
    }
});

// ---------------------------------------------------------
// ✅ Popup UI
// ---------------------------------------------------------
function showNotificationPopup(message) {
    const div = document.createElement("div");
    div.className = "notif-popup";
    div.innerHTML = `<strong>${message}</strong>`;
    document.body.appendChild(div);

    setTimeout(() => div.remove(), 4000);
}

// ---------------------------------------------------------
// ✅ Notification sound
// ---------------------------------------------------------
function playNotificationSound() {
    const audio = new Audio("/static/notify.mp3");
    audio.play().catch((err) => {
        console.warn("⚠️ [PushNoti] Audio play blocked or failed:", err);
    });
}

// ---------------------------------------------------------
// ✅ Inject CSS for popup
// ---------------------------------------------------------
const style = document.createElement("style");
style.innerHTML = `
.notif-popup {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #ff9800;
    padding: 15px;
    border-radius: 10px;
    color: black;
    font-weight: bold;
    box-shadow: 0 0 10px rgba(0,0,0,0.4);
    z-index: 9999;
    animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(style);