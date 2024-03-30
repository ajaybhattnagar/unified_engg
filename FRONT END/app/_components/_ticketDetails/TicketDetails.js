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
    const [access_rights, setAccessRights] = useState({});

    useEffect(() => {
        if (localStorage.getItem("token")) {
            var access_rights = utils.decodeJwt();
            access_rights = access_rights.USER_DETAILS
            setAccessRights(access_rights);
        }

    }, []);


    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const transaction_type = urlParams.get('transaction_type');
        const transaction_id = urlParams.get('transaction_id');

        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }

        var url = null;
        if (transaction_type === 'labor_ticket') {
            url = appConstants.BASE_URL.concat(appConstants.GET_LABOR_TICKET_DETAIL_BY_ID).concat(transaction_id);
        }
        else if (transaction_type === 'purchase_order') {
            url = appConstants.BASE_URL.concat(appConstants.GET_PURCHASE_ORDER_NOTIFICATION_BY_ID).concat(transaction_id);
        }
        else {
            url = appConstants.BASE_URL.concat(appConstants.GET_LABOR_TICKET_DETAIL_BY_ID).concat(transaction_id);
        }


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

    const duplicate_labor_ticket = (id) => {
        if (confirm('Are you sure you want to duplicate this transaction?')) {
            fetch(appConstants.BASE_URL.concat(appConstants.DUPLICATE_LABOR_TICKET).concat(id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem("token")
                }
            }).then(res => res.json())
                .then((response) => {
                    alert(response.message);
                    window.opener.location.reload(false);
                    window.focus()
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        else {
            return;
        }
    }

    const delete_labour_ticket = (id) => {
        if (ticketDetails.APPROVED === 'true' || ticketDetails.APPROVED === true) {
            alert('Approved transactions cannot be deleted');
            return;
        }
        if (ticketDetails.VISUAL_LAB_TRANS_ID !== null) {
            alert('Visual transactions cannot be deleted');
            return;
        }

        if (confirm('Are you sure you want to delete this transaction?')) {
            fetch(appConstants.BASE_URL.concat(appConstants.DELETE_LABOR_TICKET).concat(id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem("token")
                }
            }).then(res => res.json())
                .then((response) => {
                    alert(response.message);
                    window.location.reload();
                    window.opener.location.reload(false);
                    window.focus()
                })
                .catch((error) => {
                    console.log(error);
                });
        }
        else {
            return;
        }
    }

    const render = () => {

        return (
            <div>
                <NavigationBar />

                <div className="d-flex justify-content-between">

                    <div>
                        {
                            !isLoading ? ticketDetails ?
                                <div className="container-fluid mt-1">
                                    <div>
                                        <table className='table table-sm small mt-3'>
                                            <thead className="thead-dark">
                                                <tr>
                                                    <th scope="col">Field</th>
                                                    <th scope="col">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    Object.keys(ticketDetails).map((key, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <td className="font-weight-bold">{key}</td>
                                                                <td>{ticketDetails[key]}
                                                                    {access_rights.ALLOWED_DUPLICATE_RECORD === '1' && key === 'TRANSACTION_ID' ?
                                                                        <span variant="primary" className="badge badge-success ml-3 cusor-hand"
                                                                            onClick={() => { duplicate_labor_ticket(ticketDetails[key]) }}>
                                                                            Duplicate
                                                                        </span>
                                                                        : null
                                                                    }
                                                                    {
                                                                        key === 'TRANSACTION_ID' ?
                                                                            <span variant="primary" className="badge badge-danger ml-3 cusor-hand"
                                                                                onClick={() => { delete_labour_ticket(ticketDetails[key]) }}>
                                                                                Delete
                                                                            </span>
                                                                            : null
                                                                    }
                                                                </td>
                                                            </tr>
                                                        )
                                                    })

                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                :
                                <div>No records</div>
                                :
                                <Loading />
                        }
                    </div>

                    <div>
                        {
                            document ?
                                <div className="card-footer">
                                    <div className="">
                                        {/* Map document array */}
                                        {
                                            document.map((doc, index) => {
                                                return (
                                                    doc.FILE_PATH == "" ? null :
                                                        <div className="m-2" key={index}>
                                                            <Button variant="primary" onClick={() => { open_document(doc.FILE_PATH) }}>{doc.TYPE}</Button>
                                                        </div>
                                                )
                                            })
                                        }
                                    </div>
                                </div>
                                : null
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

export default TicketDetails;


