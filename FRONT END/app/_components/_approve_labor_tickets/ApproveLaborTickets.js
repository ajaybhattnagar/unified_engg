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
import { faArrowLeft, faPrint, faDownload, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { LabNotes, QaNotes } from '../_ui/NotesValidation';
import ColumnHideDropDown from "../_ui/columnHideDropDown.js";

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
    const [hiddenColumnsArray, setHiddenColumnsArray] = useState([]);
    const [hiddenColumnsIndexList, setHiddenColumnsIndexList] = useState([]);
    const [laborTicketColumns, setLaborTicketColumns] = useState([]);
    const [uniqueEmployeeList, setUniqueEmployeeList] = useState([]);


    useEffect(() => {
        const labor_ticket_columns = [
            {
                data: 'TRANSACTION_ID',
                type: 'numeric',
                readOnly: true,
                renderer: safeHtmlRenderer,
                width: 20,
                label: 'ID'
            },
            {
                data: 'APPROVED',
                type: 'checkbox',
                className: 'htCenter',
                width: 20,
                label: 'Appr.'
            },
            {
                data: 'EMPLOYEE_ID',
                type: 'text',
                className: 'htCenter',
                label: 'Emp. Name'
            },
            {
                data: 'DEPARTMENT_ID',
                type: 'text',
                readOnly: true,
                width: 25,
                label: 'Dept. ID'
            },
            {
                data: 'HOURS_WORKED',
                type: 'numeric',
                numericFormat: {
                    pattern: '0,00',
                },
                width: 20,
                label: 'Hrs. Worked'
            },
            {
                data: 'WORK_TIME',
                type: 'dropdown',
                source: ['RT', 'OT', 'DT'],
                width: 15,
                label: 'Work Time'
            },
            {
                data: 'INDIRECT_ID',
                type: 'text',
                readOnly: true,
                width: 20,
                label: 'Indirect'
            },
            {
                data: 'WORKORDER_BASE_ID',
                type: 'text',
                readOnly: true,
                width: 25,
                label: 'WO ID'
            },
            {
                data: 'LOT_SPLIT_SUB',
                type: 'text',
                readOnly: true,
                width: 25,
                label: 'Lot Split Sub'
            },
            {
                data: 'RESOURCE_DESCRIPTION',
                type: 'text',
                readOnly: true,
                wordWrap: false,
                label: 'Operation'
            },
            {
                data: 'LAB_DESC',
                type: 'text',
                className: 'htCenter',
                editor: LabNotes,
                label: 'Notes'
            },
            {
                data: 'QA_NOTES',
                type: 'text',
                className: 'htCenter',
                editor: QaNotes,
                label: 'QA Notes'
            },
            {
                data: 'CLOCK_IN',
                type: 'text',
                readOnly: true,
                label: 'In'
            },
            {
                data: 'CLOCK_OUT',
                type: 'text',
                readOnly: true,
                label: 'Out'
            },
            {
                data: 'PART_DESC',
                type: 'text',
                readOnly: true,
                label: 'Part Desc.'
            },
            {
                data: 'CUSTOMER_ID',
                type: 'text',
                readOnly: true,
                label: 'Customer ID'
            },
            {
                data: 'WORK_LOCATION',
                type: 'dropdown',
                source: ['On-site', 'Off-site', 'Remote'],
                width: 25,
                label: 'Location'
            },
            {
                data: 'VISUAL_LAB_TRANS_ID',
                type: 'numeric',
                readOnly: true,
                format: '0.00',
                width: 10,
                label: 'Visual Labor ID'
            }
        ]
        setLaborTicketColumns(labor_ticket_columns);

        // Get hidden columns from local storage
        var hidden_columns_index_list = localStorage.getItem('APPROVE_HIDDEN_COL_LIST');
        if (hidden_columns_index_list) {
            setHiddenColumnsIndexList(JSON.parse(hidden_columns_index_list));
        } else {
            hidden_columns_index_list = [];
            setHiddenColumnsIndexList([]);
        }

        // Set hidden columns array for all the index values
        var hidden_columns_array = [];
        labor_ticket_columns.forEach((item, index) => {
            if (hidden_columns_index_list.includes(index)) {
                hidden_columns_array.push({ value: index, label: item.label });
            }
        });
        setHiddenColumnsArray(hidden_columns_array);
    }, []);

    useEffect(() => {
        load_labor_tickets();
        get_labor_summary();
    }, [selectedFromDate, selectedToDate, hiddenColumnsArray]);

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

                // Get unique employee list
                var unique_employee_list = [];
                response.forEach((item) => {
                    unique_employee_list.push(item.EMPLOYEE_ID);
                });
                setUniqueEmployeeList(unique_employee_list);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const hideColumnsAfterSelection = (arr) => {
        setHiddenColumnsArray(arr);

        // Create a list of columns to hide with the index value
        var columnsToHide = [];
        arr.forEach((item) => {
            columnsToHide.push(item.value);
        });
        setHiddenColumnsIndexList(columnsToHide);
        localStorage.setItem('APPROVE_HIDDEN_COL_LIST', JSON.stringify(columnsToHide));
    }

    const cycleThroughEmployees = (direction) => {
        if (direction == 'All'){
            setLaborTicketData(originalData);
            return;
        }
        let currentEmployeeIndex = uniqueEmployeeList.indexOf(laborTicketData[0].EMPLOYEE_ID);
        if (direction === 'left') {
            if (currentEmployeeIndex === 0) {
                alert('No more employees to the left');
                return;
            }
            let newEmployee = uniqueEmployeeList[currentEmployeeIndex - 1];
            let newData = originalData.filter((item) => {
                return item.EMPLOYEE_ID === newEmployee;
            });
            setLaborTicketData(newData);
        }
        else {
            if (currentEmployeeIndex === uniqueEmployeeList.length - 1) {
                alert('No more employees to the right');
                return;
            }
            let newEmployee = uniqueEmployeeList[currentEmployeeIndex + 1];
            let newData = originalData.filter((item) => {
                return item.EMPLOYEE_ID === newEmployee;
            });
            setLaborTicketData(newData);
        }
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

                        {/* Labor ticket data table */}
                        <div className="d-flex justify-content-between mb-1">
                            <div>
                                <button className="ml-2 btn btn-primary" onClick={() => { cycleThroughEmployees("left") }}><FontAwesomeIcon className="" icon={faArrowLeft} /></button>
                                <button className="ml-2 btn btn-secondary" onClick={() => { cycleThroughEmployees("All") }}>Employees Details</button>
                                <button className="ml-2 btn btn-primary" onClick={() => { cycleThroughEmployees("right") }}><FontAwesomeIcon className="" icon={faArrowRight} /></button>
                            </div>
                            <div className="w-25">
                                <ColumnHideDropDown list={laborTicketColumns} isMulti={true}
                                    text='Hide Col.'
                                    prepareArray={true} placeholder={"Select columns"}
                                    onSelect={(e) => { hideColumnsAfterSelection(e) }}
                                    value={hiddenColumnsArray}
                                />
                            </div>
                        </div>
                        <div className="mx-auto">
                            {
                                isLoading ? <Loading />
                                    :
                                    <MTable
                                        data={laborTicketData}
                                        columnsTypes={laborTicketColumns}
                                        columnsHeaders={['ID', 'Appr.', 'Emp. <br> Name', 'Dept. ID', 'Hrs. <br> Worked', 'Work <br> Time',
                                            'Indirect', 'WO ID', 'Lot <br> Split Sub', 'Operation', 'Notes', 'QA Notes',
                                            'In', 'Out', 'Part Desc.', 'Cust. <br> Name', 'Location', 'Visual <br> Labor ID']}

                                        onChange={(e) => { update_labor_tickets(e) }}
                                        onInstantDataChange={(e) => { null }}
                                        height={window.innerHeight - 450}
                                        hasApproval={true}
                                        hideColumns={hiddenColumnsIndexList}
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