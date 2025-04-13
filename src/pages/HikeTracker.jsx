import React, { useEffect, useState, useRef } from "react";
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
    useMap,
    Popup,
} from "react-leaflet";
import L from "leaflet";
import "../styles/map.css";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

// Icon for marker
const marker = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const photoMarker = L.icon({
    iconUrl: "/camera_icon.png", // This path is relative to the public folder
    iconSize: [32, 32], // Adjust size as needed
    iconAnchor: [16, 32], // Anchor point for the icon
    popupAnchor: [0, -32], // Position of the popup relative to the icon
});

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

function HikeTracker() {
    const [coords, setCoords] = useState(null);
    const [route, setRoute] = useState([]);
    const navigate = useNavigate();
    const [photos, setPhotos] = useState([]);
    const [tracking, setTracking] = useState(false);
    const [hikeSummary, setHikeSummary] = useState(null);
    const [hikeId, setHikeId] = useState(null);
    const hikeIdRef = useRef(null); // Need to use useRef to get the id immediately to add it to locations
    const intervalRef = useRef(null);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraFacing, setCameraFacing] = useState("environment");
    const webcamRef = useRef(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setCoords({ latitude, longitude });
                setRoute((prev) => [...prev, [latitude, longitude]]);
            },
            (err) => {
                console.error("Failed to get location:", err);
            }
        );
    }, []);

    const startTracking = async () => {
        setHikeSummary(null);
        const newHikeId = await createNewHike(); // Get hike id from createNewHike method
        setHikeId(newHikeId);
        hikeIdRef.current = newHikeId; // Need to use useRef to get the id immediately to add it to locations
        setTracking(true);

        const getAndSaveLocation = () => {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                const timestamp = new Date().toISOString();
                setCoords({ latitude, longitude });
                setRoute((prev) => [...prev, [latitude, longitude]]);
                await saveLocationData(hikeIdRef.current, {
                    latitude,
                    longitude,
                    timestamp,
                });
            });
        };

        getAndSaveLocation(); // Run once immediately to get starting location
        // The run every x interval to track route
        intervalRef.current = setInterval(getAndSaveLocation, 15000); // 1000ms == 1s
    };

    const stopTracking = async () => {
        clearInterval(intervalRef.current);
        if (hikeIdRef.current) {
            await endHike(hikeIdRef.current); // endHike calculates duration and distance

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
        navigate("/");
    };

    const capturePhoto = async () => {
        const imageSrc = webcamRef.current.getScreenshot();

        if (coords && hikeIdRef.current) {
            await savePhoto({
                hikeId: hikeIdRef.current,
                latitude: coords.latitude,
                longitude: coords.longitude,
                imageData: imageSrc,
            });
        }

        setShowCamera(false); // Hide camera after taking photo
    };

    const switchCamera = async () => {
        if (cameraFacing == "environment") {
            setCameraFacing("user");
        } else setCameraFacing("environment");
    };

    const loadPhotosForHike = async () => {
        if (hikeId) {
            const photosForHike = await getPhotosForHike(hikeId); // Fetch photos from DB
            setPhotos(photosForHike);
        }
    };

    // Call loadPhotosForHike when the hike starts
    useEffect(() => {
        loadPhotosForHike();
    }, [coords]);

    return (
        <>
            {hikeSummary && (
                <div className="hike-summary">
                    <h3 className="summary-heading">Hike Summary</h3>
                    <p className="summary-text">
                        <strong>Duration:</strong> {hikeSummary.duration}
                    </p>
                    <p className="summary-text">
                        <strong>Distance:</strong>{" "}
                        {(hikeSummary.distance / 1000).toFixed(2)} km
                    </p>
                    <button onClick={back} className="button summary-button">
                        Finish Hike
                    </button>
                    {/* <p>Points collected: {locations.length}</p> */}
                </div>
            )}

            <div className="hike-tracker">
                <div className="map-container">
                    {coords && (
                        <MapContainer
                            center={[coords.latitude, coords.longitude]}
                            zoom={15}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            {/* Map follows user location */}
                            <MapUpdater coords={coords} />

                            {route.map(([lat, lng], i) => (
                                <Marker
                                    key={i}
                                    position={[lat, lng]}
                                    icon={marker}
                                />
                            ))}

                            {photos.map((photo, index) => (
                                <Marker
                                    key={index}
                                    position={[photo.latitude, photo.longitude]}
                                    icon={photoMarker}
                                    zIndexOffset={1000}
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

                            <Polyline positions={route} color="blue" />
                        </MapContainer>
                    )}
                </div>

                {showCamera ? (
                    <div className="camera-container">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                facingMode: { cameraFacing },
                            }}
                            style={{
                                width: "100%",
                                objectFit: "cover",
                                flexGrow: "1",
                            }}
                        />
                    </div>
                ) : (
                    <></>
                )}
            </div>

            <div className="button-container">
                {tracking && (
                    <>
                        {!showCamera ? (
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
                        ) : (
                            <>
                                <div className="camera-buttons">
                                    <button
                                        onClick={() => setShowCamera(false)}
                                        className="camera-button camera-back"
                                        style={{
                                            backgroundImage:
                                                "url(/back_arrow.png)",
                                        }}
                                    ></button>
                                    <button
                                        onClick={capturePhoto}
                                        className="camera-button camera-capture"
                                    ></button>
                                    <button
                                        onClick={switchCamera}
                                        className="camera-button camera-switch"
                                        style={{
                                            backgroundImage:
                                                "url(/camera_switch.png)",
                                        }}
                                    ></button>
                                </div>
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
