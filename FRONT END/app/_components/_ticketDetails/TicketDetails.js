import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils.js';
import { appConstants } from '../../_helpers/consts.js';
import Input from "../_ui/input.js";
import NavigationBar from '../_navigation/NavigationBar.js';
import './TicketDetails.css';
import { Button } from "react-bootstrap";
import Loading from "../_ui/loading.js";

const isBrowser = typeof window !== `undefined`

const TicketDetails = () => {
    const navigate = useNavigate();
    const [ticketDetails, setTicketDetails] = useState([]);
    const [document, setDocument] = useState(null);
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
                setTicketDetails(response.TICKET_DETAILS[0]);
                setDocument(response.DOCUMENTS);
                setIsLoading(false);

            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });

    }, []);

    const open_document = (path) => {
        utils.open_document(path);
    }


    const render = () => {

        return (
            <div>
                <NavigationBar />
                {
                    !isLoading ?
                        ticketDetails ?
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
                                                                <td>{ticketDetails.WORKORDER_BASE_ID}</td>
                                                                <td>{ticketDetails.LOT_SPLIT_SUB}</td>
                                                                <td>{ticketDetails.RESOURCE_ID}</td>
                                                                <td>{ticketDetails.EMPLOYEE_ID}</td>
                                                                <td>{ticketDetails.CLOCK_IN_DATE} {ticketDetails.CLOCK_IN_TIME}</td>
                                                                <td>{ticketDetails.HOURS_WORKED_HRS ? ticketDetails.HOURS_WORKED_HRS.toFixed(2) : null}</td>
                                                                <td>{ticketDetails.QA_NOTES}</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            {
                                                document ?
                                                    <div className="card-footer">
                                                        <div className="d-flex">
                                                            {/* Map document array */}
                                                            {
                                                                document.map((doc, index) => {
                                                                    return (
                                                                        doc.FILE_PATH == "" ? null :
                                                                            <div className="mr-2" key={index}>
                                                                                <Button variant="primary" onClick={() => { open_document(doc.FILE_PATH) }}>{doc.TYPE}</Button>
                                                                            </div>
                                                                    )
                                                                })
                                                            }
                                                            {/* {
                                                                document.IMAGE_PATH ?
                                                                    <div className="mr-2">
                                                                        <Button variant="primary" onClick={() => { open_document(document.IMAGE_PATH) }}>Image</Button>
                                                                    </div>
                                                                    : null
                                                            }
                                                            {
                                                                document.DOCUMENT_PATH ?
                                                                    <div className="">
                                                                        <Button variant="primary" onClick={() => { open_document(document.DOCUMENT_PATH) }}>Document</Button>
                                                                    </div>
                                                                    :
                                                                    null
                                                            } */}
                                                        </div>
                                                    </div>
                                                    :
                                                    null
                                            }
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