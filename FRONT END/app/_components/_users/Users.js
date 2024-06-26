import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils.js';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable.js";
import Input from "../_ui/input.js";
import NavigationBar from '../_navigation/NavigationBar.js';
import './Users.css';
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
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
            // Break code here
            return;
        }
        setIsLoading(true);
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.USERS);
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

                    data.forEach((item) => {
                        item.ADMIN = item.ADMIN === '1' ? true : false;
                        item.DASHBOARD = item.DASHBOARD === '1' ? true : false;
                        item.SUPER_ADMIN = item.SUPER_ADMIN === '1' ? true : false;
                        item.ALLOWED_WORKING_LOCATION = item.ALLOWED_WORKING_LOCATION === '1' ? true : false;
                        item.ALLOWED_WORKING_TIME = item.ALLOWED_WORKING_TIME === '1' ? true : false;
                        item.ALLOWED_APPROVE_PAGE = item.ALLOWED_APPROVE_PAGE === '1' ? true : false;
                        item.ALLOWED_EDIT_LABOR_TICKET = item.ALLOWED_EDIT_LABOR_TICKET === '1' ? true : false;
                        item.ALLOWED_SET_QA_NOTIFICATION = item.ALLOWED_SET_QA_NOTIFICATION === '1' ? true : false;
                        item.ALLOWED_RECEIPT_ENTRY = item.ALLOWED_RECEIPT_ENTRY === '1' ? true : false;
                        item.ALLOWED_DUPLICATE_RECORD = item.ALLOWED_DUPLICATE_RECORD === '1' ? true : false;
                        item.ALLOWED_CREATE_QUOTE = item.ALLOWED_CREATE_QUOTE === '1' ? true : false;
                        item.ALLOWED_BACKDATE_LABOR_TICKET = item.ALLOWED_BACKDATE_LABOR_TICKET === '1' ? true : false;
                    })
                    setData(data)
                    setIsLoading(false);
                } else {
                    alert(data.message);
                    return null;
                }
            })
            .catch((err) => { console.error(err); setIsLoading(false); });


    }, []);


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
        },
        {
            data: 'LAST_NAME',
            type: 'text',
        },
        {
            data: 'ADMIN',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'SUPER_ADMIN',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'ALLOWED_WORKING_LOCATION',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'ALLOWED_WORKING_TIME',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'ALLOWED_APPROVE_PAGE',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'ALLOWED_EDIT_LABOR_TICKET',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'ALLOWED_SET_QA_NOTIFICATION',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'ALLOWED_RECEIPT_ENTRY',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'ALLOWED_DUPLICATE_RECORD',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'ALLOWED_BACKDATE_LABOR_TICKET',
            type: 'checkbox',
            className: 'htCenter',
        },
        {
            data: 'ALLOWED_CREATE_QUOTE',
            type: 'checkbox',
            className: 'htCenter',
        },

    ]

    const update_users = (data) => {
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.USERS);
        const request_object = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify(data)
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
                    alert(data.message);
                    window.location.reload();
                } else {
                    alert(data.message);
                    return null;
                }
            })
            .catch((err) => { console.error(err); });
    }

    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="m-3">
                    <div className="mt-3" > </div>

                <div className="w-100">
                    {
                        isLoading ? <Loading />
                            :
                            <MTable
                                data={data}
                                columnsTypes={columns}
                                columnsHeaders={['ROWID', 'ID', 'First <br> Name', 'Last <br> Name', 'Admin', 'Super <br> Admin', 'Allowed <br> Working Location', 'Allowed <br> Working Time',
                                    'Allowed <br> Approve Page', 'Allowed Edit <br> Labor Tickets', 'Allowed Set <br> QA Notification', 
                                    'Allowed <br> Receipt Entry', 'Allowed <br> Duplicate Record', 'Allowed <br> Backdate Labor Ticket', 'Allowed <br> Create Quote']}
                                onChange={(e) => { update_users(e) }}
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

export default Users;