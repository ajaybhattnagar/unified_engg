import React from 'react';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { utils } from '../../_helpers/utils';
import './Quality.css';
import Loading from "../_ui/loading";
import Scan from "../_ui/scanOrder.js";
import { appConstants } from '../../_helpers/consts.js';

const QASignOff = (props) => {
    const [scannedData, setScannedData] = useState(null);
    const acceptRejectOptions = ['Accept', 'Reject'];
    const [acceptRejectSelection, setAcceptRejectSelection] = useState(null);
    const [scanInput, setScanInput] = useState(localStorage.getItem("SIGN_OFF_SCAN_LAST_SELECTED") || 'FABRICATED');
    const [isLoading, setIsLoading] = useState(false);


    const onChangeInputValue = (e) => {
        var sanitizedValue = e.replace(/'/g, '');
        sanitizedValue = sanitizedValue.replace(/"/g, '');
        return props.onChange(sanitizedValue)
    }

    useEffect(() => {
        if (scannedData) {
            setIsLoading(true);
            var array_qa_sign_off = {
                'BASE_ID': scannedData.work_order,
                'SUB_ID': scannedData.sub_id,
                'SEQUENCE_NO': scannedData.operation_seq,
                'QA_SIGN_OFF': 1,
                'QA_ACCEPT': acceptRejectSelection === 0 ? 1 : '',
                'QA_REJECT': acceptRejectSelection === 1 ? 1 : '',
            }

            var url = appConstants.BASE_URL.concat(appConstants.GET_UPDATE_OPERATION_DETAILS).concat('?base_id=').concat(scannedData.work_order,).concat('&sub_id=').concat(scannedData.sub_id,).concat('&operation_seq=').concat(scannedData.operation_seq,);
            const request_object = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'x-access-token': localStorage.getItem('token')
                },
                body: JSON.stringify(array_qa_sign_off)
            }
            fetch(url, request_object)
                .then((res) => {
                    if (res.status === 200) {
                        return res.json();
                    }
                    else {
                        alert(res.json());
                    }
                })
                .then((data) => {
                    if (data) {
                        window.location.reload();
                        setIsLoading(false);
                    }
                })
                .catch((err) => { alert(err); setIsLoading(false); });
        }

    }, [scannedData]);

    const on_change_accept_reject = (i) => {
        setAcceptRejectSelection((prev) => (i === prev ? null : i));
    }


    const render = () => {
        return (
            <div>
                <div className="m-3">
                    {
                        !isLoading ?
                            <div>

                                <div className="">
                                    <div className="mb-3">

                                        {/* Accept and Reject option */}
                                        <div>
                                            {acceptRejectOptions.map((o, i) => (
                                                <label className="mr-3" key={i}>
                                                    <input className="mr-1"
                                                        type="checkbox"
                                                        checked={i === acceptRejectSelection}
                                                        onChange={() => on_change_accept_reject(i)}
                                                    />
                                                    {o}
                                                </label>
                                            ))}
                                        </div>
                                        {
                                            acceptRejectSelection !== null ?
                                                <Scan disabled={false} focus={scanInput === 'QUALITY' ? true : false} onChange={(e) => setScannedData(e)} />
                                                : null
                                        }
                                    </div>
                                </div>
                            </div>
                            :
                            <Loading />
                    }
                </div>
            </div>
        );
    }

    return (
        render()
    );
};


export default QASignOff;
