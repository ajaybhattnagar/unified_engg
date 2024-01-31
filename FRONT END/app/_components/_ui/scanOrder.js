import React from 'react';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { utils } from '../../_helpers/utils';
import './styles.css';
import Barcode from '../../_images/barcode.svg'

const Scan = (props) => {
    const type = props.type
    var value = props.value || ""
    const disabled = props.disabled || false
    const [focus, setFocus] = useState(props.focus || false)

    // Eg: *WO022721$0$20*
    // Eg: *WO022721$1$20*

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
                    onChange={(e) => props.onChange(e.target.value)}
                    disabled={disabled}
                    autoFocus={focus}
                />

            </div>
        );
    }

    return (
        render()
    )

}

export default Scan;
