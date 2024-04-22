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
import KpiCard from "../_ui/kpiCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport, faPrint, faDownload } from "@fortawesome/free-solid-svg-icons";

const isBrowser = typeof window !== `undefined`

const EOD = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [selectedFromDate, setSelectedFromDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [selectedToDate, setSelectedToDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [isLoading, setIsLoading] = useState(false);
    const [totalHours, setTotalHours] = useState(0);

    const isAllowedEditLaborTicket = useRef(false);


    useEffect(() => {
        if (localStorage.getItem("token")) {
            var access_rights = utils.decodeJwt();
            access_rights = access_rights.USER_DETAILS

            if (access_rights.ALLOWED_EDIT_LABOR_TICKET === '1') {
                isAllowedEditLaborTicket.current = true;
            }
        }


    }, []);

    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
            return;
        }
        setIsLoading(true);
        utils.getLaborTickets(selectedFromDate, selectedToDate, localStorage.getItem("EMPLOYEE_ID"), 'ALL')
            .then((response) => {
                if (response.length > 0) {
                    var total_hours = 0;
                    response.forEach((item) => {
                        item.APPROVED = item.APPROVED === 'true' ? true : false;
                        total_hours += parseFloat(item.HOURS_WORKED);
                    })
                    setTotalHours(total_hours);
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

            // Remove records that are approved
            var filterd_data = data.filter((item) => {
                return item.APPROVED !== true;
            });

            utils.updateLaborTickets(filterd_data)
                .then((response) => {
                    alert(response.message);
                    setSelectedToDate((prev) => utils.convertTimeStampToDateForInputBox(prev));
                    window.location.reload();
                })
                .catch((error) => {
                    alert(error);
                    console.log(error);
                });
        } else {
            alert('You do not have the permission edit labor tickets');
        }

    }

    const update_total_hours = (data) => {
        var total_hours = 0;
        data.forEach((item) => {
            total_hours += parseFloat(item.HOURS_WORKED);
        })
        setTotalHours(total_hours);
    }

    const safeHtmlRenderer = (instance, td, row, col, prop, value, cellProperties) => {
        td.innerHTML = utils.tranactionIdUrlLink(value)
    }

    const columns = [
        {
            data: 'TRANSACTION_ID',
            type: 'numeric',
            readOnly: true,
            renderer: safeHtmlRenderer,
            width: 15
        },
        {
            data: 'WORKORDER_BASE_ID',
            type: 'text',
            readOnly: true,
            width: 25
        },
        {
            data: 'LOT_SPLIT_SUB',
            type: 'text',
            readOnly: true,
            width: 25

        },
        {
            data: 'PART_DESC',
            type: 'text',
            readOnly: true
        },
        {
            data: 'CUSTOMER_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'RESOURCE_DESCRIPTION',
            type: 'text',
            readOnly: true
        },
        {
            data: 'INDIRECT_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'HOURS_WORKED',
            type: 'numeric',
        },
        {
            data: 'WORK_TIME',
            type: 'dropdown',
            source: ['Regular Time', 'Over Time', 'Double Time']
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
            data: 'CLOCK_IN',
            type: 'text',
            readOnly: true
        },
        {
            data: 'CLOCK_OUT',
            type: 'text',
            readOnly: true
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
                        <div className="d-flex">
                            <div className="d-flex">
                                <div className="w-15 mr-3"><Input text="From" type={'date'} value={selectedFromDate} onChange={(e) => setSelectedFromDate(e)} /></div>
                                <div className="w-15"><Input text="To" type={'date'} value={selectedToDate} onChange={(e) => setSelectedToDate(e)} /></div>
                            </div>
                            <div className="ml-3">
                                <button type="button" class="btn btn-outline-success">
                                    Total Hours <span class="ml-2 badge badge-light">{totalHours}</span>
                                </button>
                            </div>
                        </div>

                        {
                            data && data.length > 0 ?
                                <div className="w-20 ml-3">
                                    <Button data-toggle="tooltip" title="Download" className='mr-2' onClick={() => utils.exportExcel(data, "end_of_day_report")}>
                                        <FontAwesomeIcon className="" icon={faDownload} /></Button>
                                </div>
                                : null
                        }
                    </div>
                    <div className="mx-auto">
                        {
                            isLoading ? <Loading />
                                :
                                <MTable
                                    data={data}
                                    columnsTypes={columns}
                                    columnsHeaders={['ID', 'Work <br> order', 'Lot <br> Split Sub', 'Part <br> Desc', 'Customer ID', 'Operation', 
                                        'Indirect', 'Hrs <br> worked', 'Work Time', 'Notes', 'QA Notes', 
                                        'In', 'Out', 'Approved']}
                                    onChange={(e) => { update_labor_tickets(e) }}
                                    onInstantDataChange={(e) => { update_total_hours(e) }}
                                    height={window.innerHeight - 200}
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