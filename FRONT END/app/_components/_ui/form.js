import { add } from 'lodash';
import React from 'react';
import { useState, useEffect, useRef } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { appConstants } from '../../_helpers/consts.js';

const FormInput = (props) => {
    var field_1 = useRef('');
    var field_2 = useRef('');
    var field_3 = useRef('');


    const add_activity = () => {
        var response_status = 0;
        fetch(appConstants.BASE_URL.concat(appConstants.POST_ACTIVITY), {
            method: "POST",
            body: JSON.stringify({
                FIELD_1: field_1.current,
                FIELD_2: field_2.current,
                FIELD_3: field_3.current,
                FIELD_4: '',
                FIELD_5: '',
                FIELD_6: '',
                FIELD_7: '',
                FIELD_8: '',
                FIELD_9: '',
                FIELD_10: '',
            }),
            headers: {
                "Content-Type": "application/json",
                "x-access-token": localStorage.getItem("token"),
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    response_status = 200;
                    return res.json();
                }
                else {
                    response_status = 400;
                    return res.json();
                }
            })
            .then((data) => {
                if (response_status === 200) {
                    alert(data.message);
                    window.location.reload();
                    clear_form();

                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));
    }

    const clear_form = () => {
        field_1.current = '';
        field_2.current = '';
        field_3.current = '';
    }

    const render = () => {
        return (
            <div className="">

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">Field_1</span>
                    </div>
                    <input type="text" className="form-control" placeholder="Field_1" onChange={(e) => field_1.current = e.target.value} />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">Field_2</span>
                    </div>
                    <input type="text" className="form-control" placeholder="Field_2" onChange={(e) => field_2.current = e.target.value} />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">Field_3</span>
                    </div>
                    <input type="text" className="form-control" placeholder="Field_2" onChange={(e) => field_3.current = e.target.value} />
                </div>

                <div className="d-flex justify-content-between">
                    <button type="button" className="btn btn-primary mx-auto" onClick={() => add_activity()}>Add Activity</button>
                </div>


            </div>
        )
    }

    return (
        render()
    )

}

export default FormInput;