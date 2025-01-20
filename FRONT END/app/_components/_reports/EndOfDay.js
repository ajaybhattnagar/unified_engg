import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Reports.css';
import { Button, Col } from "react-bootstrap";
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";
import KpiCard from "../_ui/kpiCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport, faPrint, faDownload } from "@fortawesome/free-solid-svg-icons";
import { LabNotes, QaNotes } from '../_ui/NotesValidation';
import ColumnHideDropDown from "../_ui/columnHideDropDown.js";

const isBrowser = typeof window !== `undefined`

const EOD = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [selectedFromDate, setSelectedFromDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [selectedToDate, setSelectedToDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [isLoading, setIsLoading] = useState(false);
    const [totalHours, setTotalHours] = useState(0);
    const [hiddenColumnsArray, setHiddenColumnsArray] = useState([]);
    const [hiddenColumnsIndexList, setHiddenColumnsIndexList] = useState([]);
    const [columns, setColumns] = useState([]);

    const isAllowedEditLaborTicket = useRef(false);


    useEffect(() => {
        const columns = [
            {
                data: 'TRANSACTION_ID',
                type: 'numeric',
                readOnly: true,
                renderer: safeHtmlRenderer,
                width: 15,
                label: 'ID'
            },
            {
                data: 'WORKORDER_BASE_ID',
                type: 'text',
                readOnly: true,
                width: 40,
                label: 'Work order'
            },
            // {
            //     data: 'LOT_SPLIT_SUB',
            //     type: 'text',
            //     readOnly: true,
            //     width: 25,
            //     label: 'Lot Split Sub'

            // },
            {
                data: 'PART_DESC',
                type: 'text',
                readOnly: true,
                label: 'Part Desc'
            },
            // {
            //     data: 'CUSTOMER_ID',
            //     type: 'text',
            //     readOnly: true,
            //     label: 'Customer ID'
            // },
            // {
            //     data: 'RESOURCE_DESCRIPTION',
            //     type: 'text',
            //     readOnly: true,
            //     label: 'Operation'
            // },
            // {
            //     data: 'INDIRECT_ID',
            //     type: 'text',
            //     readOnly: true,
            //     width: 20,
            //     label: 'Indirect'
            // },
            {
                data: 'HOURS_WORKED',
                type: 'numeric',
                width: 15,
                label: 'Hrs worked'
            },
            {
                data: 'WORK_TIME',
                type: 'dropdown',
                source: ['RT', 'OT', 'DT'],
                width: 15,
                label: 'Work Time'
            },
            {
                data: 'LAB_DESC',
                type: 'text',
                editor: LabNotes,
                label: 'Notes'
            },
            // {
            //     data: 'QA_NOTES',
            //     type: 'text',
            //     editor: QaNotes,
            //     label: 'QA Notes'
            // },
            {
                data: 'CLOCK_IN',
                type: 'text',
                readOnly: true,
                width: 15,
                label: 'In'
            },
            // {
            //     data: 'CLOCK_OUT',
            //     type: 'text',
            //     readOnly: true,
            //     width: 15,
            //     label: 'Out'
            // },
            {
                data: 'APPROVED',
                type: 'checkbox',
                className: 'htCenter',
                readOnly: true,
                width: 15,
                label: 'Approved'
            }
        ];
        setColumns(columns);

        if (localStorage.getItem("token")) {
            var access_rights = utils.decodeJwt();
            access_rights = access_rights.USER_DETAILS

            if (access_rights.ALLOWED_EDIT_LABOR_TICKET === '1') {
                isAllowedEditLaborTicket.current = true;
            }
        }

        // Get hidden columns from local storage
        var hidden_columns_index_list = localStorage.getItem('EOD_HIDDEN_COL_LIST');
        if (hidden_columns_index_list) {
            setHiddenColumnsIndexList(JSON.parse(hidden_columns_index_list));
        } else {
            hidden_columns_index_list = [];
        }

        // Set hidden columns array for all the index values
        var hidden_columns_array = [];
        columns.forEach((item, index) => {
            if (hidden_columns_index_list.includes(index)) {
                hidden_columns_array.push({ value: index, label: item.label });
            }
        });
        setHiddenColumnsArray(hidden_columns_array);
    }, []);

    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
            return;
        }
        setIsLoading(true);
        var emp_id = localStorage.getItem("MIMIC_EMPLOYEE_ID") || localStorage.getItem("EMPLOYEE_ID")
        utils.getLaborTickets(selectedFromDate, selectedToDate, emp_id, 'ALL')
            .then((response) => {
                if (response.length > 0) {
                    var total_hours = 0;
                    response.forEach((item) => {
                        item.APPROVED = item.APPROVED === 'true' ? true : false;
                        total_hours += parseFloat(item.HOURS_WORKED);

                        //If workorder is empty then replace with indirect id
                        //And merge workorder and lot split sub
                        if (item.WORKORDER_BASE_ID === '') {
                            item.WORKORDER_BASE_ID = item.INDIRECT_CODE;
                        } else {
                            item.WORKORDER_BASE_ID = item.WORKORDER_BASE_ID.concat(' / ', item.LOT_SPLIT_SUB).concat(' / ', item.RESOURCE_ID);
                        }
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
    }, [selectedFromDate, selectedToDate, hiddenColumnsArray]);

    const update_labor_tickets = (data) => {
        if (isAllowedEditLaborTicket.current) {

            // Update OT, DT, RT to overtime, double time, regular time
            data.forEach((item) => {
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

    const download_csv = async (type) => {
        var url = appConstants.BASE_URL.concat(appConstants.GET_FORMATTED_CSV_FROM_EOD).concat(type);
        var emp_id = localStorage.getItem("MIMIC_EMPLOYEE_ID") || localStorage.getItem("EMPLOYEE_ID")
        var response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem("token")
            },
            body: JSON.stringify({
                "FROM_DATE": selectedFromDate,
                "TO_DATE": selectedToDate,
                "EMPLOYEE_ID": localStorage.getItem("MIMIC_EMPLOYEE_ID") || localStorage.getItem("EMPLOYEE_ID"),
                "APPROVED": 'ALL'
            })
        });
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = 'unknown';

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/);
            if (match && match[1]) {
                fileName = match[1];
            }
        } else {
            console.warn('Content-Disposition header is missing');
        }

        const blob = await response.blob();
        url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);


    }

    const hideColumnsAfterSelection = (arr) => {
        setHiddenColumnsArray(arr);

        // Create a list of columns to hide with the index value
        var columnsToHide = [];
        arr.forEach((item) => {
            columnsToHide.push(item.value);
        });
        setHiddenColumnsIndexList(columnsToHide);
        localStorage.setItem('EOD_HIDDEN_COL_LIST', JSON.stringify(columnsToHide));
    }

    const render = () => {
        // var columnsHeaders = ['ID', 'Work <br> order', 'Lot <br> Split Sub', 'Part <br> Desc', 'Customer ID', 'Operation',
        //     'Indirect', 'Hrs <br> worked', 'Work <br> Time', 'Notes', 'QA Notes',
        //     'In', 'Out', 'Approved']
        var columnsHeaders = ['ID', 'Work order <br> Indirect', 'Part <br> Desc', 
             'Hrs <br> worked', 'Work <br> Time', 'Notes', 'In', 'Approved']
        return (
            <div>
                <NavigationBar />
                <div className="m-3">

                    <div className="d-flex justify-content-between mb-3">

                        <div>
                            <div className="d-flex">
                                <div className="d-flex">
                                    <div className="w-15 mr-3"><Input text="From" type={'date'} value={selectedFromDate} onChange={(e) => setSelectedFromDate(e)} /></div>
                                    <div className="w-15"><Input text="To" type={'date'} value={selectedToDate} onChange={(e) => setSelectedToDate(e)} /></div>
                                </div>
                                <div className="ml-3">
                                    <button type="button" className="btn btn-outline-success">
                                        Total Hours <span className="ml-2 badge badge-light">{totalHours}</span>
                                    </button>
                                </div>

                                {
                                    data && data.length > 0 ?
                                        <div className="w-20 ml-3">
                                            <Button data-toggle="tooltip" title="Download" className='mr-2' onClick={() => download_csv("csv")}>
                                                <FontAwesomeIcon className="" icon={faDownload} /> CSV </Button>
                                        </div>
                                        : null
                                }

                                {
                                    data && data.length > 0 ?
                                        <div className="w-20 ml-1">
                                            <Button data-toggle="tooltip" title="Download" className='mr-2' onClick={() => download_csv("pdf")}>
                                                <FontAwesomeIcon className="" icon={faDownload} /> PDF </Button>
                                        </div>
                                        : null
                                }
                            </div>
                        </div>

                        <div className="w-25">
                            <ColumnHideDropDown list={columns} isMulti={true}
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
                                    data={data}
                                    columnsTypes={columns}
                                    columnsHeaders={columnsHeaders} onChange={(e) => { update_labor_tickets(e) }}
                                    onInstantDataChange={(e) => { update_total_hours(e) }}
                                    height={window.innerHeight - 200}
                                    hideColumns={hiddenColumnsIndexList}
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