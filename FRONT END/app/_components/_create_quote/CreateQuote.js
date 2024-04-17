import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils.js';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable.js";
import Input from "../_ui/input.js";
import NavigationBar from '../_navigation/NavigationBar.js';
import './CreateQuote.css';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown.js";
import Loading from "../_ui/loading.js";
import jwt_decode from "jwt-decode";

const isBrowser = typeof window !== `undefined`

const CreateQuote = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [selectedFromDate, setSelectedFromDate] = useState(utils.convertTimeStampToDateForInputBox(new Date() - 3 * 24 * 60 * 60 * 1000));
    const [selectedToDate, setSelectedToDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
            return;
        }
        setIsLoading(true);
        var url = appConstants.BASE_URL.concat(appConstants.GET_CREATE_QUOTE_INITIAL_LOAD_DETAILS);
        var response_status = 0;
        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
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
                    setIsLoading(false);
                    console.log(data);
                    setData(data);
                } else {
                    setIsLoading(false);
                    alert(data.message);
                    return null;
                }
            })
            .catch((err) => { console.error(err), setIsLoading(false); });
    }, [selectedFromDate, selectedToDate]);

    const columns = [
        {
            data: 'UNI_TRANSACTION_ID',
            type: 'numeric',
            readOnly: true
        },
        {
            data: 'TRANSACTION_TYPE',
            type: 'text',
            readOnly: true
        },
        {
            data: 'WORKORDER_BASE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'WORKORDER_LOT_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'WORKORDER_SPLIT_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'WORKORDER_SUB_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'OPERATION_SEQ_NO',
            type: 'text',
            readOnly: true
        },
        {
            data: 'INDIRECT_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'DISP_CLOCKIN',
            type: 'text',
            readOnly: true
        },
        {
            data: 'DISP_CLOCKOUT',
            type: 'text',
            readOnly: true
        },
        {
            data: 'HOURS_WORKED',
            type: 'numeric',
            readOnly: true,
            format: '0.00',
        },
        {
            data: 'DESCRIPTION',
            type: 'text',
            readOnly: true
        },
        {
            data: 'EMP_NAME',
            type: 'text',
            readOnly: true
        },
    ]

    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="m-3">
                    <div className="mx-auto">
                       asdasd
                    </div>

                </div>


            </div>
        );
    }

    return (
        render()
    );
};

export default CreateQuote;