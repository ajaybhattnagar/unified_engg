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
    const [clockIn, setClockIn] = useState(null);

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
                // Setting clock in date
                if (response.TICKET_DETAILS.length > 0) {
                    // 04/10/24 12:00:00 AM to format 2024-04-10
                    var formattedClockInDate = response.TICKET_DETAILS[0].CLOCK_IN.split(' ')[0].split('/').reverse().join('-');
                    setClockIn(formattedClockInDate);
                }

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

    const backdate_transaction = () => {
        if (access_rights.ALLOWED_BACKDATE_LABOR_TICKET === '0' && access_rights.SUPER_ADMIN === '0') {
            alert('You do not have permission to backdate this transaction!');
            return;
        }


        const diffDays = utils.dateDiffDays(clockIn, ticketDetails['CREATE_DATE']) - 1;
        var dateOffset = (24 * 60 * 60 * 1000) * diffDays
        if (diffDays < 0) {
            alert('Cannot backdate to future date!');
            return;
        }
        if (diffDays > 14) {
            alert('Cannot backdate more than 3 days!');
            return;
        }
        else {
            if (confirm('Are you sure you want to backdate this transaction?')) {
                // Add time from CLOCK IN to ClockIN
                var _clockIn = clockIn + ' ' + ticketDetails['CLOCK_IN'].split(' ')[1]
                var _clockOut = new Date(ticketDetails['CLOCK_OUT']);
                _clockOut.setTime(_clockOut.getTime() - dateOffset);

                // Convert _clockOut to string
                _clockOut = _clockOut.toISOString().split('T')[0] + ' ' + _clockOut.toTimeString().split(' ')[0];

                // Update clock in
                utils.updateLaborTicketsField(ticketDetails['TRANSACTION_ID'], "CLOCK_IN", _clockIn)
                    .then((response) => {
                        console.log(response);

                        // Update clock out
                        utils.updateLaborTicketsField(ticketDetails['TRANSACTION_ID'], "CLOCK_OUT", _clockOut)
                            .then((response) => {

                                utils.updateLaborTicketsField(ticketDetails['TRANSACTION_ID'], "TRANSACTION_DATE", _clockIn)
                                    .then((response) => {
                                        console.log(response);
                                        window.location.reload();
                                    })
                                    .catch((error) => {
                                        alert(error.message);
                                        console.log(error);
                                    });
                            })
                            .catch((error) => {
                                alert(error.message);
                                console.log(error);
                            });

                    })
                    .catch((error) => {
                        alert(error.message);
                        console.log(error);
                    });

            }
        }
    }

    const render = () => {
        var diffDays = 0;
        try {
            diffDays = utils.dateDiffDays(clockIn, ticketDetails['CREATE_DATE']) - 1;
        }
        catch (e) {
            diffDays = 1;
        }

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
                    {
                        !isLoading ? ticketDetails ?

                            <div className="d-flex flex-column ">
                                {access_rights.ALLOWED_DUPLICATE_RECORD === '1' ?
                                    <button className="btn btn-outline-success mt-1"
                                        onClick={() => { duplicate_labor_ticket(ticketDetails['TRANSACTION_ID']) }}>
                                        Duplicate
                                    </button>
                                    : null
                                }
                                {
                                    <button className="btn btn-outline-danger mt-1"
                                        onClick={() => { delete_labour_ticket(ticketDetails['TRANSACTION_ID']) }}>
                                        Delete
                                    </button>
                                }
                                {
                                    <div className="mt-1">
                                        <Input disabled={diffDays > 3 ? true : false} text="Back-date Trans." type={'date'}
                                            value={clockIn} onChange={(e) => setClockIn(e)}
                                            isUpdateButtonDisabled={false}
                                            onUpdateButtonClick={() => { backdate_transaction() }}
                                        />
                                    </div>
                                }
                            </div>
                            : null : null
                    }

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


