import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getLocationsForHike,
    getPhotosForHike,
    getAllHikes,
    deleteHike,
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

const routeMarker = L.icon({
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
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            const locations = await getLocationsForHike(Number(id));
            const hikePhotos = await getPhotosForHike(Number(id));
            const allHikes = await getAllHikes();
            const hikeData = allHikes.find((h) => h.id === Number(id));

            console.log("Hike ID from route:", id);
            console.log("Fetched locations:", locations);
            console.log("Fetched photos:", hikePhotos);
            console.log("Fetched hike summary:", hikeData);

            setRoute(locations.map((loc) => [loc.latitude, loc.longitude]));
            setPhotos(hikePhotos);
            setSummary(hikeData);
        };
        loadData();
    }, [id]);

    const back = () => navigate("/previous-hikes");

    const handleDelete = async () => {
        setConfirmDelete(false);
        await deleteHike(Number(id));
        navigate("/previous-hikes");
    };

    return (
        <>
            <h2>Hike Details</h2>

            <div className="view-hike-page">
                <div className="view-hike-map-container">
                    {route.length > 0 && (
                        <MapContainer center={route[0]} zoom={15}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            {/* {route.map(([lat, lng], i) => (
                                <Marker
                                    key={i}
                                    position={[lat, lng]}
                                    icon={routeMarker}
                                />
                            ))} */}

                            {/* Add a marker at the start and end of the route */}
                            {route.length > 0 && (
                                <>
                                    {/* Start marker */}
                                    <Marker
                                        position={route[0]}
                                        icon={routeMarker}
                                    ></Marker>

                                    {/* End marker */}
                                    {route.length > 1 && (
                                        <Marker
                                            position={route[route.length - 1]}
                                            icon={routeMarker}
                                        ></Marker>
                                    )}
                                </>
                            )}

                            <Polyline positions={route} color="blue" />

                            {photos.map((photo, i) => (
                                <Marker
                                    key={`photo-${i}`}
                                    position={[photo.latitude, photo.longitude]}
                                    icon={photoMarker}
                                >
                                    <Popup>
                                        <img
                                            className="photo"
                                            src={photo.imageData}
                                            alt={`Photo taken at ${photo.timestamp}`}
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

                <div className="view-hike-button-container">
                    <button onClick={back} className="button button-top">
                        Back
                    </button>

                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="button button-bottom button-delete"
                    >
                        Delete Hike
                    </button>
                </div>

                {confirmDelete && (
                    <div className="confirm-overlay">
                        <div className="confirm-box">
                            <p>Are you sure you want to delete this hike?</p>
                            <button
                                onClick={handleDelete}
                                className="confirm-delete-button button-delete"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="confirm-delete-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default ViewHike;
