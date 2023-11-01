import React from 'react';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { utils } from '../../_helpers/utils';

const Input = (props) => {
    const text = props.text
    const type = props.type
    var value = null
    const min = props.min || ""
    const max = props.max || ""
    const clearbutton = props.clearbutton || false
    const disabled = props.disabled || false

    switch (type) {
        case "text":
            value = props.value || ""
            break;
        case "number":
            value = props.value || 0
            break;
        case "date":
            value = props.value || utils.convertTimeStampToDateForInputBox(new Date())
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
                    onChange={(e) => props.onChange(e.target.value)}
                    disabled={disabled}
                />
                {
                    clearbutton ?
                        <button className="ml-1 btn btn-outline-secondary border" type="button" onClick={() => props.onClear()}>
                            <i className="fa fa-times">X</i>
                        </button>
                        : null
                }

            </div>
        );
    }

    return (
        render()
    )

}

export default Input;
