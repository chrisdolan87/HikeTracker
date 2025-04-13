import "./styles/App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HikeTracker from "./pages/HikeTracker";
import "leaflet/dist/leaflet.css";
import LocationTracker from "./components/LocationTracker";
import CameraCapture from "./components/CameraCapture";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hike" element={<HikeTracker />} />
        </Routes>
    );
}

export default App;
