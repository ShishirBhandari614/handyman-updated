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
    `;

    container.appendChild(card);
};

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
