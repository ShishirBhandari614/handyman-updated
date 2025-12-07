// Initialize OpenLayers map
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([customerLocation.longitude, customerLocation.latitude]),
        zoom: 10
    })
});

// Create vector layer for markers
var vectorSource = new ol.source.Vector();
var markerLayer = new ol.layer.Vector({ source: vectorSource });
map.addLayer(markerLayer);

// Store service provider markers for dynamic updates
var providerMarkers = {};

// Function to add or update markers
function updateProviderMarker(providerData) {
    let providerId = providerData.id;

    if (providerMarkers[providerId]) {
        if (providerData.is_online) {
            // Update existing marker position for online providers
            providerMarkers[providerId].setGeometry(new ol.geom.Point(
                ol.proj.fromLonLat([providerData.longitude, providerData.latitude])
            ));
        }
    } else {
        // Create a new marker if it doesn't exist
        let marker = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([providerData.longitude, providerData.latitude])),
            name: providerData.name
        });

        // Style the marker based on online/offline status
        marker.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                scale: 0.8,
                src: providerData.is_online
                    ? 'https://cdn-icons-png.flaticon.com/32/149/149059.png' // Green for online
                    : 'https://cdn-icons-png.flaticon.com/32/149/149060.png' // Gray for offline
            }),
            text: new ol.style.Text({
                text: providerData.name,
                offsetY: -25,
                font: '12px Arial',
                fill: new ol.style.Fill({ color: providerData.is_online ? 'black' : 'gray' }),
                stroke: new ol.style.Stroke({ color: 'white', width: 2 })
            })
        }));

        vectorSource.addFeature(marker);
        providerMarkers[providerId] = marker;
    }
}

// Function to add customer marker
function addCustomerMarker() {
    let customerMarker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([customerLocation.longitude, customerLocation.latitude])),
        name: "You"
    });

    customerMarker.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            scale: 0.8,
            src: 'https://cdn-icons-png.flaticon.com/32/149/149060.png'
        }),
        text: new ol.style.Text({
            text: "You",
            offsetY: -25,
            font: '12px Arial',
            fill: new ol.style.Fill({ color: 'blue' }),
            stroke: new ol.style.Stroke({ color: 'white', width: 2 })
        })
    }));

    vectorSource.addFeature(customerMarker);
}

// Function to listen for Firebase changes and update map
function listenForFirebaseUpdates() {
    const serviceProviderRef = ref(database, 'search-service/');
    onValue(serviceProviderRef, (snapshot) => {
        const data = snapshot.val();

        for (const providerId in data) {
            const providerData = data[providerId];

            if (providerData && providerId) {
                updateProviderMarker({
                    id: providerId,
                    is_online: providerData.is_online,
                    name: providerData.name,
                    longitude: providerData.longitude,
                    latitude: providerData.latitude
                });
            }
        }
    });
}

// Initialize map with customer marker and Firebase listener
document.addEventListener('DOMContentLoaded', () => {
    addCustomerMarker();
    listenForFirebaseUpdates();
});
