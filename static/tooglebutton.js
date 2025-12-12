import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, update, onDisconnect } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { firebaseConfig } from "./firebase_config.js";

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Provider ID from Django template
console.log("Provider ID:", providerId);

const providerRef = ref(db, `service_providers/${providerId}`);

// ✅ Auto offline on disconnect
onDisconnect(providerRef).update({ is_online: false });
console.log("✅ onDisconnect registered");

// ✅ DOM logic
document.addEventListener("DOMContentLoaded", () => {

    const statusToggle = document.getElementById('status-toggle');
    const statusOnline = document.getElementById('status-online');
    const statusOffline = document.getElementById('status-offline');

    // ✅ Force offline on page load
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

        // ✅ Update Firebase only
        update(providerRef, { is_online: isOnline });
        console.log("✅ Firebase updated:", isOnline);
    });
});