import React, { useEffect, useState, useRef, useCallback } from "react";
import Map from "../components/Map";
import Camera from "../components/Camera";
import {
    createNewHike,
    endHike,
    saveLocationData,
    getLocationsForHike,
    getAllHikes,
    savePhoto,
    getPhotosForHike,
} from "../utils/db";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
} from "react-leaflet";
import L from "leaflet";
import "../styles/App.css";
import { useNavigate } from "react-router-dom";
import { getDistance } from "geolib";

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

function HikeTracker() {
    const navigate = useNavigate();
    const [coords, setCoords] = useState(null);
    const [route, setRoute] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [newPhoto, setNewPhoto] = useState(false);
    const [tracking, setTracking] = useState(false);
    const [hikeSummary, setHikeSummary] = useState(null);
    const [hikeId, setHikeId] = useState(null);
    const hikeIdRef = useRef(null); // Need to use useRef to get the id immediately to add it to locations
    const [showCamera, setShowCamera] = useState(false);

    // GEOLOCATION API
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const coords = { latitude, longitude };
                setCoords(coords);
                setRoute((prev) => [...prev, [latitude, longitude]]);
            },
            (err) => {
                console.error("Failed to get location:", err);
            }
        );
    }, []);

    useEffect(() => {
        if (!tracking) return;

        let lastCoords = null;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                if (!lastCoords) {
                    lastCoords = { latitude, longitude };
                    setCoords({ latitude, longitude });
                    const timestamp = new Date().toISOString();
                    setRoute((prev) => [...prev, [latitude, longitude]]);
                    saveLocationData(hikeIdRef.current, {
                        latitude,
                        longitude,
                        timestamp,
                    });
                } else {
                    const distance = getDistance(lastCoords, {
                        latitude,
                        longitude,
                    });

                    if (distance >= 10) {
                        lastCoords = { latitude, longitude };
                        setCoords({ latitude, longitude });
                        const timestamp = new Date().toISOString();
                        setRoute((prev) => [...prev, [latitude, longitude]]);
                        saveLocationData(hikeIdRef.current, {
                            latitude,
                            longitude,
                            timestamp,
                        });
                    }
                }
            },
            (error) => {
                console.error("Error watching position:", error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [tracking]);

    const startTracking = async () => {
        setHikeSummary(null);
        const newHikeId = await createNewHike(); // Get hike id from createNewHike method
        setHikeId(newHikeId);
        hikeIdRef.current = newHikeId; // Need to use useRef to get the id immediately to add it to locations
        setTracking(true);
    };

    const stopTracking = async () => {
        if (hikeIdRef.current) {
            await endHike(hikeIdRef.current); // endHike is in db file and calculates duration and distance

            const allHikes = await getAllHikes();
            const thisHike = allHikes.find((h) => h.id === hikeIdRef.current);
            setHikeSummary(thisHike);

            // When the hike is over, clear the hike id
            hikeIdRef.current = null;
            setHikeId(null);
        }
        setTracking(false);
    };

    const back = async () => {
        stopTracking(); // Stop tracking to force app to get new coords when user returns to this page
        navigate("/");
    };

    const loadPhotosForHike = async () => {
        if (hikeId) {
            setPhotos(await getPhotosForHike(hikeId));
        }
    };

    // Call loadPhotosForHike whenever the newPhoto is set to true
    useEffect(() => {
        loadPhotosForHike();
        setNewPhoto(false);
    }, [newPhoto]);

    return (
        <>
            {hikeSummary && (
                <div className="hike-summary">
                    <h3 className="summary-heading">Hike Summary</h3>
                    <div className="view-hike-map-container">
                        {route.length > 0 && (
                            <MapContainer center={route[0]} zoom={15}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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
                                                position={
                                                    route[route.length - 1]
                                                }
                                                icon={routeMarker}
                                            ></Marker>
                                        )}
                                    </>
                                )}

                                <Polyline positions={route} color="blue" />

                                {photos.map((photo, i) => (
                                    <Marker
                                        key={`photo-${i}`}
                                        position={[
                                            photo.latitude,
                                            photo.longitude,
                                        ]}
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

                    <div className="view-hike-summary">
                        <p>
                            <strong>Duration:</strong>{" "}
                            {hikeSummary.duration || "N/A"}
                        </p>
                        <p>
                            <strong>Distance:</strong>{" "}
                            {(hikeSummary.distance / 1000).toFixed(2)} km
                        </p>
                    </div>
                    
                    <button onClick={back} className="button summary-button">
                        Finish Hike
                    </button>
                </div>
            )}

            <div className="hike-tracker">
                {coords && (
                    <Map coords={coords} route={route} photos={photos} />
                )}

                {showCamera && (
                    <Camera
                        onCapture={async (imageSrc) => {
                            if (coords && hikeIdRef.current) {
                                await savePhoto({
                                    hikeId: hikeIdRef.current,
                                    latitude: coords.latitude,
                                    longitude: coords.longitude,
                                    imageData: imageSrc,
                                });
                                setNewPhoto(true); // Set newPhoto to true to trigger useEffect to load photos on route
                            }
                        }}
                        onClose={() => setShowCamera(false)}
                    />
                )}
            </div>

            <div className="button-container">
                {tracking && (
                    <>
                        {!showCamera && (
                            <>
                                <button
                                    onClick={() => setShowCamera(true)}
                                    className="button button-top"
                                >
                                    Take Photo
                                </button>
                                <button
                                    onClick={stopTracking}
                                    className="button button-bottom"
                                >
                                    Stop Hike
                                </button>
                            </>
                        )}
                    </>
                )}

                {!tracking && (
                    <>
                        {!hikeSummary && (
                            <>
                                <button
                                    onClick={startTracking}
                                    className="button button-top"
                                >
                                    Start Hike
                                </button>
                                <button
                                    onClick={back}
                                    className="button button-bottom"
                                >
                                    Back
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default HikeTracker;
