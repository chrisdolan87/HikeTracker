import React, { useEffect, useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
};

export default function CameraRef() {
    const webcamRef = useRef(null);
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        console.log(imageSrc);
    }, [webcamRef]);

    return (
        <>
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                style={{
                    width: "100%",
                    objectFit: "cover",
                    flexGrow: "1",
                }}
            />
        </>
    );
}
