import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getLocationsForHike,
    getPhotosForHike,
    getAllHikes,
} from "../utils/db";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
} from "react-leaflet";
import L from "leaflet";
import "../styles/map.css";

const marker = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const photoMarker = L.icon({
    iconUrl: "/camera_icon.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

function ViewHike() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [route, setRoute] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const locations = await getLocationsForHike(Number(id));
            const hikePhotos = await getPhotosForHike(Number(id));
            const allHikes = await getAllHikes();
            const hikeData = allHikes.find((h) => h.id === Number(id));

            setRoute(locations.map((loc) => [loc.latitude, loc.longitude]));
            setPhotos(hikePhotos);
            setSummary(hikeData);
        };
        loadData();
    }, [id]);

    const back = () => navigate("/previous-hikes");

    return (
        <>
            <h2>Hike Details</h2>

            <div className="view-hike-page">
                <div className="view-hike-map-container">
                    {route.length > 0 && (
                        <MapContainer
                            center={route[0]}
                            zoom={15}
                            style={{ height: "400px", width: "100%" }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            {route.map(([lat, lng], i) => (
                                <Marker
                                    key={i}
                                    position={[lat, lng]}
                                    icon={marker}
                                />
                            ))}

                            <Polyline positions={route} color="blue" />

                            {photos.map((photo, i) => (
                                <Marker
                                    key={`photo-${i}`}
                                    position={[photo.latitude, photo.longitude]}
                                    icon={photoMarker}
                                >
                                    <Popup>
                                        <img
                                            src={photo.imageData}
                                            alt={`Photo taken at ${photo.timestamp}`}
                                            width="300"
                                        />
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    )}
                </div>

                {summary && (
                    <div className="view-hike-summary">
                        <p>
                            <strong>Date:</strong>{" "}
                            {new Date(summary.startTime).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>Duration:</strong>{" "}
                            {summary.duration || "N/A"}
                        </p>
                        <p>
                            <strong>Distance:</strong>{" "}
                            {(summary.distance / 1000).toFixed(2)} km
                        </p>
                    </div>
                )}

                <button onClick={back} className="button button-bottom">
                    Back
                </button>
            </div>
        </>
    );
}

export default ViewHike;
