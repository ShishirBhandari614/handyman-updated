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

// Get recipientId from window object (set by template) or data attribute
let recipientId = null;
if (typeof window !== "undefined") {
    // Try to get from window.recipientId (set by template)
    if (window.recipientId) {
        recipientId = String(window.recipientId);
    }
    // Try to get from data attribute on body or a hidden input
    else if (document.body) {
        const dataRecipientId = document.body.getAttribute('data-recipient-id') || 
                               document.querySelector('[data-recipient-id]')?.getAttribute('data-recipient-id');
        if (dataRecipientId) {
            recipientId = String(dataRecipientId);
        }
    }
}

// If still no recipientId, log error and exit
if (!recipientId) {
    console.error("❌ [PushNoti] recipientId not found. Please set window.recipientId or data-recipient-id attribute.");
    console.log("💡 [PushNoti] Available window properties:", Object.keys(window).filter(k => k.toLowerCase().includes('id')));
} else {
    console.log("✅ [PushNoti] Listening for notifications for user ID:", recipientId);
    const notifPath = `notifications/${recipientId}/latest`;
    const notifRef = ref(db, notifPath);

    // ---------------------------------------------------------
    // ✅ Track last bookingId and skip first snapshot
    // ---------------------------------------------------------
    let lastBookingId = null;
    let lastTimestamp = null;
    let firstSnapshot = true;

    onValue(notifRef, (snapshot) => {
        if (!snapshot.exists()) {
            console.log("ℹ️ [PushNoti] No notification data found");
            return;
        }

        const notif = snapshot.val();
        console.log("📬 [PushNoti] Received notification:", notif);

        // Skip the very first snapshot (page refresh)
        if (firstSnapshot) {
            firstSnapshot = false;
            lastBookingId = notif.booking_id || null;
            lastTimestamp = notif.timestamp || null;
            console.log("ℹ️ [PushNoti] Initial snapshot ignored:", notif);
            return;
        }

        // Check if this is a new notification by comparing booking_id and timestamp
        const isNewBooking = notif.booking_id && notif.booking_id !== lastBookingId;
        const isNewTimestamp = notif.timestamp && notif.timestamp !== lastTimestamp;

        if (isNewBooking || isNewTimestamp) {
            lastBookingId = notif.booking_id || lastBookingId;
            lastTimestamp = notif.timestamp || lastTimestamp;
            
            // Show popup notification
            const message = notif.message || "You have a new notification";
            showNotificationPopup(message);
            playNotificationSound();
            
            console.log("🔔 [PushNoti] New notification displayed:", message);
        } else {
            console.log("ℹ️ [PushNoti] Duplicate notification ignored:", notif);
        }
    });
}

// ---------------------------------------------------------
// ✅ Popup UI
// ---------------------------------------------------------
function showNotificationPopup(message) {
    // Remove any existing popups first
    const existingPopups = document.querySelectorAll('.notif-popup');
    existingPopups.forEach(popup => popup.remove());

    const div = document.createElement("div");
    div.className = "notif-popup";
    div.innerHTML = `
        <div class="notif-content">
            <strong>🔔 ${message}</strong>
        </div>
    `;
    
    // Add click to dismiss
    div.addEventListener('click', () => {
        div.remove();
    });
    
    document.body.appendChild(div);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (div.parentNode) {
            div.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => div.remove(), 300);
        }
    }, 5000);
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
// ✅ Inject CSS for popup (wait for DOM to be ready)
// ---------------------------------------------------------
function injectNotificationStyles() {
    // Check if styles already injected
    if (document.getElementById('notif-popup-styles')) {
        return;
    }

    const style = document.createElement("style");
    style.id = 'notif-popup-styles';
    style.innerHTML = `
.notif-popup {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ff9800 0%, #ff6f00 100%);
    padding: 18px 24px;
    border-radius: 12px;
    color: #000;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 99999;
    animation: fadeIn 0.3s ease-out;
    cursor: pointer;
    max-width: 350px;
    word-wrap: break-word;
    transition: transform 0.2s, box-shadow 0.2s;
}

.notif-popup:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(0,0,0,0.4);
}

.notif-content {
    display: flex;
    align-items: center;
    gap: 8px;
}

@keyframes fadeIn {
    from { 
        opacity: 0; 
        transform: translateY(20px) scale(0.95); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
    }
}

@keyframes fadeOut {
    from { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
    }
    to { 
        opacity: 0; 
        transform: translateY(20px) scale(0.95); 
    }
}
`;
    
    if (document.head) {
        document.head.appendChild(style);
    } else {
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            document.head.appendChild(style);
        });
    }
}

// Inject styles when script loads
injectNotificationStyles();