import React, { useRef } from 'react';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import ImagePreview from '../../_helpers/imagePreview';

const WebCam = (props) => {
    const type = props.type
    const webcamRef = useRef(null);
    const [dataUri, setDataUri] = useState('');
    const isFullscreen = false;

    const handleTakePhotoAnimationDone = (dataUri) => {
        // Do stuff with the photo...
        setDataUri(dataUri)
        // Remove data:image/png;base64, from dataUri
        const base_64 = dataUri.split(',')[1];
        // console.log(dataUri);
        props.onClick(base_64)
    }

    const render = () => {
        return (
            <div>
                {
                    (dataUri)
                        ? <ImagePreview dataUri={dataUri}
                            isFullscreen={isFullscreen}
                        />
                        : <Camera onTakePhotoAnimationDone={handleTakePhotoAnimationDone}
                            isFullscreen={isFullscreen}
                        />
                }
            </div>
        )
    }

    return (
        render()
    )

}

export default WebCam;