import React from 'react';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";

const Input = (props) => {
    const text = props.text
    const type = props.type
    var value = null
    const min = props.min || ""
    const max = props.max || ""

    switch (type) {
        case "text":
            value = props.value || ""
            break;
        case "number":
            value = props.value || 0
            break;
        case "date":
            value = props.value || null
            break;
        default:
            value = null
    }
    const render = () => {
        return (
            <div className="input-group">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">{text}</span>
                </div>
                <input type={type} min={type === "number" ? min : ""} max={type === "number" ? max : ""}
                    // value = {props.type === "text" ? value : null}
                    value={value}
                    className="form-control" aria-label="Username" aria-describedby="basic-addon1"
                    onChange={(e) => props.onChange(e.target.value)} />
            </div>
        );
    }

    return (
        render()
    )

}

export default Input;
