import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { saveLocationData } from "../utils/db";

function CameraCapture() {
    const webcamRef = useRef(null);
    const [image, setImage] = useState(null);
    const [saving, setSaving] = useState(false);

    const capture = async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);

        setSaving(true);
        try {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;

                // Save image and current location to DB
                await saveLocationData({ latitude, longitude, image: imageSrc });

                setSaving(false);
                alert("Photo saved with location!");
            });
        } catch (err) {
            console.error("Error capturing location", err);
            setSaving(false);
        }
    };

    return (
        <div>
            <h2>Camera</h2>

            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={320}
                height={240}
                videoConstraints={{
                    width: 1280,
                    height: 720,
                    facingMode: "environment",
                }}
            />

            <br />

            <button onClick={capture} disabled={saving}>
                {saving ? "Saving..." : "Take Photo"}
            </button>

            {image && (
                <div>
                    <p>Photo preview:</p>
                    <img src={image} alt="Captured" width={200} />
                </div>
            )}
        </div>
    );
}

export default CameraCapture;
