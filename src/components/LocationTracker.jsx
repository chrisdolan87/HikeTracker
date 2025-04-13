// import React, { useEffect, useState } from "react";
// import { saveLocationData } from "../utils/db";

// function LocationTracker() {
//     const [location, setLocation] = useState(null);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         if (tracking) {
//             const locationInterval = setInterval(() => {
//                 navigator.geolocation.getCurrentPosition(
//                     (position) => {
//                         const { latitude, longitude } = position.coords;
//                         setLocation({ latitude, longitude });
//                         console.log(
//                             `Location: Latitude: ${latitude}, Longitude: ${longitude}`
//                         );

//                         // Save the location to IndexedDB
//                         saveLocationData({
//                             latitude,
//                             longitude,
//                         });
//                     },
//                     (error) => {
//                         console.error("Error fetching location:", error);
//                     },
//                     { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//                 );
//             }, 120000); // 120,000 ms = 2 minutes

//             // Clean up the interval on unmount
//             return () => clearInterval(locationInterval);
//         }
//     }, [tracking]); // Only run if 'tracking' is true




//     return (
//         <div>
//             <h2>Current Location</h2>
//             {location ? (
//                 <p>
//                     Lat: {location.latitude}, Lon: {location.longitude}
//                 </p>
//             ) : (
//                 <p>Getting location...</p>
//             )}
//             {error && <p>Error: {error}</p>}
//         </div>
//     );
// }

// export default LocationTracker;
