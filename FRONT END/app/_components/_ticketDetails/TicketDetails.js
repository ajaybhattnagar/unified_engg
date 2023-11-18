import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils.js';
import { appConstants } from '../../_helpers/consts.js';
import Input from "../_ui/input.js";
import NavigationBar from '../_navigation/NavigationBar.js';
import './TicketDetails.css';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown.js";
import Loading from "../_ui/loading.js";

const isBrowser = typeof window !== `undefined`

const TicketDetails = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get url params

    }, []);


    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const transaction_id = urlParams.get('transaction_id');

        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        const url = appConstants.BASE_URL.concat(appConstants.GET_LABOR_TICKET_DETAIL_BY_ID).concat(transaction_id);
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem("token")
            }
        }).then(res => res.json())
            .then((response) => {
                setData(response[0]);
                setIsLoading(false);

            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });

    }, []);
    console.log(data);

    const render = () => {

        return (
            <div>
                <NavigationBar />
                {
                    !isLoading ?
                        data ?
                            <div className="container-fluid mt-1">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="card">
                                            <div className="card-header">
                                                <h4 className="card-title">Ticket Details</h4>
                                            </div>
                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table className="table table-bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Work Order</th>
                                                                <th>Lot/Split/Sub</th>
                                                                <th>Operation</th>
                                                                <th>Employee</th>
                                                                <th>Start Time</th>
                                                                <th>Hours</th>
                                                                <th>QA Notes</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>{data.WORKORDER_BASE_ID}</td>
                                                                <td>{data.LOT_SPLIT_SUB}</td>
                                                                <td>{data.RESOURCE_ID}</td>
                                                                <td>{data.EMPLOYEE_ID}</td>
                                                                <td>{data.CLOCK_IN_DATE} {data.CLOCK_IN_TIME}</td>
                                                                <td>{data.HOURS_WORKED_HRS.toFixed(2)}</td>
                                                                <td>{data.QA_NOTES}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="card-footer">
                                                <div className="d-flex">
                                                    {
                                                        data.IMAGE_PATH ?
                                                            <div className="mr-2">
                                                                <Button variant="primary" onClick={() => { window.open(data.IMAGE_PATH, "_blank") }}>Image</Button>
                                                            </div>
                                                            : null
                                                    }
                                                    {
                                                        data.DOCUMENT_PATH ?
                                                            <div className="">
                                                                <Button variant="primary" onClick={() => { window.open(data.IMAGE_PATH, "_blank") }}>Document</Button>
                                                            </div>
                                                            :
                                                            null
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            :
                            <div>No records</div>

                        :
                        <Loading />
                }


            </div>
        );
    }

    return (
        render()
    );
};

export default TicketDetails;