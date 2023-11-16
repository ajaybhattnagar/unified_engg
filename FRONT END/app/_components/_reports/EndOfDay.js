import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Reports.css';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";

const isBrowser = typeof window !== `undefined`

const EOD = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [selectedFromDate, setSelectedFromDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [selectedToDate, setSelectedToDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [isLoading, setIsLoading] = useState(false);

    const isAllowedEditLaborTicket = useRef(false);


    useEffect(() => {
        var access_rights = utils.decodeJwt();
        access_rights = access_rights.USER_DETAILS

        if (access_rights.ALLOWED_EDIT_LABOR_TICKET === '1') {
            isAllowedEditLaborTicket.current = true;
        }


    }, []);

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


    const update_labor_tickets = (data) => {
        if (isAllowedEditLaborTicket.current) {
            utils.updateLaborTickets(data)
                .then((response) => {
                    alert(response.message);
                    setSelectedToDate((prev) => utils.convertTimeStampToDateForInputBox(prev));
                })
                .catch((error) => {
                    alert(error);
                    console.log(error);
                });
        } else {
            alert('You do not have the permission edit labor tickets');
        }

    }

    const columns = [
        {
            data: 'TRANSACTION_ID',
            type: 'numeric',
            readOnly: true
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
            readOnly: true
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
            data: 'LAB_DESC',
            type: 'text',
        },
        {
            data: 'QA_NOTES',
            type: 'text',
        },
        {
            data: 'APPROVED',
            type: 'checkbox',
            className: 'htCenter',
            readOnly: true
        }
    ]

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
                                    columnsHeaders={['ID', 'Work order', 'Lot Split Sub', 'Part Description', 'Customer ID', 'In Date', 'In Time', 'Out Date', 'Out Time', 'Hours worked', 
                                     'Indirect', 'Hours break', 'Description', 'QA Notes', 'Approved']}
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

export default EOD;