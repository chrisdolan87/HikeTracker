import React from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";

// Location marker
const defaultMarker = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Photo marker
const photoMarker = L.icon({
    iconUrl: "/camera_icon.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// Function called to move the map as the coords change
const MapUpdater = ({ coords }) => {
    const map = useMap();
    React.useEffect(() => {
        if (coords) {
            map.flyTo([coords.latitude, coords.longitude], 15, {
                animate: true,
                duration: 1.5,
            });
        }
    }, [coords]);
    return null;
};

const Map = ({ coords, route, photos }) => {
    return (
        <MapContainer
            className="map-container"
            center={[coords.latitude, coords.longitude]}
            zoom={15}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <MapUpdater coords={coords} />

            {/* For each location on this route, add a location marker */}
            {route.map(([lat, lng], i) => (
                <Marker key={i} position={[lat, lng]} icon={defaultMarker} />
            ))}

            {/* For each photo on this route, add a photo marker to the map */}
            {photos.map((photo, index) => (
                <Marker
                    key={index}
                    position={[photo.latitude, photo.longitude]}
                    icon={photoMarker}
                    zIndexOffset={1000}
                >
                    {/* When user clicks on the photo marker, the photo is shown in a popup */}
                    <Popup>
                        <img className="photo"
                            src={photo.imageData}
                            alt={`Photo taken at ${photo.timestamp}`}
                        />
                    </Popup>
                </Marker>
            ))}

            {/* Line that follows the route */}
            <Polyline positions={route} color="blue" />
        </MapContainer>
    );
};

export default Map;
