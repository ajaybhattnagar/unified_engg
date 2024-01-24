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
import jwt_decode from "jwt-decode";

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
            .catch((err) => { console.error(err), setIsLoading(false); });
    }, [selectedFromDate, selectedToDate]);

    const columns = [
        {
            data: 'UNI_TRANSACTION_ID',
            type: 'numeric',
            readOnly: true
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
            data: 'INDIRECT_CODE',
            type: 'text',
            readOnly: true
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

    const create_labor_ticket_visual = () => {
        //   post data to visual api
        setIsLoading(true);
        var url = appConstants.VISUAL_API.concat(appConstants.CREATE_LABOR_TICKET_VISUAL);
        var response_status = 0;

        var token = localStorage.getItem('token');
        const decoded = jwt_decode(token);

        // Modify data to match visual api
        var _data = data.forEach((item) => {
            item.MULTIPLIER = item.REGULAR_TIME === '1' ? 1 : item.DOUBLE_TIME === '1' ? 2 : item.OVER_TIME === '1' ? 1.5 : 1;
        })

        var post_data = {
            "USERNAME": localStorage.getItem('EMPLOYEE_ID'),
            "PASSWORD": decoded.PASSWORD,
            "DATABASE": localStorage.getItem('DATABASE'),
            "SITE_ID": localStorage.getItem('SITE'),
            "LABOR_TICKET_DETAILS": data
        }
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-access-token": localStorage.getItem('token'),
                "allow-origin": "*", //CORS
            },
            body: JSON.stringify(post_data)
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
                    alert(data.Message);
                    window.location.reload();
                    return null;
                } else {
                    setIsLoading(false);
                    alert(data.Message);
                    return null;
                }
            })
            .catch((err) => { console.error(err), setIsLoading(false); });

    }

    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="m-3">
                    <div className="mx-auto scrollBar">
                        {
                            isLoading ? <Loading />
                                :
                                <MTable
                                    data={data}
                                    columnsTypes={columns}
                                    columnsHeaders={['ID', 'Type', 'Work Order', 'Lot', 'Split',
                                        'Sub', 'Operation Seq', 'Indirect ID', 'In Time', 'Out Time', 'Hours', 'Notes', 'Employee ID']}
                                    onChange={(e) => { update_labor_tickets(e) }}
                                />
                        }
                        {
                            <div className='d-flex mx-auto justify-content-center fixed-bottom '>
                                <button type="button" className="btn btn-outline-primary mb-2" disabled={isLoading} onClick={() => { create_labor_ticket_visual() }}>Create Labor Tickets in Visual</button>
                            </div>
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