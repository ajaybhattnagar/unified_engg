import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import './Reports.css';
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";
import TreeDiagram from "../_ui/treeDiagram.js";


const isBrowser = typeof window !== `undefined`

const OpenFiles = () => {
    const navigate = useNavigate();
    const [operationDetails, setOperationDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [employeeList, setEmployeeList] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [path, setPath] = useState(null);

    // Eg: *%21-HBS-J74$0$30%*
    // Eg: *WO022721$1$20*

    // Getting all initial details, active labor ticket, recent labor tickets, employee kpi, clock in details


    // Set url params if any useEffect
    useEffect(() => {
        //    Get params
        const urlParams = new URLSearchParams(window.location.search);
        const path = urlParams.get('path');

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-access-token': localStorage.getItem("token") },
            body: JSON.stringify({ FILE_PATH: path })
        };
        fetch(appConstants.BASE_URL.concat(appConstants.GET_DOCUMENTS_WITH_PATH), requestOptions)
            .then(res => res.blob())
            .then((blob) => {
                var file = window.URL.createObjectURL(blob);
                return file
            })
            .then((response) => {
                window.open(response, "_self");
            })
            .catch(error => {
                alert(error)
                console.log(error)
            })

    }, []);


    const columns_quality_updates = [
        {
            data: 'CREATE_DATE',
            type: 'text',
            className: 'htCenter',
            readOnly: true
        },
        {
            data: 'FAB_SIGN_OFF',
            type: 'checkbox',
            className: 'htCenter',
            readOnly: true
        },
        {
            data: 'QA_SIGN_OFF',
            type: 'checkbox',
            className: 'htCenter',
            readOnly: true
        },
        {
            data: 'QA_ACCEPT',
            type: 'checkbox',
            className: 'htCenter',
            readOnly: true
        },
        {
            data: 'QA_REJECT',
            type: 'checkbox',
            className: 'htCenter',
            readOnly: true
        },
        {
            data: 'NOTIFY_EMPLOYEE',
            type: 'text',
            readOnly: true
        },
        {
            data: 'EMPLOYEE_ID',
            type: 'text',
            readOnly: true
        },
    ]


    return (
        <div>
        </div >
    );
};

export default OpenFiles;