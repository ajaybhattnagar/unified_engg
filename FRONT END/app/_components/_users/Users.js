import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils.js';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable.js";
import Input from "../_ui/input.js";
import NavigationBar from '../_navigation/NavigationBar.js';
import './Users.css';
import { columns } from '../../_columns/parcelsDisplayColumns.js';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown.js";
import Loading from "../_ui/loading.js";

const isBrowser = typeof window !== `undefined`

// response.forEach((item) => {
//     item.APPROVED = item.APPROVED === 'true' ? true : false;
// })

const Users = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [selectedFromDate, setSelectedFromDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [selectedToDate, setSelectedToDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        setIsLoading(true);
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.GET_ALL_USERS);
        const request_object = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
            },
        }
        fetch(url, request_object)
            .then((res) => {
                if (res.status === 200) {
                    response_status = 200;
                    return res.json();
                }
                else {
                    response_status = 400;
                    alert(res.json());
                }
            })
            .then((data) => {
                if (response_status === 200) {
                    console.log(data);
                    setData(data)
                    setIsLoading(false);
                } else {
                    alert(data.message);
                    return null;
                }
            })
            .catch((err) => { console.error(err); setIsLoading(false);});


    }, []);


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

    const columns = [
        {
            data: 'ROWID',
            type: 'numeric',
            readOnly: true
        },
        {
            data: 'ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'FIRST_NAME',
            type: 'text',
            readOnly: true
        },
        {
            data: 'LAST_NAME',
            type: 'text',
            readOnly: true
        },
        {
            data: 'DASHBOARD',
            type: 'text',
            readOnly: true
        },
        {
            data: 'ADMIN',
            type: 'text',
            readOnly: true
        },
        {
            data: 'SUPER_ADMIN',
            type: 'text',
            readOnly: true
        },
        {
            data: 'ALLOWED_WORKING_LOCATION',
            type: 'text',
            readOnly: true
        },
        {
            data: 'ALLOWED_WORKING_TIME',
            type: 'text',
            readOnly: true
        },
        {
            data: 'ALLOWED_APPROVE_PAGE',
            type: 'text',
            readOnly: true
        },
        {
            data: 'ALLOWED_EDIT_LABOR_TICKETS',
            type: 'text',
            readOnly: true
        },
    ]

    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="m-3">
                    <div className="mx-auto">
                        {
                            isLoading ? <Loading />
                                :
                                <MTable
                                    data={data}
                                    columnsTypes={columns}
                                    columnsHeaders={['ID', 'First Name', 'Last Name', 'Dashboard', 'Admin', 'Super Admin', 'Allowed Working Location', 'Allowed Working Time', 'Allowed Approve Page', 'Allowed Edit Labor Tickets']}
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

export default Users;