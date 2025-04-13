import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    const startHike = () => {
        navigate("/hike-tracker");
    };

    const prevHikes = () => {
        navigate("/previous-hikes");
    };

    return (
        <div className="home">
            <h1 className="home-heading">Welcome to the Hike Tracker App</h1>
            <div className="home-button-container">
                <button onClick={startHike} className="button button-top">
                    New Hike
                </button>
                <button onClick={prevHikes} className="button button-bottom">
                    View Previous Hikes
                </button>
            </div>
        </div>
    );
}

export default Home;
