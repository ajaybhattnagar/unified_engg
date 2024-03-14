import React from 'react';
import Select from 'react-select';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { appConstants } from '../../_helpers/consts.js';
import Loading from "../_ui/loading";

const IndirectLaborTicket = (props) => {
    const [list, setList] = useState(props.list);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCode, setSelectedCode] = useState(null);



    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.GET_INDIRECT_CODES);
        const request_object = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
            },
        }
        fetch(url, request_object)
            .then((res) => {
                if (res.status === 200) {
                    response_status = 200;
                    return res.json();
                }
                else {
                    response_status = 400;
                    alert(res.json());
                }
            })
            .then((data) => {
                if (response_status === 200) {
                    setIsLoading(false);
                    setList(data);
                } else {
                    alert(data.message);
                    setIsLoading(false);
                    return null;
                }
            })
            .catch((err) => console.error(err), setIsLoading(false));
    }, [])

    useEffect(() => {
        if (selectedCode) {
            create_indirect_labor_ticket();
        }
    }, [selectedCode])

    const create_indirect_labor_ticket = () => {
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.START_LABOR_TICKET);
        const request_object = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                "RUN_TYPE": "I",
                "EMP_ID": localStorage.getItem("EMPLOYEE_ID"),
                "INDIRECT_CODE": selectedCode.value,
                "INDIRECT_ID": selectedCode.label,
                "WORK_LOCATION": 'On-site',
                "WORK_TIME": "Regular Time",
            })
        }
        if (confirm('Are you sure you want to start this ticket?')) {
            fetch(url, request_object)
                .then((res) => {
                    if (res.status === 200) {
                        response_status = 200;
                        return res.json();
                    }
                    else {
                        response_status = 400;
                        alert(res.json());
                    }
                })
                .then((data) => {
                    if (response_status === 200) {
                        window.location.reload();
                    } else {
                        alert(data.message);
                        return null;
                    }
                });
        }

    }

    const render = () => {
        return (
            <div className="d-flex justify-content-between mt-3">
                <div className='w-100'>
                    {
                        isLoading ? <Loading /> :
                            list && list.length > 0 ?
                                list.map((code, index) => (
                                    <div className="m-2" key={index}>
                                        <p className="badge badge-light cusor-hand w-100 align-middle"
                                            onClick={(e) => setSelectedCode(code)} style={{ fontSize: '1.25em', fontWeight: 'bold' }}>{code.label}</p>
                                    </div>
                                ))
                                :
                                null
                    }

                </div>
            </div>
            // </div>
        );
    }

    return (
        render()
    )

}

export default IndirectLaborTicket;