import "./styles/App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HikeTracker from "./pages/HikeTracker";
import PreviousHikes from "./pages/PreviousHikes";
import ViewHike from "./pages/ViewHike";
import "leaflet/dist/leaflet.css";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hike-tracker" element={<HikeTracker />} />
            <Route path="/previous-hikes" element={<PreviousHikes />} />
            <Route path="/view-hike/:id" element={<ViewHike />} />
        </Routes>
    );
}

export default App;
