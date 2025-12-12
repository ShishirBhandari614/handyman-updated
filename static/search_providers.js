// ✅ Global function so Firebase can call it
window.addProviderCard = function (provider) {
    const container = document.getElementById("providers-container");

    // Remove duplicate card if exists
    let card = document.getElementById(`provider-${provider.id}`);
    if (card) card.remove();

    card = document.createElement("div");
    card.className = "provider-card";
    card.id = `provider-${provider.id}`;

    // ✅ Sorting metadata
    card.dataset.online = provider.is_online;
    card.dataset.rating = provider.average_rating || 0;
    card.dataset.distance = provider.distance || 999;

    card.innerHTML = `
        <img src="${provider.photo_url || '/static/default.jpg'}" alt="${provider.name}">
        <h4>${provider.name}</h4>

        <p class="work-type">Work Type: ${provider.work_type || 'N/A'}</p>
        <p class="service-type">Service Type: ${provider.service_type || 'N/A'}</p>

        <p>Distance: ${provider.distance || 0} km</p>
        <p>Rating: ${provider.average_rating || 0}</p>

        <p class="status ${provider.is_online ? 'online' : 'offline'}">
            ${provider.is_online ? 'Online' : 'Offline'}
        </p>

        <p>Phone: ${provider.phone}</p>

        <p class="updated-at">Updated: ${new Date().toLocaleTimeString()}</p>

        <button class="book-btn" data-id="${provider.id}">
            Book Now
        </button>
    `;

    container.appendChild(card);
};

// ✅ Load initial providers from Django API
document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("providers-container");
    const title = document.getElementById("title");

    const params = new URLSearchParams(window.location.search);
    const serviceType = params.get("service_type");

    if (!serviceType) {
        title.textContent = "No service type provided";
        return;
    }

    title.textContent = `Service Providers: ${serviceType}`;

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`/search-service/?service_type=${encodeURIComponent(serviceType)}`, {
            method: "GET",
            headers: {
                "Authorization": `Token ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            container.innerHTML = `<p>Error loading results</p>`;
            return;
        }

        const providers = await response.json();
        console.log("Initial providers:", providers);

        if (providers.length === 0) {
            container.innerHTML = `<p>No providers found</p>`;
            return;
        }

        providers.forEach(provider => {
            window.addProviderCard(provider);
        });

    } catch (error) {
        console.error("Fetch error:", error);
        container.innerHTML = `<p>Something went wrong</p>`;
    }
});