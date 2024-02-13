import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import Scan from "../_ui/scanOrder.js";
import { Button, Card, Form } from "react-bootstrap";
import { render } from "react-dom";
import FabSignOff from "../_quality/FabSignOff.js";
import TableList from "../_ui/tableList.js";


const isBrowser = typeof window !== `undefined`

const RecordsLabor = () => {
    const navigate = useNavigate();
    const [scannedData, setScannedData] = useState(null);
    const [recentLaborTickets, setRecentLaborTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOperationLoading, setOperationIsLoading] = useState(false);
    const [isLaborTicketLoading, setLaborTicketIsLoading] = useState(false);

    const [selectedRecentWorkOrder, setSelectedRecentWorkOrder] = useState(null);
    const [operationDetails, setOperationDetails] = useState(null);
    const [activeLaborTicket, setActiveLaborTicket] = useState(0);
    const [clockInDetails, setClockInDetails] = useState(null);

    const [transactionId, setTransactionId] = useState(0);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [selectedLot, setSelectedLot] = useState(1);
    const [selectedSplit, setSelectedSplit] = useState(0);
    const [selectedSub, setSelectedSub] = useState(0);
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [selectedResourceString, setSelectedResourceString] = useState('');
    const [selectedClockIn, setSelectedClockIn] = useState(utils.convertTimeStampToString(new Date()));
    const [selectedClockOut, setSelectedClockOut] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [desciption, setDescription] = useState('');
    const [qaNotes, setQaNotes] = useState('');
    const operationSeqNo = useRef(null);
    const isIndirectLaborTicket = useRef(null);

    const [workorderList, setWorkorderList] = useState([]);

    const [employeeKpi, setEmployeeKpi] = useState([]);

    const workLocationsOptions = ['On-site', 'Off-site', 'Remote'];
    const [selectedWorkLocation, setSelectedWorkLocation] = useState(0);
    const workTimeOptions = ['Regular Time', 'Over Time', 'Double Time'];
    const [selectedWorkTime, setSelectedWorkTime] = useState(0);

    const uploadTypeOptions = ['Document', 'Camera'];
    const [selectedUploadType, setSelectedUploadType] = useState(0);

    const [clickedImage, setClickedImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const isWorkLocationAllowed = useRef(false);
    const isWorkTimeAllowed = useRef(false);
    const isScanOptionSelected = useRef(localStorage.getItem("DEFAULT_SCAN") === 'true' ? true : false || false);

    const [isLaborTicketRun, setIsLaborTicketRun] = useState(true);

    const urlParams = new URLSearchParams(window.location.search);
    const base_id = urlParams.get('base_id');
    const sub_id = urlParams.get('sub_id');
    const operation_seq = urlParams.get('operation_seq');

    // Eg: *%22-CFS-J15$0$10%*
    // Eg: *WO022721$1$20*
    // Eg: %22-CFS-J15$0$10%

    // Getting all initial details, active labor ticket, recent labor tickets, employee kpi, clock in details
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
                    data.last_30_tickets && data.last_30_tickets.length > 0 ? setRecentLaborTickets(data.last_30_tickets) : null;
                    data.active_labor_ticket && data.active_labor_ticket.length > 0 ? setActiveLaborTicket(data.active_labor_ticket) : null;
                    data.employee_kpis && data.employee_kpis.length > 0 ? setEmployeeKpi(data.employee_kpis) : null;
                    data.emp_clock_in_details && data.emp_clock_in_details.length > 0 ? setClockInDetails(data.emp_clock_in_details) : null;

                    // Set transaction id and details if active labor ticket present
                    if (data.active_labor_ticket && data.active_labor_ticket.length > 0) {
                        setTransactionId(data.active_labor_ticket[0].TRANSACTION_ID)
                        setSelectedWorkOrder(data.active_labor_ticket[0].WORKORDER_BASE_ID)
                        setSelectedLot(data.active_labor_ticket[0].WORKORDER_LOT_ID)
                        setSelectedSplit(data.active_labor_ticket[0].WORKORDER_SPLIT_ID)
                        setSelectedSub(data.active_labor_ticket[0].WORKORDER_SUB_ID)
                        setSelectedResourceString(data.active_labor_ticket[0].RESOURCE_ID)
                        setSelectedClockIn(utils.convertTimeStampToString(data.active_labor_ticket[0].CLOCK_IN))
                        setSelectedClockOut(utils.convertTimeStampToString(new Date()))
                        setQaNotes(data.active_labor_ticket[0].QA_NOTES)
                        setDescription(data.active_labor_ticket[0].DESCRIPTION)
                        operationSeqNo.current = data.active_labor_ticket[0].OPERATION_SEQ_NO;
                        data.active_labor_ticket[0].TYPE === 'I' ? isIndirectLaborTicket.current = true : isIndirectLaborTicket.current = false;

                        // Set clocked in time and work order in local-storage
                        localStorage.setItem("ACTIVE_WO_CLOCK_IN", utils.convertTimeStampToString(data.active_labor_ticket[0].CLOCK_IN));
                        localStorage.setItem("ACTIVE_WO", data.active_labor_ticket[0].WORKORDER_BASE_ID);
                        localStorage.setItem("ACTIVE_OP", data.active_labor_ticket[0].RESOURCE_DESC);
                        localStorage.setItem("INDIRECT_ID", data.active_labor_ticket[0].INDIRECT_ID);
                    }

                    data.all_workorders_list && data.all_workorders_list.length > 0 ? setWorkorderList(data.all_workorders_list) : null;

                    setIsLoading(false);
                } else {
                    alert(data.message);
                    setIsLoading(false);
                    return null;
                }
            })
            .catch((err) => console.error(err));
    }, []);

    // Access rights useEffect
    useEffect(() => {
        if (localStorage.getItem("token")) {
            var access_rights = utils.decodeJwt();
            access_rights = access_rights.USER_DETAILS

            if (access_rights.ALLOWED_WORKING_LOCATION === '1') {
                isWorkLocationAllowed.current = true;
            }
            if (access_rights.ALLOWED_WORKING_TIME === '1') {
                isWorkTimeAllowed.current = true;
            }
        }

    }, []);

    // Set url params if any useEffect
    useEffect(() => {
        if (base_id && base_id !== null && base_id !== '' && sub_id && sub_id !== null && sub_id !== '' && operation_seq && operation_seq !== null && operation_seq !== '') {
            setSelectedWorkOrder(base_id)
            setSelectedSub(sub_id)
            setSelectedOperation(operation_seq)
        }
    }, []);

    // Set scanned data useEffect
    useEffect(() => {
        if (scannedData && scannedData !== null) {
            var disectedData = utils.disectScanInputString(scannedData);
            setSelectedWorkOrder(disectedData.work_order)
            setSelectedSub(disectedData.sub_id)
            setSelectedOperation(disectedData.operation_seq)
        }
    }, [scannedData]);

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
            setScannedData(null);
            setSelectedWorkOrder(selectedRecentWorkOrder.WORKORDER_BASE_ID || '')
            setSelectedLot(selectedRecentWorkOrder.WORKORDER_LOT_ID || 0)
            setSelectedSplit(selectedRecentWorkOrder.WORKORDER_SPLIT_ID || 0)
            setSelectedSub(selectedRecentWorkOrder.WORKORDER_SUB_ID || 0)
            setSelectedOperation('')
            setSelectedResourceString('')
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

                        // Setting dropdown array if scanned
                        if (selectedOperation) {
                            if (data.filter(item => item.value == selectedOperation).length === 0) {
                                alert('Invalid Operation!');
                                setSelectedOperation(null)
                                setSelectedResourceString(null)
                                return;
                            }
                            setSelectedResourceString(data.filter(item => item.value == selectedOperation)[0].label)
                        }
                        else {
                            setSelectedOperation(null)
                            setSelectedResourceString(null)
                        }

                        // Set operation seq again when url parameter present
                        if (operation_seq && operation_seq !== null && operation_seq !== '') {
                            setSelectedOperation(operation_seq)
                        }
                        // Set operation resource string if stop labor ticket
                        if (activeLaborTicket && activeLaborTicket.length > 0) {
                            setSelectedResourceString(activeLaborTicket[0].RESOURCE_ID)
                        }

                    } else {
                        alert(data.message);
                        setOperationIsLoading(false);
                        return null;
                    }
                })
                .catch((err) => { console.error(err); setIsOperationLoading(false); });
        }


    }, [selectedWorkOrder, selectedSub]);

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
                "WORKORDER_SUB_ID": selectedSub,
                "OPERATION_SEQ_NO": selectedOperation,
                "RUN_TYPE": "R",
                "EMP_ID": localStorage.getItem("EMPLOYEE_ID"),
                "RESOURCE_ID": selectedResourceString,
                "DESCRIPTION": desciption || "",
                "WORK_LOCATION": workLocationsOptions[selectedWorkLocation] || 'On-site',
                "WORK_TIME": workTimeOptions[selectedWorkTime] || 'Regular Time',
                "QA_NOTES": qaNotes,
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
                        <p className="badge badge-light cusor-hand w-100 align-middle"
                            style={{ fontSize: '1.25em', fontWeight: 'bold' }} onClick={(e) => setSelectedRecentWorkOrder(ticket)} >{ticket.WORKORDER_BASE_ID}</p>
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
            <div className="container">
                <div className="mt-3" />

                <div className="">
                    <div className="mb-3"><Scan disabled={false} onChange={(e) => setScannedData(e)} focus={true} value={scannedData} /></div>
                    <div className=''>
                        <DropDown list={workorderList} text='Work Order'
                            isMulti={false} prepareArray={false} placeholder={selectedWorkOrder === null ? "Select Work Order" : selectedWorkOrder}
                            onSelect={(e) => { setSelectedWorkOrder(e.value) }}
                            value={{ 'value': selectedWorkOrder, 'label': selectedWorkOrder }}
                            disabled={isScanOptionSelected.current || false}
                        />
                    </div>
                    <div className="d-flex justify-content-between mt-3">
                        <div className='w-25'><Input type={'number'} min='0' max='99' disabled={true} placeholder="Lot ID" value={selectedLot} text='Lot' onChange={(e) => setSelectedLot(e)} /> </div>
                        <div className='w-25'><Input type={'number'} min='0' max='99' disabled={true} placeholder="Split ID" value={selectedSplit} text='Split' onChange={(e) => setSelectedSplit(e)} /></div>
                        <div className='w-25'><Input type={'number'} min='0' max='99' disabled={isScanOptionSelected.current || false} placeholder="Sub ID" value={selectedSub} text='Sub' onChange={(e) => setSelectedSub(e)} /></div>
                    </div>
                    {
                        !isOperationLoading ?
                            operationDetails && operationDetails.length > 0 ?
                                <div className="w-100 mt-3">
                                    <DropDown list={operationDetails} isMulti={false}
                                        text='Operation'
                                        prepareArray={false} placeholder={"Select Operation"}
                                        onSelect={(e) => { setSelectedOperation(e.value), setSelectedResourceString(e.label) }}
                                        value={{ 'value': selectedOperation, 'label': selectedResourceString }}
                                    />
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
                    </div>

                    <div className="d-flex justify-content-between mt-3">
                        <div className="w-75"><Input type={'text'} placeholder="Additional Notes" onChange={(e) => setDescription(e)} text='Notes' value={desciption} /></div>
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
        utils.stopLaborTickets(transactionId, selectedClockIn)
            .then((response) => {
                // alert(response.message);

                // Clear local storage
                localStorage.removeItem("ACTIVE_WO_CLOCK_IN");
                localStorage.removeItem("ACTIVE_WO");
                localStorage.removeItem("ACTIVE_OP");
                localStorage.removeItem("INDIRECT_ID");

                window.location.reload();
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
    }

    const update_labor_ticket_field = (field_name, field_value) => {
        utils.updateLaborTicketsField(transactionId, field_name, field_value)
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                alert(error.message);
                console.log(error);
            });
    }

    const create_labor_tickets_render_stop = () => {
        var scanString = `*%${selectedWorkOrder}$${selectedSub}$${operationSeqNo.current}%*`;
        return (
            <div>
                <div className="mt-3" />

                <div className="d-flex justify-content-around">

                    {/* Table */}
                    {
                        !isIndirectLaborTicket.current ?
                            <div className="mt-3" >
                                {/* Filtering to keep only required columns */}
                                <TableList data={activeLaborTicket ? activeLaborTicket.map(({ CUSTOMER_NAME, JOB_COORDINATOR, WO_DESCRIPTION, CUSTOMER_CONTACT }) => ({ CUSTOMER_NAME, JOB_COORDINATOR, WO_DESCRIPTION, CUSTOMER_CONTACT })) : null} />
                                <div className="mt-3" >
                                    <div className="ml-3"><span className="badge badge-light align-middle">Fabrication Sign Off</span></div>
                                    <div className=""><FabSignOff fieldDisabled={true} scanString={scanString} /></div>
                                </div>
                            </div> :
                            null
                    }


                    {/* Scan details */}
                    <div className="container col-lg-7">
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
                            <Input type={'text'} placeholder="Operation" text='Operation' disabled={true} value={selectedResourceString} />
                        </div>

                        <div className="w-100 mt-3">
                            <Input type={'text'} placeholder="Clock In" text='Clock In' disabled={true} value={selectedClockIn} />
                        </div>
                        <div className="w-100 mt-3">
                            <Input type={'text'} placeholder="Clock Out" text='Clock Out' disabled={true} value={selectedClockOut} />
                        </div>
                        <div className="w-100 mt-3">
                            <Input type={'text'} placeholder="QA Notes" text='QA Notes'
                                onChange={(e) => setQaNotes(e)}
                                onUpdateButtonClick={(e) => update_labor_ticket_field("QA_NOTES", qaNotes)} value={qaNotes} />
                        </div>
                        <div className="w-100 mt-3">
                            <Input type={'text'} placeholder="Description" text='Description'
                                onChange={(e) => setDescription(e)}
                                onUpdateButtonClick={(e) => update_labor_ticket_field("DESCRIPTION", desciption)} value={desciption} />
                        </div>
                        <div className="w-100 d-flex justify-content-end">
                            <button className="btn btn-outline-danger mt-3" onClick={(e) => stop_labor_tickets()}>Stop</button>
                        </div>
                        {render_file_camera_stop()}

                    </div>

                </div>  {/* // End of d-flex justify-content-between */}
            </div >
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
            utils.uploadDocuments(selectedFile, transactionId, false)
                .then((response) => {
                    console.log(response);
                    window.location.reload();
                })
        }

        // Upload Images if any
        if (clickedImage && clickedImage !== null && transactionId != 0 && transactionId != null) {
            utils.uploadImage(clickedImage, transactionId, false)
                .then((response) => {
                    console.log(response);
                    window.location.reload();
                })
        }
    }

    const render_file_camera_start = () => {
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
            </div >
        )
    }

    const render_file_camera_stop = () => {
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

    const render_clock_in = () => {
        return (
            <div className="d-flex justify-content-center w-100 mt-3">
                <button className="btn btn-outline-danger mt-1" onClick={(e) => {
                    utils.clock_in_out_users("clock_in")
                        .then((response) => {
                            window.location.reload();
                        })
                }}>
                    Clock In</button>
            </div>
        )
    }

    return (
        <div>
            <NavigationBar />
            {
                !isLoading ?
                    <div className="">
                        {
                            clockInDetails && clockInDetails.length > 0 ?

                                // Ticket creationa and stopping it
                                activeLaborTicket && activeLaborTicket.length > 0 ?
                                    create_labor_tickets_render_stop()
                                    :
                                    <div>
                                        <div className="d-flex justify-content-around mt-2">
                                            <ul className="nav nav-pills">
                                                {/* Button to Labor run */}
                                                <li className="nav-item">
                                                    <a className={isLaborTicketRun ? "cusor-hand nav-link active" : "cusor-hand nav-link"} onClick={() => { setIsLaborTicketRun(true) }}>Run</a>
                                                </li>
                                                {/* Button for Indirect */}
                                                <li className="nav-item">
                                                    <a className={!isLaborTicketRun ? "cusor-hand nav-link active" : "cusor-hand nav-link"} onClick={() => { setIsLaborTicketRun(false) }}>Indirect</a>
                                                </li>
                                                {/* Button to logout */}
                                                <li className="nav-item btn btn-outline-dark ml-1">
                                                    <a className="" onClick={(e) => {

                                                        // Stop labor ticket if any
                                                        if (transactionId != 0 && transactionId != null) {
                                                            utils.stopLaborTickets(transactionId)
                                                                .then((response) => {
                                                                    // alert(response.message);
                                                                })
                                                                .catch((error) => {
                                                                    console.log(error);
                                                                });
                                                        }
                                                        // Clock out
                                                        utils.clock_in_out_users("clock_out")
                                                            .then((response) => {
                                                                window.location.reload();
                                                            })

                                                    }}>Clock out</a>
                                                </li>
                                            </ul>

                                        </div>
                                        {
                                            isLaborTicketRun ?
                                                <div className="">
                                                    {
                                                        <div className="container">
                                                            {create_labor_tickets_render_start()}
                                                            {recent_labor_tickets_render()}
                                                            {render_kpi()}
                                                            {render_file_camera_start()}
                                                        </div>
                                                    }

                                                </div>
                                                :
                                                <div className="container">
                                                    <IndirectLaborTicket />
                                                </div>
                                        }
                                    </div>
                                // Ticket creationa and stopping it

                                :
                                <div className="">
                                    {render_clock_in()}
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