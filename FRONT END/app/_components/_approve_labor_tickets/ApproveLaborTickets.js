import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './ApproveLaborTickets.css';
import { columns } from '../../_columns/parcelsDisplayColumns';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";

const isBrowser = typeof window !== `undefined`

const ApproveLaborTickets = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [selectedFromDate, setSelectedFromDate] = useState(utils.convertTimeStampToDateForInputBox(new Date() - 14 * 24 * 60 * 60 * 1000));
    const [selectedToDate, setSelectedToDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [isLoading, setIsLoading] = useState(true);

    


    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
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
            data: 'APPROVED',
            type: 'checkbox',
            className: 'htCenter',
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
                        <MTable
                            data={data}
                            columnsTypes={columns}
                            columnsHeaders={['ID', 'Work order', 'Lot Split Sub', 'Description', 'Customer ID', 'In Date', 'In Time', 'Out Date', 'Out Time', 'Hours worked', 'Approved']}
                        />
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