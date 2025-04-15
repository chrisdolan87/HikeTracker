import React, { useEffect, useState } from "react";
import { getAllHikes } from "../utils/db";
import { useNavigate } from "react-router-dom";

function PreviousHikes() {
    const [hikes, setHikes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHikes = async () => {
            const allHikes = await getAllHikes();
            setHikes(
                allHikes.sort(
                    (a, b) => new Date(b.startTime) - new Date(a.startTime)
                )
            );
        };
        fetchHikes();
    }, []);

    const viewHike = (id) => {
        navigate(`/view-hike/${id}`);
    };

    const back = async () => {
        navigate("/");
    };

    return (
        <div className="prev-hikes">
            <h2>Previous Hikes</h2>

            {hikes.length === 0 ? (
                <p>No hikes recorded yet</p>
            ) : (
                <ul className="hikes-list">
                    {hikes.map((hike) => (
                        <li
                            key={hike.id}
                            onClick={() => viewHike(hike.id)}
                            className="hike-card"
                        >
                            <p>
                                <strong>
                                    {new Date(
                                        hike.startTime
                                    ).toLocaleDateString()}
                                </strong>
                            </p>
                            <p>Duration: {hike.duration || "N/A"}</p>
                            <p>
                                Distance: {(hike.distance / 1000).toFixed(2)} km
                            </p>
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={back} className="button button-bottom">
                Back
            </button>
        </div>
    );
}

export default PreviousHikes;
