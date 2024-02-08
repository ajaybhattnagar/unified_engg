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
import QASignOff from "./QASignOff.js";
import FabSignOff from "./FabSignOff.js";

const isBrowser = typeof window !== `undefined`

const SignOff = () => {
    const navigate = useNavigate();
    const [scanInput, setScanInput] = useState(localStorage.getItem("SIGN_OFF_SCAN_LAST_SELECTED") || 'FABRICATED');
    const [isLoading, setIsLoading] = useState(false);

    // Eg: *%22-HBS-J37$0$30%*
    // *%S12737$1$30%*
    
    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="m-3">
                    {
                        !isLoading ?
                            <div>

                                <div className="d-flex justify-content-center row">
                                    <div className="col-12 col-md-8" onClick={() => {setScanInput('FABRICATED'); localStorage.setItem('SIGN_OFF_SCAN_LAST_SELECTED', 'FABRICATED')}}>
                                        <Card bg={scanInput === 'FABRICATED' ? 'success' : 'primary'} text='white'>
                                            <Card.Header><h5>Fabrication Sign Off</h5></Card.Header>
                                            <Card.Body>
                                                <FabSignOff fieldDisabled={false}/>
                                            </Card.Body>
                                        </Card>
                                    </div>

                                    <div className="col-12 col-md-8 mt-3" onClick={() => {setScanInput('QUALITY'); localStorage.setItem('SIGN_OFF_SCAN_LAST_SELECTED', 'QUALITY')}}>
                                        <Card bg={scanInput === 'QUALITY' ? 'success' : 'primary'} text='white'>
                                            <Card.Header><h5>Quality Sign Off</h5></Card.Header>
                                            <Card.Body>
                                                <QASignOff />
                                            </Card.Body>
                                        </Card>

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

export default SignOff;