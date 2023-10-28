import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './RecordLabor.css';
import { columns } from '../../_columns/parcelsDisplayColumns';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";

const isBrowser = typeof window !== `undefined`

const RecordsLabor = () => {
    const navigate = useNavigate();
    const [recentLaborTickets, setRecentLaborTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedRecentWorkOrder, setSelectedRecentWorkOrder] = useState(null);
    const [operationDetails, setOperationDetails] = useState(null);

    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [selectedLot, setSelectedLot] = useState(1);
    const [selectedSplit, setSelectedSplit] = useState(0);
    const [selectedSub, setSelectedSub] = useState(0);
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [selectedClockIn, setSelectedClockIn] = useState(utils.convertTimeStampToString(new Date()));
    const [selectedClockOut, setSelectedClockOut] = useState(utils.convertTimeStampToDateForInputBox(new Date()));



    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }

        utils.getLaborTickets({}, localStorage.getItem("EMPLOYEE_ID"), '0')
            .then((response) => {
                setRecentLaborTickets(response)
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
    }, []);

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
        if (selectedWorkOrder != '' && selectedLot != '' && selectedSplit != '' && selectedSub != '') {
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
                    } else {
                        alert(data.message);
                        return null;
                    }
                })
                .catch((err) => console.error(err));
        }
    }, [selectedWorkOrder]);


    const recent_labor_tickets_render = () => {
        return (
            <div className="m-3">
                {recentLaborTickets.map((ticket) => (
                    <div key={ticket.TRANSACTION_ID}>
                        <p className="badge badge-primary cusor-hand" onClick={(e) => setSelectedRecentWorkOrder(ticket)} >{ticket.WORKORDER_BASE_ID}</p>
                        {/* add other ticket properties as needed */}
                    </div>
                ))}
            </div>
        )
    }


    const create_labor_tickets_render = () => {
        return (
            <div>
                <div className="mt-3" />

                <div className="container">
                    <div className='w-100'>
                        <Input type={'text'} placeholder="Search" value={selectedWorkOrder} text='Work Order' onChange={(e) => setSelectedWorkOrder(e)} />
                    </div>
                    <div className="d-flex justify-content-around">
                        <div className='w-25 mt-3'><Input type={'number'} placeholder="Lot ID" value={selectedLot} text='Lot' onChange={(e) => setSelectedLot(e)} /> </div>
                        <div className='w-25 mt-3 ml-3'><Input type={'number'} placeholder="Split ID" value={selectedSplit} text='Split' onChange={(e) => setSelectedSplit(e)} /></div>
                        <div className='w-25 mt-3 ml-3'><Input type={'number'} placeholder="Sub ID" value={selectedSub} text='Sub' onChange={(e) => setSelectedSub(e)} /></div>
                    </div>
                    {
                        operationDetails && operationDetails.length > 0 ?
                            <div className="w-100 mt-3">
                                <DropDown list={operationDetails} isMulti={false} prepareArray={false} placeholder={"Select Operation"} onSelect={(e) => setSelectedOperation(e.value)} />
                            </div>
                            :
                            null
                    }
                    <div className="w-100 mt-3">
                        <Input type={'text'} placeholder="Clock In" text='Clock In' disabled={true} value={selectedClockIn} />
                    </div>
                    <div className="w-100 mt-3">
                        <Input type={'text'} placeholder="Clock Out" text='Clock Out' disabled={true} value={selectedClockIn} />
                    </div>
                    <div className="w-100 d-flex justify-content-between">
                        <button className="btn btn-success mt-3">Stop</button>
                        <button className="btn btn-danger mt-3">Start</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <NavigationBar />
            {
                !isLoading ?
                    <div className="d-flex justify-content-around">
                        {recent_labor_tickets_render()}
                        {create_labor_tickets_render()}
                    </div>
                    :
                    <Loading />
            }
        </div>
    );
};

export default RecordsLabor;