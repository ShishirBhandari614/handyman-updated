import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://handyman-fc64d-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
// Global function
window.addProviderCard = function (provider) {
    const container = document.getElementById("providers-container");

    let card = document.getElementById(`provider-${provider.id}`);
    if (card) card.remove();

    card = document.createElement("div");
    card.className = "provider-card";
    card.id = `provider-${provider.id}`;

    card.dataset.online = provider.is_online;
    card.dataset.rating = provider.average_rating;
    card.dataset.distance = provider.distance;

    card.innerHTML = `
        <img src="${provider.photo_url || '/static/default.jpg'}">
        <h4>${provider.name}</h4>

        <p>Work Type: ${provider.work_type}</p>
        <p>Service Type: ${provider.service_type}</p>
        <p class="distance">Distance: ${provider.distance} km</p>
        <p>Rating: ${provider.average_rating}</p>

        <p class="status ${provider.is_online ? 'online' : 'offline'}">
            ${provider.is_online ? 'Online' : 'Offline'}
        </p>

        <p>Phone: ${provider.phone}</p>
        <button class="book-btn" onclick="bookNow(${provider.id}, '${provider.service_type}')">
            Book Now
        </button>

    `;

    container.appendChild(card);
};
// ✅ Book Now handler
window.bookNow = async function(providerId, serviceType) {
    const token = localStorage.getItem("token");

    // ✅ Use the provider's actual service_type
    const res = await fetch(
        `/search-service/?provider_id=${providerId}&service_type=${encodeURIComponent(serviceType)}`,
        {
            headers: { "Authorization": `Token ${token}` }
        }
    );

    const data = await res.json();
    const provider = data.providers?.[0];

    if (!provider) {
        alert("Provider not available");
        return;
    }

    // ✅ Now provider.is_online is correct
    const isOnline = provider.is_online;

    if (isOnline) {
        sendFirebaseNotification(providerId, serviceType);   // ✅ correct
    } else {
        sendSMS(providerId, serviceType);
    }
};

async function sendSMS(providerId, serviceType) {
    console.log("📱 Sending SMS to provider:", providerId);

    const token = localStorage.getItem("token");

    // 1. Save booking in Django with actual service type
    const bookingRes = await fetch("/create-booking/", {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            service_provider: providerId,
            service_type: serviceType,   // ✅ actual service type
            is_online: false             // ✅ mark availability offline
        })
    });

    if (!bookingRes.ok) {
        const err = await bookingRes.json();
        console.error("❌ Booking failed:", err);
        alert("Booking could not be saved. Please try again.");
        return;
    }

    const bookingData = await bookingRes.json();
    console.log("✅ Booking saved in Django:", bookingData);

    // 2. Send SMS via backend endpoint
    try {
        const smsRes = await fetch("/send-sms/", {
            method: "POST",
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                provider_id: providerId,
                booking_id: bookingData.id,
                message: `${bookingData.customer_name} has requested a booking for ${bookingData.service_type} (provider offline)`
            })
        });

        if (!smsRes.ok) {
            const err = await smsRes.json();
            console.error("❌ SMS failed:", err);
            alert("Booking saved but SMS failed.");
            return;
        }

        console.log("✅ SMS sent successfully");
        alert("Booking request sent via SMS (provider offline)");
    } catch (err) {
        console.error("❌ SMS request failed:", err);
        alert("Booking saved but SMS request failed.");
    }
}

async function sendFirebaseNotification(providerId, serviceType) {
    console.log("🔥 Sending Firebase notification to provider:", providerId);

    const customerName = localStorage.getItem("username") || "Customer";
    const token = localStorage.getItem("token");

    // ✅ 1. Save booking to Django database
    const bookingRes = await fetch("/create-booking/", {
        method: "POST",
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            service_provider: providerId,
            service_type: serviceType,
            is_online: true
        })
    });
    if (bookingRes.ok){
        alert("bookink success")
    }
    
    else  {
        const err = await bookingRes.json();
        console.error("❌ Booking failed:", err);
        alert("Booking could not be saved. Please try again.");
        return;
    }

    const bookingData = await bookingRes.json();
    console.log("✅ Booking saved in Django:", bookingData);

    // ✅ 2. Send real-time notification to Firebase
    // const notifRef = ref(db, `notifications/${providerId}/latest`);

    // try {
    //     await set(notifRef, {
    //         // customer_name: bookingData.customer_name,             
    //         message: bookingData.customer_name + " has requested a booking",
    //         booking_id: bookingData.id,
    //         timestamp: Date.now()
    //     });
    //     alert("Booking request sent (provider online)");
    // } catch (err) {
    //     console.error("❌ Firebase write failed:", err);
    //     alert("Booking saved but notification failed.");
    // }

}




// Initial load
document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("providers-container");
    const title = document.getElementById("title");

    const serviceType = new URLSearchParams(location.search).get("service_type");
    title.textContent = `Service Providers: ${serviceType}`;

    const token = localStorage.getItem("token");

    const res = await fetch(
        `/search-service/?service_type=${encodeURIComponent(serviceType)}`,
        { headers: { Authorization: `Token ${token}` } }
    );

    const data = await res.json();

    container.innerHTML = "";
    data.providers.forEach(window.addProviderCard);
});



