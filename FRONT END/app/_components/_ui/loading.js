import React from 'react';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";

const Loading = (props) => {
    const type = props.type

    const render = () => {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border"><span className="sr-only">Loading...</span></div>
            </div>
        )
    }

    return (
        render()
    )

}

export default Loading;