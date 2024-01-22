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

const isBrowser = typeof window !== `undefined`

const Home = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [notificationDocumentsData, setNotificationDocumentsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNotificationLoading, setIsNotificationLoading] = useState(true);
    const [selectedFromDate, setSelectedFromDate] = useState(utils.convertTimeStampToDateForInputBox(new Date() - 5 * 24 * 60 * 60 * 1000));
    const [selectedToDate, setSelectedToDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));



    useEffect(() => {
        setIsLoading(true);
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
                    setNotificationDocumentsData(data);
                    setIsNotificationLoading(false);
                } else {
                    alert(data.message);
                    setIsNotificationLoading(false);
                    return null;
                }
            })
            .catch((err) => { console.error(err); setIsNotificationLoading(false) });
    }

    useEffect(() => {
        get_documents_notification_kpi();
    }, [selectedFromDate, selectedToDate])


    // http://localhost:8080/ticket_details?transaction_id=31

    const safeHtmlRenderer = (instance, td, row, col, prop, value, cellProperties) => {
        td.innerHTML = utils.tranactionIdUrlLink(value)
    }
    const safeImageLinkRenderer = (instance, td, row, col, prop, value, cellProperties) => {
        var url = appConstants.DEPLOYEMENT_URL.concat('reports/open_files?path=').concat(value);
        td.innerHTML = `<a href=${url} target="_blank">View</a>`
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
            readOnly: true
        },
        {
            data: 'IS_LABOR_START',
            type: 'text',
            readOnly: true
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


    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="m-3">
                    <div className="mx-auto">
                        {
                            isLoading ? <Loading />
                                :
                                <div>
                                    {/* First row */}
                                    <div className="row">
                                        <div className="col-12 col-md-8">
                                            <Card bg='primary' text='white'>
                                                <Card.Header><h5>Active Labor Tickets</h5></Card.Header>
                                                <Card.Body>
                                                    <MTable
                                                        data={data.ACTIVE_LABOR_TICKETS ? data.ACTIVE_LABOR_TICKETS : []}
                                                        columnsTypes={columns_active_labor_tickets}
                                                        columnsHeaders={['ID', 'Work order', 'Lot Split Sub', 'Indirect', 'Part Description',
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

                                    {/* Second Row */}
                                    {
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
                                                        </Card.Body>
                                                    </Card>
                                                </div>
                                            </div>
                                    }

                                    {/* Third row */}
                                    <div className="row mt-3">
                                        <div className="col-12 col-md-4">
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
                                    </div>

                                </div>
                        }
                    </div>
                </div>


            </div >
        );
    }

    return (
        render()
    );
};

export default Home;