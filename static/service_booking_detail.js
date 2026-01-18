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
        booking.status = newStatus;

        if (!bookingsByStatus[newStatus]) {
          bookingsByStatus[newStatus] = [];
        }

        bookingsByStatus[newStatus].unshift(booking);
        refreshActiveView();
      }
    } catch (error) {
      console.error("Error fetching single booking:", error);
    }
  }

  /* ==============================
     MOVE BOOKING LOCALLY
  ============================== */
  function moveBookingToStatus(bookingId, newStatus) {
    let movedBooking = null;

    for (const status in bookingsByStatus) {
      const index = bookingsByStatus[status].findIndex(
        booking => booking.id === bookingId
      );

      if (index !== -1) {
        movedBooking = bookingsByStatus[status].splice(index, 1)[0];
        break;
      }
    }

    if (!movedBooking) {
      fetchBookingAndInsert(bookingId, newStatus);
      return;
    }

    movedBooking.status = newStatus;

    if (!bookingsByStatus[newStatus]) {
      bookingsByStatus[newStatus] = [];
    }

    bookingsByStatus[newStatus].unshift(movedBooking);
  }

  /* ==============================
     UPDATE STATUS (API)
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
        const data = await response.json();
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
      card.setAttribute("data-booking-id", booking.id);

      card.innerHTML = `
      
        <p><strong>Status:</strong> ${booking.status}</p>
        <p><strong>Customer:</strong> ${booking.customer_name || "N/A"}</p>
        <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleString()}</p>
      `;

      // PENDING → Accept + Cancel
      if (booking.status === "pending") {
        const acceptBtn = document.createElement("button");
        acceptBtn.textContent = "Accept";
        acceptBtn.onclick = () =>
          updateBookingStatus(booking.id, "accepted");

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.onclick = () =>
          updateBookingStatus(booking.id, "canceled");

        card.appendChild(acceptBtn);
        card.appendChild(cancelBtn);
      }

      // ACCEPTED → Start + Cancel
      if (booking.status === "accepted") {
        const startBtn = document.createElement("button");
        startBtn.textContent = "Start Work";
        startBtn.onclick = () =>
          updateBookingStatus(booking.id, "in_progress");

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.onclick = () =>
          updateBookingStatus(booking.id, "canceled");

        card.appendChild(startBtn);
        card.appendChild(cancelBtn);
      }

      // IN PROGRESS → Complete
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

    updatesRef.on("child_added", snapshot => {
      const data = snapshot.val();
      if (!data || !data.booking_id || !data.status) return;

      console.log("Firebase update:", data);
      moveBookingToStatus(data.booking_id, data.status);
      refreshActiveView();
    });

    updatesRef.on("child_changed", snapshot => {
      const data = snapshot.val();
      if (!data || !data.booking_id || !data.status) return;

      console.log("Firebase change:", data);
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
    initFirebaseListener();
  });
});