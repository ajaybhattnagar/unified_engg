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

const LabourSummary = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [selectedFromDate, setSelectedFromDate] = useState(utils.convertTimeStampToDateForInputBox(new Date() - 3 * 24 * 60 * 60 * 1000));
    const [selectedToDate, setSelectedToDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFilterBy, setSelectedFilterBy] = useState({ value: 'VISUAL', label: 'Visual' });

    const isAllowedEditLaborTicket = useRef(false);


    useEffect(() => {
        var access_rights = utils.decodeJwt();
        access_rights = access_rights.USER_DETAILS

        if (access_rights.ALLOWED_EDIT_LABOR_TICKET === '1') {
            isAllowedEditLaborTicket.current = true;
        }


    }, []);

    const get_labour_summary_report = () => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        setIsLoading(true);
        var url = appConstants.BASE_URL.concat(appConstants.LABOUR_SUMMARY_REPORT).concat("from_date=").concat(selectedFromDate).concat("&to_date=").concat(selectedToDate).concat("&filter_type=").concat(selectedFilterBy.value);
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem("token")
            }
        }).then(res => res.json())
            .then((response) => {
                setData(response);
                setIsLoading(false);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    const columns = [
        {
            data: 'Employee ID',
            type: 'numeric',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: ' First Name',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Last Name',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Regular Hours',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Overtime (1.5)',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Double Time (2)',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Vacation Hours',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Vacation ($)',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Bonus ($)',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Stat. Hours',
            type: 'numeric',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Advance pay ($)',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Adv. Hours',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'External ID',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Salary Regular Hours',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Salary Overtime Hours',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        },
        {
            data: 'Salary Double Time Hours',
            type: 'text',
            readOnly: true,
            className: 'htCenter',
        }
    ]

    const render = () => {
        var filter_options = [
            {
                value: 'VISUAL',
                label: 'Visual'
            },
            {
                value: 'APPROVED',
                label: 'Approved'
            },
            {
                value: 'NOT_APPROVED',
                label: 'Not Approved'
            },
            {
                value: 'ALL',
                label: 'All'
            },]

        return (
            <div>
                <NavigationBar />
                <div className="m-3">
                    <div className="d-flex justify-content-between mb-3">
                        <div className="d-flex mb-3 w-75">
                            <div className="w-20 mr-3"><Input text="From" type={'date'} value={selectedFromDate} onChange={(e) => setSelectedFromDate(e)} /></div>
                            <div className="w-20"><Input text="To" type={'date'} value={selectedToDate} onChange={(e) => setSelectedToDate(e)} /></div>
                            {/* Dropdown for filters */}
                            <div className="w-50 ml-3">
                                <DropDown list={filter_options} isMulti={false}
                                    text='Filter by:'
                                    prepareArray={false} placeholder={"Select Operation"}
                                    onSelect={(e) => { setSelectedFilterBy(e), setSelectedResourceString(e.label) }}
                                    value={selectedFilterBy}
                                />
                            </div>
                            <div className="w-20 ml-3"><button className="btn btn-primary" onClick={() => get_labour_summary_report()}>Search</button></div>
                        </div>
                        {
                            data && data.length > 0 ?
                                <div className="w-20 ml-3">
                                    <Button data-toggle="tooltip" title="Download" className='mr-2' onClick={() => utils.exportExcel(data, "labour_summary")}>
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
                                    columnsHeaders={['Employee ID', 'First <br> Name', 'Last <br> Name', 'Regular <br> Hours', 'Overtime <br> (1.5)', 'Double <br> Time (2)',
                                        'Vacation <br> Hours', 'Vacation ($)', 'Bonus ($)', 'Stat. Hours', 'Advance <br> pay ($)', 'Adv. <br> Hours', 'External ID',
                                        'Salary <br> Regular Hours', 'Salary <br> Overtime Hours', 'Salary <br> Double Time Hours']}
                                    height={window.innerHeight - 200}
                                    colWidths={[10, 10, 10, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]}
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

export default LabourSummary;