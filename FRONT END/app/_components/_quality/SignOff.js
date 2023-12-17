import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Quality.css';
import { Button } from "react-bootstrap";
import { Card } from "react-bootstrap";
import Loading from "../_ui/loading";
import Scan from "../_ui/scanOrder.js";

const isBrowser = typeof window !== `undefined`

const SignOff = () => {
    const navigate = useNavigate();
    const [scannedData, setScannedData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [scanInput, setScanInput] = useState(localStorage.getItem("SIGN_OFF_SCAN_LAST_SELECTED") || 'FABRICATED');

    // Eg: *%21-HBS-J74$0$60%*


    useEffect(() => {
        if (scannedData && scanInput) {
            console.log(scannedData);
            var array_fab_sign_off = {
                'BASE_ID': scannedData.work_order,
                'SUB_ID': scannedData.sub_id,
                'SEQUENCE_NO': scannedData.operation_seq,
                'FAB_SIGN_OFF': scanInput === 'FABRICATED' ? 1 : null,
            }
            var array_qa_sign_off = {
                'BASE_ID': scannedData.work_order,
                'SUB_ID': scannedData.sub_id,
                'SEQUENCE_NO': scannedData.operation_seq,
                'QA_SIGN_OFF': scanInput === 'QUALITY' ? 1 : null,
            }

            var url = appConstants.BASE_URL.concat(appConstants.GET_UPDATE_OPERATION_DETAILS).concat('?base_id=').concat(scannedData.work_order,).concat('&sub_id=').concat(scannedData.sub_id,).concat('&operation_seq=').concat(scannedData.operation_seq,);
            const request_object = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'x-access-token': localStorage.getItem('token')
                },
                body: scanInput === 'FABRICATED' ? JSON.stringify(array_fab_sign_off) : JSON.stringify(array_qa_sign_off)
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
                    }
                })
                .catch((err) => alert(err));
        }

    }, [scannedData]);



    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="m-3">

                    <div className="d-flex justify-content-center row">
                        <div className="col-12 col-md-8">
                            <Card bg={scanInput === 'FABRICATED' ? 'success' : 'primary'} text='white'>
                                <Card.Header><h5>Fabrication Sign Off</h5></Card.Header>
                                <Card.Body>
                                    <div onClick={() => {setScanInput("FABRICATED"); localStorage.setItem("SIGN_OFF_SCAN_LAST_SELECTED", 'FABRICATED')}} className="mb-3">
                                        <Scan disabled={false} focus={scanInput === 'FABRICATED' ? true : false} onChange={(e) => setScannedData(e)} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>

                        <div className="col-12 col-md-8 mt-3">
                            <Card bg={scanInput === 'QUALITY' ? 'success' : 'primary'} text='white'>
                                <Card.Header><h5>Quality Sign Off</h5></Card.Header>
                                <Card.Body>
                                    <div onClick={() => {setScanInput("QUALITY"); localStorage.setItem("SIGN_OFF_SCAN_LAST_SELECTED", 'QUALITY')}} className="mb-3">
                                        <Scan disabled={false} focus={scanInput === 'QUALITY' ? true : false} onChange={(e) => setScannedData(e)} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>

                </div>


            </div>
        );
    }

    return (
        render()
    );
};

export default SignOff;