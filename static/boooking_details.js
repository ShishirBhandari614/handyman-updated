document.addEventListener("DOMContentLoaded", () => {
  const bookingsContainer = document.getElementById("bookings-container");
  const buttons = document.querySelectorAll("#status-buttons button");

  let bookingsByStatus = {};
  const token = localStorage.getItem("token");
  console.log("Auth Token:", token);

  // Fetch bookings from API
  async function fetchBookings() {
    try {
      const response = await fetch("/user-bookings-by-status/", {
        headers: {
          "Authorization": `Token ${token}`,
          "Content-Type": "application/json"

          // Add Authorization header if needed
        }
      });
      bookingsByStatus = await response.json();
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }

  // Render bookings for a given status
  function renderBookings(status) {
    bookingsContainer.innerHTML = "";
    const bookings = bookingsByStatus[status] || [];

    if (bookings.length === 0) {
      bookingsContainer.innerHTML = `<p class="no-bookings">No ${status} bookings found.</p>`;
      return;
    }

    bookings.forEach(booking => {
      const card = document.createElement("div");
      card.classList.add("booking-card");
      card.innerHTML = `
        <h3>${booking.service_type}</h3>
        <p><strong>Status:</strong> ${booking.status}</p>
        
        <p><strong>Provider:</strong> ${booking.provider_name}</p>
        <p><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleString()}</p>
      `;
      bookingsContainer.appendChild(card);
    });
  }

  // Attach event listeners
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const status = button.getAttribute("data-status");
      renderBookings(status);

      // Highlight active button
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });

  // Initialize
  fetchBookings().then(() => {
    renderBookings("pending"); // default view
    document.querySelector('[data-status="pending"]').classList.add("active");
  });
});