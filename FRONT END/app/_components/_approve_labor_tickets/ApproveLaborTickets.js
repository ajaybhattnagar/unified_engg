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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport, faPrint, faDownload } from "@fortawesome/free-solid-svg-icons";
import { LabNotes, QaNotes } from '../_ui/NotesValidation';

const isBrowser = typeof window !== `undefined`

const ApproveLaborTickets = () => {
    const navigate = useNavigate();
    const [originalData, setOriginalData] = useState([]);
    const [laborTicketData, setLaborTicketData] = useState([]);
    const [summaryData, setSummaryData] = useState([]);
    const [selectedFromDate, setSelectedFromDate] = useState(utils.convertTimeStampToDateForInputBox(new Date() - 1 * 24 * 60 * 60 * 1000));
    const [selectedToDate, setSelectedToDate] = useState(utils.convertTimeStampToDateForInputBox(new Date() - 1 * 24 * 60 * 60 * 1000));
    const [isLoading, setIsLoading] = useState(false);
    const [selectedApproved, setSelectedApproved] = useState(false);



    useEffect(() => {
        load_labor_tickets();
        get_labor_summary();
    }, [selectedFromDate, selectedToDate]);

    useEffect(() => {
        if (selectedApproved) {
            let newData = originalData.filter((item) => {
                return item.APPROVED === true;
            });
            setLaborTicketData(newData);
        }
        else {
            let newData = originalData.filter((item) => {
                return item.APPROVED === false;
            });
            setLaborTicketData(newData);
        }
    }, [selectedApproved]);

    const safeHtmlRenderer = (instance, td, row, col, prop, value, cellProperties) => {
        td.innerHTML = utils.tranactionIdUrlLink(value)
    }

    const labor_ticket_columns = [
        {
            data: 'TRANSACTION_ID',
            type: 'numeric',
            readOnly: true,
            renderer: safeHtmlRenderer,
            width: 20
        },
        {
            data: 'APPROVED',
            type: 'checkbox',
            className: 'htCenter',
            width: 20
        },
        {
            data: 'EMPLOYEE_ID',
            type: 'text',
            className: 'htCenter',
        },
        {
            data: 'DEPARTMENT_ID',
            type: 'text',
            readOnly: true,
            width: 25
        },
        {
            data: 'HOURS_WORKED',
            type: 'numeric',
            numericFormat: {
                pattern: '0,00',
            },
            width: 20
        },
        {
            data: 'WORK_TIME',
            type: 'dropdown',
            source: ['RT', 'OT', 'DT'],
            width: 15
        },
        {
            data: 'INDIRECT_ID',
            type: 'text',
            readOnly: true,
            width: 20
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
            data: 'RESOURCE_DESCRIPTION',
            type: 'text',
            readOnly: true,
            wordWrap: false,
        },
        {
            data: 'LAB_DESC',
            type: 'text',
            className: 'htCenter',
            editor: LabNotes
        },
        {
            data: 'QA_NOTES',
            type: 'text',
            className: 'htCenter',
            editor: QaNotes
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
            data: 'WORK_LOCATION',
            type: 'dropdown',
            source: ['On-site', 'Off-site', 'Remote'],
            width: 25
        },
        {
            data: 'VISUAL_LAB_TRANS_ID',
            type: 'numeric',
            readOnly: true,
            format: '0.00',
            width: 10
        }
    ]
    const summary_data_columns = [
        {
            data: 'EMPLOYEE_ID',
            type: 'text',
            readOnly: true,
        },
        {
            data: 'APPR',
            type: 'numeric',
            className: 'htCenter',
            readOnly: true,
        },
        {
            data: 'NOT_APPR',
            type: 'numeric',
            className: 'htCenter',
            readOnly: true,
        }
    ]


    const load_labor_tickets = () => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
            return;
        }
        setIsLoading(true);
        utils.getLaborTickets(selectedFromDate, selectedToDate, 'ALL', 'ALL')
            .then((response) => {
                if (response.length > 0) {
                    response.forEach((item) => {
                        item.APPROVED = item.APPROVED === 'true' ? true : false;
                        item.REGULAR_TIME = item.REGULAR_TIME === '1' ? true : false;
                        item.OVER_TIME = item.OVER_TIME === '1' ? true : false;
                        item.DOUBLE_TIME = item.DOUBLE_TIME === '1' ? true : false;
                        item
                    })

                    // Filter to remove records where hours worked is 0
                    response = response.filter((item) => {
                        return item.HOURS_WORKED > 0;
                    });

                    // Filter to set only non-approved records
                    var newData = response.filter((item) => {
                        return item.APPROVED === false;
                    });

                    setOriginalData(response);
                    setLaborTicketData(newData);
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
    }

    const update_labor_tickets = (edited_data) => {
        // Update OT, DT, RT to overtime, double time, regular time
        edited_data.forEach((item) => {
            if (item.WORK_TIME === 'OT') {
                item.WORK_TIME = "Over Time";
            }
            else if (item.WORK_TIME === 'DT') {
                item.WORK_TIME = "Double Time";
            }
            else if (item.WORK_TIME === 'RT') {
                item.WORK_TIME = "Regular Time";
            }
        });
        utils.updateLaborTickets(edited_data)
            .then((response) => {
                alert(response.message);
                load_labor_tickets();
                get_labor_summary();
            })
            .catch((error) => {
                alert(error);
                console.log(error);
            });
    }

    const get_labor_summary = () => {
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        setIsLoading(true);
        var url = appConstants.BASE_URL.concat(appConstants.LABOUR_SUMMARY_REPORT_BY_EMPLOYEE_APPROVE_PAGE);
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem("token")
            },
            body: JSON.stringify({
                FROM_DATE: selectedFromDate,
                TO_DATE: selectedToDate
            })
        }).then(res => res.json())
            .then((response) => {
                setSummaryData(response);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="container-fluid mt-3">
                    <div className="d-flex justify-content-left mb-3">
                        <div className="d-flex">
                            <div className="w-15 mr-3"><Input text="From" type={'date'} value={selectedFromDate} onChange={(e) => setSelectedFromDate(e)} /></div>
                            <div className="w-15"><Input text="To" type={'date'} value={selectedToDate} onChange={(e) => setSelectedToDate(e)} /></div>
                        </div>

                        {
                            laborTicketData && laborTicketData.length > 0 ?
                                <div className="w-20 ml-3 mr-3">
                                    <button data-toggle="tooltip" title="Download" className='ml-2 btn btn-primary' onClick={() => utils.exportExcel(laborTicketData, "approve_labour_page")}>
                                        <FontAwesomeIcon className="" icon={faDownload} /></button>
                                </div>
                                : null
                        }

                        <div className="d-flex justify-content-center mb-2">
                            <button className={selectedApproved ? 'ml-2 btn btn-primary' : 'ml-2 btn btn-outline-primary'} onClick={() => setSelectedApproved(true)}>Approved</button>
                            <button className={!selectedApproved ? 'ml-2 btn btn-primary' : 'ml-2 btn btn-outline-primary'} onClick={() => setSelectedApproved(false)}>Not Approved</button>
                        </div>

                    </div>

                    <div>

                        {/* Summary data table */}
                        <span className="font-weight-bold">Summary</span>
                        {
                            summaryData && summaryData.length > 0 ?
                                <div className="mx-auto mb-3">
                                    {
                                        isLoading ? <Loading />
                                            :
                                            <MTable
                                                data={summaryData}
                                                columnsTypes={summary_data_columns}
                                                columnsHeaders={['Employee ID', 'Approved Hrs', 'Not Approved Hrs']}
                                                height={150}
                                            />
                                    }
                                </div>
                                :
                                null
                        }

                        <hr />

                        <span className="font-weight-bold">Details</span>
                        <div className="mx-auto">
                            {
                                isLoading ? <Loading />
                                    :
                                    <MTable
                                        data={laborTicketData}
                                        columnsTypes={labor_ticket_columns}
                                        columnsHeaders={['ID', 'Appr.', 'Emp. <br> Name', 'Dept. ID', 'Hrs. <br> Worked', 'Work <br> Time',
                                        'Indirect', 'WO ID', 'Lot <br> Split Sub', 'Operation', 'Notes', 'QA Notes',
                                        'In', 'Out', 'Cust. <br> Name', 'Location', 'Visual <br> Labor ID']}

                                        onChange={(e) => { update_labor_tickets(e) }}
                                        onInstantDataChange={(e) => { null }}
                                        height={window.innerHeight - 450}
                                        hasApproval={true}
                                    />
                            }
                        </div>

                    </div>


                </div>
            </div >
        );
    }

    return (
        render()
    );
};

export default ApproveLaborTickets;