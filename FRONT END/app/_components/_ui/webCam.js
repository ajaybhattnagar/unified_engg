import React, { useRef } from 'react';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';

const WebCam = (props) => {
    const type = props.type
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = React.useState(null);

    const capture = React.useCallback(() => {
        console.log(webcamRef);
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef, setImgSrc]);

    const render = () => {
        return (
            <div>
                <Camera
                    onTakePhoto={(dataUri) => { handleTakePhoto(dataUri); }}
                />
            </div>
        )
    }

    return (
        render()
    )

}

export default WebCam;