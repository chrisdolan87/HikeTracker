import React, { useEffect, useState, useRef, useCallback } from "react";
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
const routeMarker = L.icon({
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
    useEffect(() => {
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
    const [heading, setHeading] = useState(null);

    // useEffect to change compass direction
    useEffect(() => {
        const handleOrientation = (event) => {
            const alpha = event.alpha;
            if (alpha !== null) {
                setHeading(alpha);
            }
        };

        if (window.DeviceOrientationEvent) {
            window.addEventListener(
                "deviceorientationabsolute",
                handleOrientation,
                true
            );

            return () => {
                window.removeEventListener(
                    "deviceorientationabsolute",
                    handleOrientation
                );
            };
        }
    }, []);

    return (
        <MapContainer
            className="map-container"
            center={[coords.latitude, coords.longitude]}
            zoom={15}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            <MapUpdater coords={coords} />

            {/* For each location on this route, add a marker */}
            {/* {route.map(([lat, lng], i) => (
                <Marker key={i} position={[lat, lng]} icon={routeMarker} />
            ))} */}

            {/* Add a marker at the start and end of the route */}
            {route.length > 0 && (
                <>
                    {/* Start marker */}
                    <Marker position={route[0]} icon={routeMarker}></Marker>

                    {/* End marker */}
                    {route.length > 1 && (
                        <Marker
                            position={route[route.length - 1]}
                            icon={routeMarker}
                        ></Marker>
                    )}
                </>
            )}

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
                        <img
                            className="photo"
                            src={photo.imageData}
                            alt={`Photo taken at ${photo.timestamp}`}
                        />
                    </Popup>
                </Marker>
            ))}

            {/* Line that follows the route */}
            <Polyline positions={route} color="blue" />

            {heading !== null && (
                <div className="compass-overlay">
                    <img
                        className="arrow"
                        src="/arrow.png"
                        alt="Arrow"
                        style={{ transform: `rotate(${heading}deg)`, transition: "transform 0.2s ease-out", }}
                    />
                </div>
            )}
        </MapContainer>
    );
};

export default Map;
