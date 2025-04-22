import React, { useEffect, useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";

export default function Camera({ onCapture, onClose }) {
    const webcamRef = useRef(null);
    const [cameraFacing, setCameraFacing] = useState("environment");

    const switchCamera = () => {
        setCameraFacing((prev) =>
            prev === "environment" ? "user" : "environment"
        );
    };

    const capturePhoto = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            onCapture(imageSrc);
            onClose();
        }
    }, [onCapture, onClose]);

    return (
        <div className="camera-container">
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: cameraFacing }}
                style={{
                    width: "100%",
                    objectFit: "cover",
                    flexGrow: "1",
                }}
            />

            <div className="camera-buttons">
                <button
                    onClick={onClose}
                    className="camera-button camera-back"
                    style={{ backgroundImage: "url(/back_arrow.png)" }}
                ></button>
                <button
                    onClick={capturePhoto}
                    className="camera-button camera-capture"
                ></button>
                <button
                    onClick={switchCamera}
                    className="camera-button camera-switch"
                    style={{ backgroundImage: "url(/camera_switch.png)" }}
                ></button>
            </div>
        </div>
    );
}
