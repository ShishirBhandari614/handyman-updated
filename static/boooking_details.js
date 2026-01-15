/* ==============================
   FIREBASE INIT
============================== */
const firebaseConfig = {
  databaseURL:
    "https://handyman-fc64d-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firebaseDB = firebase.database();

/* ==============================
   DOM READY
============================== */
document.addEventListener("DOMContentLoaded", () => {
  const bookingsContainer = document.getElementById("bookings-container");
  const buttons = document.querySelectorAll("#status-buttons button");

  let bookingsByStatus = {};
  const token = localStorage.getItem("token");
  let activeStatus = "pending";

  /* ==============================
     FETCH BOOKINGS (INITIAL LOAD)
  ============================== */
  async function fetchBookings() {
    try {
      const response = await fetch("/user-bookings-by-status/", {
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        }
      });

      bookingsByStatus = await response.json();
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }

  /* ==============================
     FETCH SINGLE BOOKING AND INSERT
  ============================== */
  async function fetchBookingAndInsert(bookingId, newStatus) {
    try {
      const response = await fetch(`/booking/${bookingId}/detail/`, {
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const booking = await response.json();
        booking.status = newStatus; // Ensure status is updated
        
        if (!bookingsByStatus[newStatus]) {
          bookingsByStatus[newStatus] = [];
        }
        
        // Add to the beginning of the array
        bookingsByStatus[newStatus].unshift(booking);
        refreshActiveView();
      }
    } catch (error) {
      console.error("Error fetching single booking:", error);
    }
  }

  /* ==============================
     MOVE BOOKING LOCALLY (NO REFRESH)
  ============================== */
  function moveBookingToStatus(bookingId, newStatus) {
    let movedBooking = null;
  
    // Find and remove from old status
    for (const status in bookingsByStatus) {
      const index = bookingsByStatus[status].findIndex(
        booking => booking.id === bookingId
      );
  
      if (index !== -1) {
        movedBooking = bookingsByStatus[status].splice(index, 1)[0];
        break;
      }
    }
  
    // If booking not found locally, fetch it from server
    if (!movedBooking) {
      fetchBookingAndInsert(bookingId, newStatus);
      return;
    }
  
    // Update status
    movedBooking.status = newStatus;
  
    // Create array if it doesn't exist
    if (!bookingsByStatus[newStatus]) {
      bookingsByStatus[newStatus] = [];
    }
  
    // Add to new status (at the beginning)
    bookingsByStatus[newStatus].unshift(movedBooking);
  }

  /* ==============================
     UPDATE STATUS (GENERIC)
  ============================== */
  async function updateBookingStatus(bookingId, newStatus) {
    try {
      const response = await fetch(
        `/booking/${bookingId}/update-status/`,
        {
          method: "POST",
          headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.ok) {
        const data = await response.json(); // { id, status }
        // Local update immediately
        moveBookingToStatus(data.id, data.status);
        refreshActiveView();
      } else {
        alert("Failed to update booking status.");
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  }

  /* ==============================
     RENDER BOOKINGS
  ============================== */
  function renderBookings(status) {
    bookingsContainer.innerHTML = "";

    const bookings = bookingsByStatus[status] || [];

    if (bookings.length === 0) {
      bookingsContainer.innerHTML =
        `<p class="no-bookings">No ${status} bookings found.</p>`;
      return;
    }

    bookings.forEach(booking => {
      const card = document.createElement("div");
      card.classList.add("booking-card");
      card.setAttribute("data-booking-id", booking.id); // Add ID for tracking

      card.innerHTML = `
        <img src="${booking.provider_photo || '/static/images/image.png'}" alt="${booking.service_type}" class="card-image">
        <h3>${booking.service_type}</h3>
        <p><strong>Status:</strong> ${booking.status}</p>
        <p><strong>Provider:</strong> ${booking.provider_name}</p>
        <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleString()}</p>
      `;

      /* ---------- ACTION BUTTONS ---------- */

      if (["pending", "accepted", "in_progress"].includes(booking.status)) {
        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.classList.add("cancel-btn");

        cancelBtn.onclick = () => {
          if (confirm("Are you sure you want to cancel this booking?")) {
            cancelBtn.disabled = true;
            cancelBtn.textContent = "Canceling...";
            updateBookingStatus(booking.id, "canceled");
          }
        };

        card.appendChild(cancelBtn);
      }

      if (booking.status === "accepted") {
        const startBtn = document.createElement("button");
        startBtn.textContent = "Start Work";
        startBtn.onclick = () =>
          updateBookingStatus(booking.id, "in_progress");
        card.appendChild(startBtn);
      }

      if (booking.status === "in_progress") {
        const completeBtn = document.createElement("button");
        completeBtn.textContent = "Complete";
        completeBtn.onclick = () =>
          updateBookingStatus(booking.id, "completed");
        card.appendChild(completeBtn);
      }

      bookingsContainer.appendChild(card);
    });
  }

  /* ==============================
     REFRESH CURRENT TAB ONLY
  ============================== */
  function refreshActiveView() {
    renderBookings(activeStatus);
  }

  /* ==============================
     STATUS BUTTON EVENTS
  ============================== */
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      activeStatus = button.dataset.status;
      renderBookings(activeStatus);
    });
  });

  /* ==============================
     FIREBASE REAL-TIME LISTENER
  ============================== */
  function initFirebaseListener() {
    const updatesRef = firebaseDB.ref("booking_updates");

    // Listen for new updates
    updatesRef.on("child_added", snapshot => {
      const data = snapshot.val();
      if (!data || !data.booking_id || !data.status) return;
      
      console.log("Firebase update received:", data);
      moveBookingToStatus(data.booking_id, data.status);
      refreshActiveView();
    });
    
    // Listen for changed updates
    updatesRef.on("child_changed", snapshot => {
      const data = snapshot.val();
      if (!data || !data.booking_id || !data.status) return;
      
      console.log("Firebase change received:", data);
      moveBookingToStatus(data.booking_id, data.status);
      refreshActiveView();
    });
  }

  /* ==============================
     INIT
  ============================== */
  fetchBookings().then(() => {
    renderBookings("pending");
    document.querySelector('[data-status="pending"]').classList.add("active");

    // Start listening to Firebase after initial fetch
    initFirebaseListener();
  });
});