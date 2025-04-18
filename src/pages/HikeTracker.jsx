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
import "../styles/map.css";
import { useNavigate } from "react-router-dom";
import { getDistance } from "geolib";

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
                    // Save point to route and Dexie
                    saveLocationData(hikeIdRef.current, {latitude, longitude, timestamp,});
                } else {
                    const distance = getDistance(lastCoords, {latitude, longitude,});

                    if (distance >= 10) {
                        lastCoords = { latitude, longitude };
                        setCoords({ latitude, longitude });
                        const timestamp = new Date().toISOString();
                        setRoute((prev) => [...prev, [latitude, longitude]]);
                        saveLocationData(hikeIdRef.current, {latitude, longitude, timestamp,});
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

        // const getAndSaveLocation = () => {
        //     navigator.geolocation.getCurrentPosition(async (pos) => {
        //         const { latitude, longitude } = pos.coords;
        //         const timestamp = new Date().toISOString();
        //         setCoords({ latitude, longitude });
        //         setRoute((prev) => [...prev, [latitude, longitude]]);
        //         await saveLocationData(hikeIdRef.current, {
        //             latitude,
        //             longitude,
        //             timestamp,
        //         });
        //     });
        // };

        // getAndSaveLocation(); // Run once immediately to get starting location
        // // The run every x interval to track route
        // intervalRef.current = setInterval(getAndSaveLocation, 30000); // 1000ms == 1s
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
