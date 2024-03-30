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
import { faFileExport, faFilter, faDownload } from "@fortawesome/free-solid-svg-icons";

const isBrowser = typeof window !== `undefined`

const ApproveLaborTickets = () => {
    const navigate = useNavigate();
    const [originalData, setOriginalData] = useState([]);
    const [laborTicketData, setLaborTicketData] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [selectedFromDate, setSelectedFromDate] = useState(utils.convertTimeStampToDateForInputBox(new Date() - 3 * 24 * 60 * 60 * 1000));
    const [selectedToDate, setSelectedToDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [isLoading, setIsLoading] = useState(false);
    const [selectedApproved, setSelectedApproved] = useState(false);



    useEffect(() => {
        load_labor_tickets();
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
            renderer: safeHtmlRenderer
        },
        {
            data: 'APPROVED',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'EMPLOYEE_ID',
            type: 'text',
            className: 'htCenter',
        },
        {
            data: 'HOURS_WORKED',
            type: 'numeric',
            numericFormat: {
                pattern: '0,00',
            },
        },
        {
            data: 'WORK_TIME',
            type: 'dropdown',
            source: ['Regular Time', 'Over Time', 'Double Time']
        },
        {
            data: 'INDIRECT_ID',
            type: 'text',
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
            data: 'RESOURCE_DESCRIPTION',
            type: 'text',
            readOnly: true
        },
        {
            data: 'LAB_DESC',
            type: 'text',
            className: 'htCenter',
        },
        {
            data: 'QA_NOTES',
            type: 'text',
            className: 'htCenter',
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
            source: ['On-site', 'Off-site', 'Remote']
        },
        {
            data: 'VISUAL_LAB_TRANS_ID',
            type: 'numeric',
            readOnly: true,
            format: '0.00',
        }
    ]
    const grouped_data_columns = [
        {
            data: 'EMPLOYEE_ID',
            type: 'text',
            readOnly: true,
        },
        {
            data: 'APPROVED_HRS',
            type: 'numeric',
            className: 'htCenter',
        },
        {
            data: 'NON_APPROVED_HRS',
            type: 'numeric',
            className: 'htCenter',
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
        utils.updateLaborTickets(edited_data)
            .then((response) => {
                alert(response.message);
                load_labor_tickets();
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

                    {/* <div className="mx-auto">
                        {
                            isLoading ? <Loading />
                                :
                                <MTable
                                    data={groupedData}
                                    columnsTypes={grouped_data_columns}
                                    columnsHeaders={['Employee ID', 'Approved', 'Employee']}
                                />
                        }
                    </div> */}

                    <div className="mx-auto">
                        {
                            isLoading ? <Loading />
                                :
                                <MTable
                                    data={laborTicketData}
                                    columnsTypes={labor_ticket_columns}
                                    columnsHeaders={['ID', 'Approved', 'Employee', 'Hrs worked', 'Work Time',
                                        'Indirect', 'Work order', 'Lot Split Sub', 'Operation', 'Notes', 'QA Notes',
                                        'In', 'Out', 'Part Desc', 'Customer', 'Location', 'Visual Labor ID']}

                                    onChange={(e) => { update_labor_tickets(e) }}
                                    onInstantDataChange={(e) => { null }}
                                    height={window.innerHeight - 200}
                                    hasApproval={true}
                                />
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

export default ApproveLaborTickets;