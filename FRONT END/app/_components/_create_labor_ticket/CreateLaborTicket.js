import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils.js';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable.js";
import Input from "../_ui/input.js";
import NavigationBar from '../_navigation/NavigationBar.js';
import './CreateLaborTicket.css';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown.js";
import Loading from "../_ui/loading.js";

const isBrowser = typeof window !== `undefined`

const CreateLaborTicket = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [selectedFromDate, setSelectedFromDate] = useState(utils.convertTimeStampToDateForInputBox(new Date() - 3 * 24 * 60 * 60 * 1000));
    const [selectedToDate, setSelectedToDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [isLoading, setIsLoading] = useState(false);




    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        setIsLoading(true);
        var url = appConstants.BASE_URL.concat(appConstants.GET_LABOR_TICKETS);
        var response_status = 0;
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify({
                "DATA_FOR_VISUAL_TICKET": 1,
            })
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
                    setData(data);
                } else {
                    setIsLoading(false);
                    alert(data.message);
                    return null;
                }
            })
            .catch((err) => {console.error(err), setIsLoading(false);});
    }, [selectedFromDate, selectedToDate]);

    const columns = [
        {
            data: 'TRANSACTION_ID',
            type: 'numeric',
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
            data: 'CLOCK_IN',
            type: 'text',
        },
        {
            data: 'CLOCK_OUT',
            type: 'text',
        },
        {
            data: 'EMPLOYEE_ID',
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
            data: 'EMPLOYEE_ID',
            type: 'text',
            readOnly: true
        }
    ]

    const update_labor_tickets = (data) => {
        utils.updateLaborTickets(data)
            .then((response) => {
                alert(response.message);
                setSelectedToDate((prev) => utils.convertTimeStampToDateForInputBox(prev));
            })
            .catch((error) => {
                alert(error);
                console.log(error);
            });
    }

    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="m-3">
                    <div className="mx-auto">
                        {
                            isLoading ? <Loading />
                                :
                                <MTable
                                    data={data}
                                    columnsTypes={columns}
                                    columnsHeaders={['ID', 'Type', 'Work Order', 'Lot', 'Split',
                                        'Split', 'Sub', 'Operation Seq', 'In Time', 'Out Time', 'Hours', 'Description', 'Employee ID']}
                                    onChange={(e) => { update_labor_tickets(e) }}
                                />
                        }
                    </div>

                </div>


            </div>
        );
    }

    return (
        render()
    );
};

export default CreateLaborTicket;