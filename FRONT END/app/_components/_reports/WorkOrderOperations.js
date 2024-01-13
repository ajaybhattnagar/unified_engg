import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import './Reports.css';
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";


const isBrowser = typeof window !== `undefined`

const WorkOrderOperations = () => {
    const navigate = useNavigate();
    const [operationDetails, setOperationDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [employeeList, setEmployeeList] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const urlParams = new URLSearchParams(window.location.search);
    const base_id = urlParams.get('base_id');
    const sub_id = urlParams.get('sub_id');
    const operation_seq = urlParams.get('operation_seq');


    // Eg: *%21-HBS-J74$0$30%*
    // Eg: *WO022721$1$20*

    // Getting all initial details, active labor ticket, recent labor tickets, employee kpi, clock in details


    // Set url params if any useEffect
    useEffect(() => {
        // Get operation details
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.GET_UPDATE_OPERATION_DETAILS).concat('?base_id=').concat(base_id).concat('&sub_id=').concat(sub_id).concat('&operation_seq=').concat(operation_seq);
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
                    console.log(data);
                    // Update data.CLOCK_IN_VS_LABOR_KPI to have the correct values
                    data.forEach((element) => {
                        if (element.FAB_SIGN_OFF >= 1) { element.FAB_SIGN_OFF = true; } else { element.FAB_SIGN_OFF = false; }
                        if (element.QA_SIGN_OFF >= 1) { element.QA_SIGN_OFF = true; } else { element.QA_SIGN_OFF = false; }
                        if (element.QA_ACCEPT >= 1) { element.QA_ACCEPT = true; } else { element.QA_ACCEPT = false; }
                        if (element.QA_REJECT >= 1) { element.QA_REJECT = true; } else { element.QA_REJECT = false; }
                    })
                    setOperationDetails(data);
                } else {
                    alert(data.message);
                    setIsLoading(false);
                    return null;
                }
            })
            .catch((err) => console.error(err));

    }, []);

    // Get all employee list
    useEffect(() => {
        // Get all employee list
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.GET_ALL_EMPLOYEES);
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
                    if (data.length > 0) {
                        // Convert data to required format
                        var employee_list = [];
                        data.forEach((element) => {
                            employee_list.push({ value: element.EMAIL_ADDR, label: element.FIRST_NAME + ' ' + element.LAST_NAME });
                        });
                        setEmployeeList(employee_list);
                    }
                } else {
                    alert(data.message);
                    return null;
                }
            })
            .catch((err) => console.error(err));

    }, []);

    // Update selected employee in database
    useEffect(() => {

        // Get operation details
        if (selectedEmployee) {
            var url = appConstants.BASE_URL.concat(appConstants.GET_UPDATE_OPERATION_DETAILS).concat('?base_id=').concat(base_id).concat('&sub_id=').concat(sub_id).concat('&operation_seq=').concat(operation_seq);
            const request_object = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'x-access-token': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    'BASE_ID': base_id,
                    'SUB_ID': sub_id,
                    'SEQUENCE_NO': operation_seq,
                    'NOTIFY_EMPLOYEE': selectedEmployee.value ? selectedEmployee.value : null
                })
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
                .catch((err) => console.error(err));
        }


    }, [selectedEmployee]);

    const columns_quality_updates = [
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

    const render_operation_details = () => {
        return (
            <div>
                <div className="mt-3" />
                {
                    !isLoading && operationDetails && operationDetails.length > 0 ?
                        <div>
                            <div className="container">

                                <div className="d-flex justify-content-between">
                                    <span className="h5">{operationDetails[0].WORKORDER_BASE_ID} - {operationDetails[0].RESOURCE_ID}</span>
                                </div>

                                <div className="mt-3" >
                                    <MTable
                                        data={operationDetails ? operationDetails : []}
                                        columnsTypes={columns_quality_updates}
                                        columnsHeaders={['Fabrication Sign Off', 'Quality Sign Off', 'Accept', 'Reject',
                                            'Notify?', 'Employee']} />
                                </div>

                                <div className="mt-3" >
                                    <DropDown list={employeeList} text='Notify'
                                        isMulti={false} prepareArray={false}
                                        onSelect={(e) => { setSelectedEmployee(e) }}
                                        value={selectedEmployee}
                                    />
                                </div>

                                <div className="mt-3" >
                                    <textarea disabled={true} className="form-control" rows="5" id="comment">{operationDetails[0].NOTES}</textarea>
                                </div>
                            </div>

                        </div>
                        // 
                        :
                        <Loading />
                }

            </div >

        );
    }

    return (
        <div>
            {
                render_operation_details()
            }
        </div >
    );
};

export default WorkOrderOperations;