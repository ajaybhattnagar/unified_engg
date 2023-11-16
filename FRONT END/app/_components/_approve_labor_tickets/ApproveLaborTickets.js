import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './ApproveLaborTickets.css';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";

const isBrowser = typeof window !== `undefined`

const ApproveLaborTickets = () => {
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
        utils.getLaborTickets(selectedFromDate, selectedToDate, localStorage.getItem("EMPLOYEE_ID"), 'ALL')
            .then((response) => {
                if (response.length > 0) {
                    response.forEach((item) => {
                        item.APPROVED = item.APPROVED === 'true' ? true : false;
                        item.REGULAR_TIME = item.REGULAR_TIME === '1' ? true : false;
                        item.OVER_TIME = item.OVER_TIME === '1' ? true : false;
                        item.DOUBLE_TIME = item.DOUBLE_TIME === '1' ? true : false;
                        item
                    })
                    setData(response);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
    }, [selectedFromDate, selectedToDate]);

    const columns = [
        {
            data: 'TRANSACTION_ID',
            type: 'numeric',

        },
        {
            data: 'WORKORDER_BASE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'LOT_SPLIT_SUB',
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
            data: 'CLOCK_IN_DATE',
            type: 'date',
            dateFormat: 'YYYY-MM-DD',
            correctFormat: true
        },
        {
            data: 'CLOCK_IN_TIME',
            type: 'time',
            timeFormat: 'HH:mm:ss',
            correctFormat: true,
        },
        {
            data: 'CLOCK_OUT_DATE',
            type: 'date',
            dateFormat: 'YYYY-MM-DD',
            correctFormat: true
        },
        {
            data: 'CLOCK_OUT_TIME',
            type: 'time',
            timeFormat: 'HH:mm:ss',
            correctFormat: true
        },
        {
            data: 'HOURS_WORKED',
            type: 'numeric',
        },
        {
            data: 'INDIRECT_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'HOURS_BREAK',
            type: 'numeric',
            readOnly: true
        },
        {
            data: 'WORK_LOCATION',
            type: 'dropdown',
            source: ['On-site', 'Off-site', 'Remote']
        },
        {
            data: 'REGULAR_TIME',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'OVER_TIME',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'DOUBLE_TIME',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'APPROVED',
            type: 'checkbox',
            className: 'htCenter',
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
                    <div className="d-flex justify-content-left mb-3">
                        <div className="w-15 mr-3"><Input text="From" type={'date'} value={selectedFromDate} onChange={(e) => setSelectedFromDate(e)} /></div>
                        <div className="w-15"><Input text="To" type={'date'} value={selectedToDate} onChange={(e) => setSelectedToDate(e)} /></div>
                    </div>
                    <div className="mx-auto">
                        {
                            isLoading ? <Loading />
                                :
                                <MTable
                                    data={data}
                                    columnsTypes={columns}
                                    columnsHeaders={['ID', 'Work order', 'Lot Split Sub', 'Description', 'Customer ID',
                                        'In Date', 'In Time', 'Out Date', 'Out Time', 'Hours worked', 'Indirect' , 'Break hours', 'Location', 'Regular Time', 'Over Time', 'Double Time', 'Approved']}
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

export default ApproveLaborTickets;