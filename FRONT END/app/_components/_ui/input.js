import React from 'react';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { utils } from '../../_helpers/utils';
import './styles.css';

const Input = (props) => {
    const text = props.text
    const type = props.type
    var value = null
    const min = props.min || ""
    const max = props.max || ""
    const clearbutton = props.clearbutton || false
    const disabled = props.disabled || false
    const onUpdateButtonClick = props.onUpdateButtonClick || false
    const onUpdateButtonText = props.onUpdateButtonText || "Update"
    const isUpdateButtonDisabled = props.isUpdateButtonDisabled || false;

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

    const onChangeInputValue = (e) => {
        var sanitizedValue = e.replace(/'/g, '');
        sanitizedValue = sanitizedValue.replace(/"/g, '');
        return props.onChange(sanitizedValue)
    }

    const render = () => {
        return (
            <div className="input-group text-dark">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1">{text}</span>
                </div>
                <input type={type} min={type === "number" ? min : null} max={type === "number" ? max : null}
                    // value = {props.type === "text" ? value : null}
                    value={value}
                    className="form-control" aria-label="Username" aria-describedby="basic-addon1"
                    onChange={(e) => onChangeInputValue(e.target.value)}
                    disabled={disabled}
                // pattern={type == 'number' ? "\d*" : '[A-Za-z]{3}'}
                />
                {
                    clearbutton ?
                        <button className="ml-1 btn btn-outline-secondary border" type="button" onClick={() => props.onClear()}>
                            <i className="fa fa-times">X</i>
                        </button>
                        : null
                }
                {
                    onUpdateButtonClick ?
                        <button className="ml-1 btn btn-outline-primary border" disabled={isUpdateButtonDisabled} type="button" onClick={(e) => props.onUpdateButtonClick(value)}>
                            <i className="fa fa-times">{onUpdateButtonText}</i>
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
