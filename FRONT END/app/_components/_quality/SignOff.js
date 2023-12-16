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
    const [data, setData] = useState([]);
    const [createLabTicketData, setCreateLabTicketData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);




    useEffect(() => {

    }, []);


    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="m-3">

                    <div className="row">
                        <div className="col-12 col-md-8">
                            <Card bg='primary' text='white'>
                                <Card.Header><h5>Fabrication Sign Off</h5></Card.Header>
                                <Card.Body>
                                    <div className="mb-3"><Scan disabled={false} focus={true} /></div>
                                </Card.Body>
                            </Card>
                        </div>

                        <div className="col-12 col-md-8 mt-3">
                            <Card bg='primary' text='white'>
                                <Card.Header><h5>Quality Sign Off</h5></Card.Header>
                                <Card.Body>
                                    <div className="mb-3"><Scan disabled={false} focus={true} /></div>
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