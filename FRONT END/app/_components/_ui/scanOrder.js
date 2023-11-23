import React from 'react';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { utils } from '../../_helpers/utils';
import './styles.css';
import Barcode from '../../_images/barcode.svg'

const Scan = (props) => {
    const type = props.type
    var value = null
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

    // Eg: *WO022721$0$20*
    // Eg: *WO022721$1$20*

    const disectInputString = (e) => {
        if (e.keyCode === 13 || e.which === 13 || e.key === "Enter" || e.code === "Enter" || e.key === "NumpadEnter" || e.code === "NumpadEnter"
            || e.key === "Tab" || e.code === "Tab") {
            try {
                var input = e.target.value
                var result = input.split('$')
                var wo = result[0].replace('*', '')
                var sub_id = result[1]
                var operation_seq = result[2].replace('*', '')
                props.onChange({
                    work_order: wo,
                    sub_id: sub_id,
                    operation_seq: operation_seq
                })
            } catch (error) {
                alert("Invalid Input")
                console.log(error)
            }
        }
    }

    const render = () => {
        return (
            <div className="input-group text-dark">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon1"><img
                        alt='logo'
                        src={Barcode}
                        height='20rem'
                        className='d-inline-block align-top'
                    /></span>
                </div>
                <input type={'text'}
                    value={value}
                    className="form-control" aria-label="Username" aria-describedby="basic-addon1"
                    // onChange={(e) => props.onChange(e.target.value)}
                    onKeyDown={(e) => disectInputString(e)}
                    disabled={disabled}
                />

            </div>
        );
    }

    return (
        render()
    )

}

export default Scan;
