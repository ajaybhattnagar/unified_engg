import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Home.css';
import Loading from "../_ui/loading";
import MTable from "../_ui/materialTable";
import { Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faList, faCheck } from "@fortawesome/free-solid-svg-icons";

const isBrowser = typeof window !== `undefined`

const Home = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [notificationDocumentsData, setNotificationDocumentsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotificationLoading, setIsNotificationLoading] = useState(true);
    const [selectedFromDate, setSelectedFromDate] = useState(utils.convertTimeStampToDateForInputBox(new Date() - 5 * 24 * 60 * 60 * 1000));
    const [selectedToDate, setSelectedToDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [selectedTab, setSelectedTab] = useState(0);



    useEffect(() => {
        setIsLoading(true);

        if (!localStorage.getItem("token")) {
            navigate("/");
            // Break code here
            return;
        }
        if (localStorage.getItem("token")) {
            var response_status = 0;
            var url = appConstants.BASE_URL.concat(appConstants.DASHBOARD);
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

                        // Update data.CLOCK_IN_VS_LABOR_KPI to have the correct values
                        data.CLOCK_IN_VS_LABOR_KPI.forEach((element) => {
                            if (element.IS_CLOCKED_IN >= 1) {
                                element.IS_CLOCKED_IN = "Yes";
                            }
                            else {
                                element.IS_CLOCKED_IN = "No";
                            }
                            if (element.IS_LABOR_START >= 1) {
                                element.IS_LABOR_START = "Yes";
                            }
                            else {
                                element.IS_LABOR_START = "No";
                            }

                        });
                        get_documents_notification_kpi();
                        setData(data);
                    } else {
                        alert(data.message);
                        setIsLoading(false);
                        return null;
                    }
                })
                .catch((err) => console.error(err));
        }
        else {
            navigate("/");
        }

        // Check if selected tab is present in localstorage
        if (localStorage.getItem('selectedTab')) {
            setSelectedTab(parseInt(localStorage.getItem('selectedTab')));
        }


    }, []);

    const get_documents_notification_kpi = () => {
        setIsNotificationLoading(true);
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.DOCUMENTS_NOTIFICATION_KPI).concat('?from_date=').concat(selectedFromDate).concat('&to_date=').concat(selectedToDate);
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
                    // Loop over FAB_SIGN_OFF and QA_SIGN_OFF and update the values
                    data.FAB_SIGN_OFF.forEach((item) => {
                        item.FAB_SIGN_OFF = item.FAB_SIGN_OFF ? true : false;
                    })
                    data.QA_SIGN_OFF.forEach((item) => {
                        item.QA_ACCEPT = item.QA_ACCEPT ? true : false;
                        item.QA_REJECT = item.QA_REJECT ? true : false;
                    })
                    return data;
                } else {
                    alert(data.message);
                    setIsNotificationLoading(false);
                    return null;
                }
            })
            .then((data) => {
                setNotificationDocumentsData(data);
                setIsNotificationLoading(false);
            })
            .catch((err) => { console.error(err); setIsNotificationLoading(false) });
    }

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/");
            // Break code here
            return;
        }
        get_documents_notification_kpi();
    }, [selectedFromDate, selectedToDate])

    useEffect(() => {
        // Set localstorage with selected tab
        localStorage.setItem('selectedTab', selectedTab);
    }, [selectedTab])


    // http://localhost:8080/ticket_details?transaction_id=31

    const safeHtmlRenderer = (instance, td, row, col, prop, value, cellProperties) => {
        td.innerHTML = utils.tranactionIdUrlLink(value)
    }
    const safeImageLinkRenderer = (instance, td, row, col, prop, value, cellProperties) => {
        var url = appConstants.DEPLOYEMENT_URL.concat('reports/open_files?path=').concat(value);
        td.innerHTML = `<a href=${url} target="_blank">View</a>`
    }
    const safeColorRenderer = (instance, td, row, col, prop, value, cellProperties) => {
        if (value === 'Yes') {
            td.style.background = '#90EE90';
        }
        else {
            td.style.background = '#f8d0d6';
        }
        td.innerHTML = value;
    }

    const columns_active_labor_tickets = [
        {
            data: 'TRANSACTION_ID',
            type: 'text',
            readOnly: true,
            renderer: safeHtmlRenderer
        },
        {
            data: 'WORKORDER_BASE_ID',
            type: 'text',
            readOnly: true,
        },
        {
            data: 'LOT_SPLIT_SUB',
            type: 'text',
            readOnly: true
        },
        {
            data: 'INDIRECT_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'DESCRIPTION',
            type: 'text',
            readOnly: true
        },
        {
            data: 'CUSTOMER_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'CLOCK_IN',
            type: 'text',
            correctFormat: true,
            readOnly: true
        },
        {
            data: 'WORK_LOCATION',
            type: 'text',
            readOnly: true
        },
        {
            data: 'EMPLOYEE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'LAB_DESC',
            type: 'text',
            readOnly: true
        },
        {
            data: 'QA_NOTES',
            type: 'text',
            readOnly: true
        },
    ]
    const columns_employee_kpi = [
        {
            data: 'EMPLOYEE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'TOTAL_TODAY_HRS',
            type: 'text',
            readOnly: true
        },
        {
            data: 'TOTAL_WEEK_HRS',
            type: 'text',
            readOnly: true
        }
    ]
    const columns_clocked_in_employees = [
        {
            data: 'ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'IS_CLOCKED_IN',
            type: 'text',
            readOnly: true,
            renderer: safeColorRenderer
        },
        {
            data: 'IS_LABOR_START',
            type: 'text',
            readOnly: true,
            renderer: safeColorRenderer
        }
    ]
    const columns_documents = [
        {
            data: 'DATE',
            type: 'text',
            readOnly: true,
        },
        {
            data: 'ORDER_TYPE',
            type: 'text',
            readOnly: true
        },
        {
            data: 'UNIQUE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'RESOURCE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'FILE_PATH',
            type: 'text',
            readOnly: true,
            renderer: safeImageLinkRenderer
        },
    ]
    const columns_notification = [
        {
            data: 'DATE',
            type: 'text',
            readOnly: true,
        },
        {
            data: 'ORDER_TYPE',
            type: 'text',
            readOnly: true
        },
        {
            data: 'UNIQUE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'RESOURCE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'RECIPIENTS',
            type: 'text',
            readOnly: true
        },
    ]
    const fab_sign_off_columns = [
        {
            data: 'CREATE_DATE',
            type: 'text',
            readOnly: true,
        },
        {
            data: 'WORKORDER_BASE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'OPERATION_SEQ_NO',
            type: 'text',
            readOnly: true
        },
        {
            data: 'RESOURCE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'FAB_SIGN_OFF',
            type: 'checkbox',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'NOTES',
            type: 'text',
            readOnly: true,
        },
        {
            data: 'EMPLOYEE_ID',
            type: 'text',
            readOnly: true
        },

    ]
    const qa_sign_off_columns = [
        {
            data: 'CREATE_DATE',
            type: 'text',
            readOnly: true,
        },
        {
            data: 'WORKORDER_BASE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'OPERATION_SEQ_NO',
            type: 'text',
            readOnly: true
        },
        {
            data: 'RESOURCE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'QA_ACCEPT',
            type: 'checkbox',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'QA_REJECT',
            type: 'checkbox',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'NOTES',
            type: 'text',
            readOnly: true,
        },
        {
            data: 'EMPLOYEE_ID',
            type: 'text',
            readOnly: true
        },

    ]

    const render_clocked_in_employees = () => {
        return (
            <div className="m-3">
                {/* Third row */}
                <Card bg='primary' text='white'>
                    <Card.Header><h5>Clocked In Employees</h5></Card.Header>
                    <Card.Body>
                        <MTable
                            data={data.CLOCK_IN_VS_LABOR_KPI ? data.CLOCK_IN_VS_LABOR_KPI : []}
                            columnsTypes={columns_clocked_in_employees}
                            columnsHeaders={['Name', 'Clocked in?', 'Labor Ticket Started?']}
                        // onChange={(e) => { update_labor_tickets(e) }}
                        />
                    </Card.Body>
                </Card>
            </div>
        );
    }

    const render_labour_summary = () => {
        return (
            <div className="row">
                <div className="col-12 col-md-8">
                    <Card bg='primary' text='white'>
                        <Card.Header><h5>Active Labor Tickets</h5></Card.Header>
                        <Card.Body>
                            <MTable
                                data={data.ACTIVE_LABOR_TICKETS ? data.ACTIVE_LABOR_TICKETS : []}
                                columnsTypes={columns_active_labor_tickets}
                                columnsHeaders={['ID', 'Work order', 'Lot Split Sub', 'Indirect', 'Job Description',
                                    'Customer ID', 'In', 'Work Location', 'Employee', 'Notes', 'QA Notes']}
                            // onChange={(e) => { update_labor_tickets(e) }}
                            />
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-12 col-md-4">
                    <Card bg='primary' text='white'>
                        <Card.Header><h5>Hours</h5></Card.Header>
                        <Card.Body>
                            <MTable
                                data={data.EMPLOYEE_KPI ? data.EMPLOYEE_KPI : []}
                                columnsTypes={columns_employee_kpi}
                                columnsHeaders={['Name', 'Hours today', 'Hours current week']}
                            // onChange={(e) => { update_labor_tickets(e) }}
                            />
                        </Card.Body>
                    </Card>
                </div>
            </div>
        );
    }

    const render_notification_documents = () => {
        return (
            isNotificationLoading ? <Loading />
                :
                <div className="row mt-3">
                    <div className="col-12">
                        <Card bg='primary' text='white'>
                            <Card.Body>
                                <div className="d-flex justify-content-left mb-3">
                                    <div className="w-15 mr-3"><Input text="From" type={'date'} value={selectedFromDate} onChange={(e) => setSelectedFromDate(e)} /></div>
                                    <div className="w-15"><Input text="To" type={'date'} value={selectedToDate} onChange={(e) => setSelectedToDate(e)} /></div>
                                </div>

                                <div className="d-flex justify-content-between mb-3">
                                    <Card bg='primary' text='white' className="w-100">
                                        <Card.Header><h5>Recently Uploaded Documents</h5></Card.Header>
                                        <Card.Body>
                                            {/* Documents */}
                                            <MTable
                                                data={notificationDocumentsData.DOCUMENTS ? notificationDocumentsData.DOCUMENTS : []}
                                                columnsTypes={columns_documents}
                                                columnsHeaders={['Date', 'Type', 'ID', 'Resource ID', 'File']}
                                            />
                                        </Card.Body>
                                    </Card>

                                    {/* Notifications */}
                                    <Card bg='primary' text='white' className="w-100">
                                        <Card.Header><h5>Recent notifications</h5></Card.Header>
                                        <Card.Body>
                                            <MTable
                                                data={notificationDocumentsData.NOTIFICATIONS ? notificationDocumentsData.NOTIFICATIONS : []}
                                                columnsTypes={columns_notification}
                                                columnsHeaders={['Date', 'Type', 'ID', 'Resource ID', 'Recipients']}
                                            />
                                        </Card.Body>
                                    </Card>
                                </div>

                                <div className="d-flex justify-content-between mb-3">
                                    <Card bg='primary' text='white' className="w-100">
                                        <Card.Header><h5>Quality Sign Offs</h5></Card.Header>
                                        <Card.Body>
                                            {/* Documents */}
                                            <MTable
                                                data={notificationDocumentsData.QA_SIGN_OFF ? notificationDocumentsData.QA_SIGN_OFF : []}
                                                columnsTypes={qa_sign_off_columns}
                                                columnsHeaders={['Date', 'Work Order', 'Operation', 'Resource ID', 'Accepted', 'Rejected', 'Notes', 'Employee']}
                                            />
                                        </Card.Body>
                                    </Card>

                                    {/* Notifications */}
                                    <Card bg='primary' text='white' className="w-100">
                                        <Card.Header><h5>Fabrication Sign Offs</h5></Card.Header>
                                        <Card.Body>
                                            <MTable
                                                data={notificationDocumentsData.FAB_SIGN_OFF ? notificationDocumentsData.FAB_SIGN_OFF : []}
                                                columnsTypes={fab_sign_off_columns}
                                                columnsHeaders={['Date', 'Work Order', 'Operation', 'Resource ID', 'Sign Off', 'Notes', 'Employee']}
                                            />
                                        </Card.Body>
                                    </Card>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </div>

        );
    }

    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="m-3">
                    <ul className="nav nav-tabs">
                        <li className="nav-item">
                            <a className={selectedTab == 0 ? "nav-link active cusor-hand" : "nav-link cusor-hand "} aria-current="page" onClick={() => setSelectedTab(0)}>
                                <FontAwesomeIcon icon={faClock} />&nbsp; Clocked In Employees
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={selectedTab == 1 ? "nav-link active cusor-hand " : "nav-link cusor-hand"} onClick={() => setSelectedTab(1)}>
                                <FontAwesomeIcon icon={faList} />&nbsp; Labour Summary
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={selectedTab == 2 ? "nav-link active cusor-hand " : "nav-link cusor-hand"} tabindex="-1" onClick={() => setSelectedTab(2)}>
                                <FontAwesomeIcon icon={faCheck} />&nbsp; QA Summary
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="m-3">
                    {
                        selectedTab == 0 ? render_clocked_in_employees() : null
                    }
                    {
                        selectedTab == 1 ? render_labour_summary() : null
                    }
                    {
                        selectedTab == 2 ? render_notification_documents() : null
                    }
                </div>

            </div>


        );
    }

    return (
        render()
    );
};

export default Home;