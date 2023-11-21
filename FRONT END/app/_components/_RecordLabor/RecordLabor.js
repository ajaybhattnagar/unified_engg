import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './RecordLabor.css';
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";
import KpiCard from "../_ui/kpiCard";
import WebCam from "../_ui/webCam.js";
import SingleFileUploader from "../_ui/uploadFile.js";
import IndirectLaborTicket from "../_ui/indirectLaborTicket.js";

const isBrowser = typeof window !== `undefined`

const RecordsLabor = () => {
    const navigate = useNavigate();
    const [recentLaborTickets, setRecentLaborTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOperationLoading, setOperationIsLoading] = useState(false);
    const [isLaborTicketLoading, setLaborTicketIsLoading] = useState(false);

    const [selectedRecentWorkOrder, setSelectedRecentWorkOrder] = useState(null);
    const [operationDetails, setOperationDetails] = useState(null);
    const [activeLaborTicket, setActiveLaborTicket] = useState(0);

    const [transactionId, setTransactionId] = useState(0);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [selectedLot, setSelectedLot] = useState(1);
    const [selectedSplit, setSelectedSplit] = useState(0);
    const [selectedSub, setSelectedSub] = useState(0);
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [selectedResourceString, setSelectedResourceString] = useState('');
    const [selectedClockIn, setSelectedClockIn] = useState(utils.convertTimeStampToString(new Date()));
    const [selectedClockOut, setSelectedClockOut] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [qaNotes, setQaNotes] = useState('');
    const [notifyQACheckbox, setNotifyQACheckbox] = useState(false);

    const [workorderList, setWorkorderList] = useState([]);

    const [employeeKpi, setEmployeeKpi] = useState([]);

    const workLocationsOptions = ['On-site', 'Off-site', 'Remote'];
    const [selectedWorkLocation, setSelectedWorkLocation] = useState('');
    const workTimeOptions = ['Regular Time', 'Over Time', 'Double Time'];
    const [selectedWorkTime, setSelectedWorkTime] = useState('');

    const uploadTypeOptions = ['Document', 'Camera'];
    const [selectedUploadType, setSelectedUploadType] = useState(0);

    const [clickedImage, setClickedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const isWorkLocationAllowed = useRef(false);
    const isWorkTimeAllowed = useRef(false);

    const [isLaborTicketRun, setIsLaborTicketRun] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.GET_EMPLOYEE_SCAN_DETAILS);
        const request_object = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                "EMP_ID": localStorage.getItem("EMPLOYEE_ID"),
            })
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
                    data.last_30_tickets && data.last_30_tickets.length > 0 ? setRecentLaborTickets(data.last_30_tickets) : null;
                    data.active_labor_ticket && data.active_labor_ticket.length > 0 ? setActiveLaborTicket(data.active_labor_ticket) : null;
                    data.employee_kpis && data.employee_kpis.length > 0 ? setEmployeeKpi(data.employee_kpis) : null;

                    if (data.active_labor_ticket && data.active_labor_ticket.length > 0) {
                        setTransactionId(data.active_labor_ticket[0].TRANSACTION_ID)
                        setSelectedWorkOrder(data.active_labor_ticket[0].WORKORDER_BASE_ID)
                        setSelectedLot(data.active_labor_ticket[0].WORKORDER_LOT_ID)
                        setSelectedSplit(data.active_labor_ticket[0].WORKORDER_SPLIT_ID)
                        setSelectedSub(data.active_labor_ticket[0].WORKORDER_SUB_ID)
                        setSelectedOperation(data.active_labor_ticket[0].RESOURCE_ID)
                        setSelectedClockIn(utils.convertTimeStampToString(data.active_labor_ticket[0].CLOCK_IN))
                        setSelectedClockOut(utils.convertTimeStampToString(new Date()))
                    }

                    data.all_workorders_list && data.all_workorders_list.length > 0 ? setWorkorderList(data.all_workorders_list) : null;


                } else {
                    alert(data.message);
                    setIsLoading(false);
                    return null;
                }
            })
            .catch((err) => console.error(err));



    }, []);

    useEffect(() => {
        var access_rights = utils.decodeJwt();
        access_rights = access_rights.USER_DETAILS

        if (access_rights.ALLOWED_WORKING_LOCATION === '1') {
            isWorkLocationAllowed.current = true;
        }
        if (access_rights.ALLOWED_WORKING_TIME === '1') {
            isWorkTimeAllowed.current = true;
        }

    }, []);

    useEffect(() => {
        var timer = setInterval(() => {
            if (transactionId == null || transactionId === 0 || transactionId == undefined) {
                setSelectedClockIn(utils.convertTimeStampToString(new Date()))
            } else {
                setSelectedClockOut(utils.convertTimeStampToString(new Date()))
            }

        }, 1000);

        return () => clearInterval(timer);
    }, [transactionId]);

    useEffect(() => {
        if (selectedRecentWorkOrder) {
            setSelectedWorkOrder(selectedRecentWorkOrder.WORKORDER_BASE_ID)
            setSelectedLot(selectedRecentWorkOrder.WORKORDER_LOT_ID)
            setSelectedSplit(selectedRecentWorkOrder.WORKORDER_SPLIT_ID)
            setSelectedSub(selectedRecentWorkOrder.WORKORDER_SUB_ID)
            setSelectedOperation(selectedRecentWorkOrder.OPERATION_SEQ_NO)
        }
    }, [selectedRecentWorkOrder]);

    useEffect(() => {
        if (selectedWorkOrder !== '' && selectedLot !== '' && selectedSplit !== '' && selectedSub !== '') {
            setOperationIsLoading(true);
            var response_status = 0;
            var url = appConstants.BASE_URL.concat(appConstants.GET_WORKORDER_OPERATION_DETAILS);
            const request_object = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'x-access-token': localStorage.getItem('token')
                },
                body: JSON.stringify({
                    "WORKORDER_TYPE": "W",
                    "WORKORDER_ID": selectedWorkOrder,
                    "WORKORDER_LOT_ID": selectedLot,
                    "WORKORDER_SPLIT_ID": selectedSplit,
                    "WORKORDER_SUB_ID": selectedSub
                })
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
                        setOperationDetails(data)
                        setOperationIsLoading(false);
                    } else {
                        alert(data.message);
                        setOperationIsLoading(false);
                        return null;
                    }
                })
                .catch((err) => { console.error(err); setIsOperationLoading(false); });
        }
    }, [selectedWorkOrder]);

    const create_labor_ticket = () => {
        if (selectedWorkOrder === null || selectedWorkOrder === '' || selectedOperation === null || selectedOperation === '') {
            alert('Please fill all the fields!');
            return;
        }
        setLaborTicketIsLoading(true);
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.START_LABOR_TICKET);
        const request_object = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                "WORKORDER_TYPE": "W",
                "WORKORDER_ID": selectedWorkOrder,
                "WORKORDER_LOT_ID": selectedLot,
                "WORKORDER_SPLIT_ID": selectedSplit,
                "WORKORDER_SUB_ID": selectedSplit,
                "OPERATION_SEQ_NO": selectedOperation,
                "RUN_TYPE": "R",
                "EMP_ID": localStorage.getItem("EMPLOYEE_ID"),
                "RESOURCE_ID": selectedResourceString,
                // "DESCRIPTION": "SOME NOTES",
                "WORK_LOCATION": workLocationsOptions[selectedWorkLocation] || 'On-site',
                "WORK_TIME": workTimeOptions[selectedWorkTime] || 'Regular Time',
                "QA_NOTES": qaNotes,
                "NOTIFY_QA": notifyQACheckbox ? 'Y' : 'N'
            })
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

                    // Upload Documents if any
                    if (selectedFile && selectedFile !== null && data.data != 0 && data.data != null) {
                        utils.uploadDocuments(selectedFile, data.data)
                            .then((response) => {
                                console.log(response);
                            })
                    }

                    // Upload Images if any
                    if (clickedImage && clickedImage !== null && data.data != 0 && data.data != null) {
                        utils.uploadImage(clickedImage, data.data)
                            .then((response) => {
                                console.log(response);
                            })
                    }

                    alert("Labor Ticket Created Successfully!");
                    setLaborTicketIsLoading(false);
                    window.location.reload();
                } else {
                    alert(data.message);
                    setLaborTicketIsLoading(false);
                    return null;
                }
            });

    }

    const recent_labor_tickets_render = () => {
        return (
            <div className="d-flex flex-wrap">
                {recentLaborTickets.map((ticket, index) => (
                    <div className="m-2" key={index}>
                        <p className="badge badge-light cusor-hand w-100 align-middle" style={{ fontSize: '1.25em', fontWeight: 'bold' }} onClick={(e) => setSelectedRecentWorkOrder(ticket)} >{ticket.WORKORDER_BASE_ID}</p>
                        {/* add other ticket properties as needed */}
                    </div>
                ))}
            </div>
        )
    }

    const on_change_work_location = (i) => {
        setSelectedWorkLocation((prev) => (i === prev ? null : i));
    }
    const on_change_work_time = (i) => {
        setSelectedWorkTime((prev) => (i === prev ? null : i));
    }
    const on_change_upload_type = (i) => {
        setSelectedUploadType((prev) => (i === prev ? null : i));
    }

    const create_labor_tickets_render_start = () => {
        return (
            <div>
                <div className="mt-3" />

                <div className="container">
                    <div className='w-100'>
                        <DropDown list={workorderList} isMulti={false} prepareArray={false} placeholder={selectedWorkOrder === null ? "Select Work Order" : selectedWorkOrder} onSelect={(e) => { setSelectedWorkOrder(e.value) }} />

                    </div>
                    <div className="d-flex justify-content-around">
                        <div className='w-25 mt-3'><Input type={'number'} placeholder="Lot ID" value={selectedLot} text='Lot' onChange={(e) => setSelectedLot(e)} /> </div>
                        <div className='w-25 mt-3 ml-3'><Input type={'number'} placeholder="Split ID" value={selectedSplit} text='Split' onChange={(e) => setSelectedSplit(e)} /></div>
                        <div className='w-25 mt-3 ml-3'><Input type={'number'} placeholder="Sub ID" value={selectedSub} text='Sub' onChange={(e) => setSelectedSub(e)} /></div>
                    </div>
                    {
                        !isOperationLoading ?
                            operationDetails && operationDetails.length > 0 ?
                                <div className="w-100 mt-3">
                                    <DropDown list={operationDetails} isMulti={false} prepareArray={false} placeholder={"Select Operation"} onSelect={(e) => { setSelectedOperation(e.value), setSelectedResourceString(e.label) }} />
                                </div>
                                :
                                null
                            :
                            <div className="mt-1"><Loading /></div>
                    }

                    <div className="w-100 mt-3">
                        <Input type={'text'} placeholder="Clock In" text='Clock In' disabled={true} value={selectedClockIn} />
                    </div>

                    <div className="d-flex justify-content-between mt-3">
                        <div className="w-75"><Input type={'text'} placeholder="QA Notes" text='QA Notes' disabled={false} value={qaNotes} onChange={(e) => setQaNotes(e)} /></div>
                        <div><input className="m-1" type="checkbox" checked={notifyQACheckbox} onChange={() => setNotifyQACheckbox(!notifyQACheckbox)} /> Notify QA</div>
                    </div>

                    <div className="w-100 d-flex justify-content-between">

                        {/* Work Location Options */}
                        <div className="">
                            <div>
                                {workLocationsOptions.map((o, i) => (
                                    <label className="mt-3 ml-3" key={i}>
                                        <input className="mr-1"
                                            disabled={!isWorkLocationAllowed.current}
                                            type="checkbox"
                                            checked={i === selectedWorkLocation}
                                            onChange={() => on_change_work_location(i)}
                                        />
                                        {o}
                                    </label>
                                ))}
                            </div>

                            <div>
                                {workTimeOptions.map((o, i) => (
                                    <label className="mt-1 ml-3" key={i}>
                                        <input className="mr-1"
                                            disabled={!isWorkTimeAllowed.current}
                                            type="checkbox"
                                            checked={i === selectedWorkTime}
                                            onChange={() => on_change_work_time(i)}
                                        />
                                        {o}
                                    </label>
                                ))}
                            </div>
                        </div>


                        <div className="d-flex flex-column justify-content-end">
                            {
                                !isLaborTicketLoading ?
                                    <button className="btn btn-outline-success mt-1" onClick={(e) => create_labor_ticket()}>Start</button>
                                    :
                                    <button className="btn btn-outline-success mt-1" disabled><Loading /></button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const stop_labor_tickets = () => {
        setIsLoading(true);
        utils.stopLaborTickets(transactionId)
            .then((response) => {
                // alert(response.message);
                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
    }

    const create_labor_tickets_render_stop = () => {

        return (
            <div>
                <div className="mt-3" />

                <div className="container">
                    <div className='w-100 d-flex justify-content-around'>
                        <div className='mt-3 mr-1'><Input type={'text'} placeholder="Search" value={transactionId} text='ID' disabled={true} /></div>
                        <div className='mt-3'><Input type={'text'} placeholder="Search" value={selectedWorkOrder} text='Work Order' disabled={true} /></div>
                    </div>
                    <div className="d-flex justify-content-around">
                        <div className='w-25 mt-3'><Input type={'number'} placeholder="Lot ID" value={selectedLot} text='Lot' onChange={(e) => setSelectedLot(e)} disabled={true} /> </div>
                        <div className='w-25 mt-3 ml-3'><Input type={'number'} placeholder="Split ID" value={selectedSplit} text='Split' onChange={(e) => setSelectedSplit(e)} disabled={true} /></div>
                        <div className='w-25 mt-3 ml-3'><Input type={'number'} placeholder="Sub ID" value={selectedSub} text='Sub' onChange={(e) => setSelectedSub(e)} disabled={true} /></div>
                    </div>

                    <div className="w-100 mt-3">
                        <Input type={'text'} placeholder="Operation" text='Operation' disabled={true} value={selectedOperation} />
                    </div>

                    <div className="w-100 mt-3">
                        <Input type={'text'} placeholder="Clock In" text='Clock In' disabled={true} value={selectedClockIn} />
                    </div>
                    <div className="w-100 mt-3">
                        <Input type={'text'} placeholder="Clock Out" text='Clock Out' disabled={true} value={selectedClockOut} />
                    </div>
                    <div className="w-100 d-flex justify-content-end">
                        <button className="btn btn-outline-danger mt-3" onClick={(e) => stop_labor_tickets()}>Stop</button>
                    </div>
                    {render_file_camera()}
                </div>
            </div>
        );
    }

    const render_kpi = () => {
        return (
            <div className="">
                {
                    employeeKpi && employeeKpi.length > 0 ?
                        <div className="d-flex flex-wrap justify-content-around">
                            <KpiCard header={'Today'} value={employeeKpi[0].TOTAL_TODAY_HRS.toFixed(2) + ' Hours'} />
                            <KpiCard header={'This Week'} value={employeeKpi[0].TOTAL_WEEK_HRS.toFixed(2) + ' Hours'} />
                        </div>
                        :
                        null
                }
            </div>
        )
    }

    const upload_image_document = () => {
        if (selectedFile && selectedFile !== null && transactionId != 0 && transactionId != null) {
            utils.uploadDocuments(selectedFile, transactionId)
                .then((response) => {
                    console.log(response);
                    window.location.reload();
                })
        }

        // Upload Images if any
        if (clickedImage && clickedImage !== null && transactionId != 0 && transactionId != null) {
            utils.uploadImage(clickedImage, transactionId)
                .then((response) => {
                    console.log(response);
                    window.location.reload();
                })
        }
    }

    const render_file_camera = () => {
        return (

            <div className="d-flex">
                {
                    selectedWorkOrder != null && selectedWorkOrder !== '' ?
                        <div className="">
                            {uploadTypeOptions.map((o, i) => (
                                <label className="mt-3 ml-3" key={i}>
                                    <input className="mr-1"
                                        type="checkbox"
                                        checked={i === selectedUploadType}
                                        onChange={() => on_change_upload_type(i)}
                                    />
                                    {o}
                                </label>
                            ))}
                            {
                                selectedUploadType === 0 ?
                                    <div className="ml-3"><SingleFileUploader onClick={(e) => setSelectedFile(e)} /></div>
                                    :
                                    <WebCam onClick={(e) => setClickedImage(e)} />
                            }
                        </div> : null
                }

                {
                    activeLaborTicket && activeLaborTicket.length > 0 && clickedImage != null || selectedFile != null ?
                        <div className="fixed-bottom mx-auto d-flex justify-content-center mb-2">
                            <button className="btn btn-primary mt-3" onClick={(e) => upload_image_document()}>Upload</button>
                        </div>
                        : null
                }
            </div >
        )
    }

    return (
        <div>
            <NavigationBar />
            {
                !isLoading ?
                    <div className="d-flex justify-content-around">
                        {
                            activeLaborTicket && activeLaborTicket.length > 0 ?
                                create_labor_tickets_render_stop()
                                :
                                <div>
                                    <div className="container d-flex justify-content-around mt-2">
                                        <ul className="nav nav-pills">
                                            <li className="nav-item">
                                                <a className={isLaborTicketRun ? "cusor-hand nav-link active" : "cusor-hand nav-link"} onClick={() => { setIsLaborTicketRun(true) }}>Run</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className={!isLaborTicketRun ? "cusor-hand nav-link active" : "cusor-hand nav-link"} onClick={() => { setIsLaborTicketRun(false) }}>Indirect</a>
                                            </li>
                                        </ul>

                                    </div>
                                    {
                                        isLaborTicketRun ?
                                            <div className="container">
                                                {create_labor_tickets_render_start()}
                                                {recent_labor_tickets_render()}
                                                {render_kpi()}
                                                {render_file_camera()}
                                            </div>
                                            :
                                            <div className="container">
                                                <IndirectLaborTicket />
                                            </div>
                                    }

                                </div>
                        }
                    </div>
                    :
                    <Loading />
            }
        </div >
    );
};

export default RecordsLabor;