import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    const startHike = () => {
        navigate("/hike");
    };

    const prevHikes = () => {
        navigate("/prevHikes");
    };

    return (
        <div className="home">
            <h1>Welcome to the Hike Tracker App</h1>
            <div className="home-buttons">
                <button onClick={startHike} className="button">
                    New Hike
                </button>
                <button onClick={prevHikes} className="button">
                    Previous Hikes
                </button>
            </div>
        </div>
    );
}

export default Home;
