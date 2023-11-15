import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Home.css';
import Loading from "../_ui/loading";
import MTable from "../_ui/materialTable";

const isBrowser = typeof window !== `undefined`

const Home = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }

        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.DASHBOARD);
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
                    setIsLoading(false);
                    setData(data);
                } else {
                    alert(data.message);
                    setIsLoading(false);
                    return null;
                }
            })
            .catch((err) => console.error(err));
    }, []);

    const columns = [
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
            data: 'QA_NOTES',
            type: 'text',
        },
    ]
    console.log(data.ACTIVE_LABOR_TICKETS);


    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="m-3">
                    <div className="mx-auto">
                        {
                            isLoading ? <Loading />
                                :
                                data && data.ACTIVE_LABOR_TICKETS && data.ACTIVE_LABOR_TICKETS.length === 0 ? <h1>No active labor tickets</h1>
                                    :
                                    <MTable
                                        data={data.ACTIVE_LABOR_TICKETS}
                                        columnsTypes={columns}
                                        // columnsHeaders={['ID', 'Work order', 'Lot Split Sub', 'Part Description', 'Customer ID', 'In Date', 'In Time', 'Out Date', 'Out Time', 'Hours worked', 'Description', 'QA Notes', 'Approved']}
                                        // onChange={(e) => { update_labor_tickets(e) }}
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

export default Home;