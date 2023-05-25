import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { useParams } from 'react-router-dom';
import { appConstants } from '../../_helpers/consts.js';
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import NavigationBar from '../_navigation/NavigationBar';
import './Parcel.css';
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";
import UpdateFields from "./updateFields";

import EditFeesModal from "../_ui/editFeesModal";
import EditNotesModal from "../_ui/editNotesModal";
import RedeemModal from "../_ui/redeemModal";
import EditDocumentsModal from "../_ui/editDocumentsModal";
import EditPaymentsModal from "../_ui/editPaymentsModal";


const Parcel = () => {
    const navigate = useNavigate();
    const params = useParams();
    const parcelId = useRef(params.parcel_id);
    const [data, setData] = useState(null);
    const [parcelDetails, setParcelDetails] = useState(null);
    const [parcelFees, setParcelFees] = useState(null);
    const [parceNotes, setParcelNotes] = useState(null);
    const [selectedFee, setSelectedFee] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [redeemLevel, setRedeemLevel] = useState(null);
    const [parcelPayments, setParcelPayments] = useState(null);
    const [parcelDocuments, setParcelDocuments] = useState(null);

    // Modal States 
    const [showEditFeeModal, setEditFeeModal] = useState(false);
    const [newFeeModal, setNewFeeModal] = useState(false);
    const [showNewNotesModal, setNewNotesModal] = useState(false);
    const [showRedeemModal, setRedeemModal] = useState(0);
    const [showNewDocumentsModal, setNewDocumentsModal] = useState(false);
    const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);

    const [refresh, setRefresh] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        get_parcel_details();
    }, [refresh]);

    const get_parcel_details = (e) => {
        setIsLoading(true);
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.GET_PARCEL_DETAILS).concat(parcelId.current);
        fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
            },
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
                    setData(data);
                    setParcelDetails(data.parcel_details[0]);
                    setParcelFees(data.parcel_fees);
                    setParcelNotes(data.parcel_notes);
                    setParcelPayments(data.parcel_payments);
                    setParcelDocuments(data.parcel_documents);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));
    }

    const navigate_history_page = () => {
        navigate(`/parcel/audit/${parcelId.current}`);
    }

    const render_parcel_details = () => {
        if (parcelDetails) {
            return (
                <div>
                    {<UpdateFields parcel_data={parcelDetails} />}
                    <table className='table table-sm small mt-3'>
                        <thead className="thead-dark">

                        </thead>
                        <tbody>
                            {
                                Object.keys(parcelDetails).map((key, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className="font-weight-bold">{key}</td>
                                            <td>{parcelDetails[key]}</td>
                                        </tr>
                                    )
                                })

                            }
                        </tbody>
                    </table>
                </div>
            )

        }
    }

    const open_payoff_report = () => {
        var url = window.location.origin.concat(`/parcel/payoff_report/`).concat(parcelId.current)
        window.open(url, "PRINT", "height=1200,width=800");
    }

    const render_parcel_header = () => {
        if (parcelDetails) {
            return (
                <div className="">

                    <div className="mt-3 d-flex justify-content-between" >
                        <div className='ml-3 d-flex'>
                            <div className='mr-3'>
                                <img alt="Parcel" className='parcel-image' width={400} height={400} />
                            </div>
                            <div className="col">
                                <span className='ml-3 row'>{parcelDetails['Location Full Street Address']},</span>
                                <span className='ml-3 row'>{parcelDetails['County']},</span>
                                <span className='ml-3 row'>{parcelDetails['Municipality']},</span>
                                <span className='ml-3 row'>{parcelDetails['State']}</span>
                            </div>
                        </div>

                        {/* Status goes here */}
                        <div className='col-lg-2 offset-md-3'>
                            <div className="">
                                <DropDown value={1} placeholder={utils.getStatusbyValue(parcelDetails['Status'])}
                                    list={utils.statusArray()}
                                    isMulti={false}
                                    prepareArray={false}
                                    onSelect={(e) => utils.updateStatusParcelID(parcelId.current, e.value, parcelDetails['Status'])}
                                />
                            </div>

                        </div>
                    </div>

                    <div className="d-flex justify-content-end mr-3">
                        <button className="btn btn-outline-success btn-sm mr-2" disabled={parcelDetails['Status'] < 10 ? false : true} onClick={() => openRedeemModal(10)}>Redeem</button>
                        <button className="btn btn-outline-secondary btn-sm mr-2" disabled={parcelDetails['Status'] < 9 ? false : true} onClick={() => openRedeemModal(9)}>Partial Redemption</button>
                        <button className="btn btn-outline-primary btn-sm mr-2" onClick={() => open_payoff_report()}>Payoff Report</button>
                        <button className="btn btn-outline-secondary btn-sm mr-2" onClick={() => navigate_history_page()}>History</button>
                        <button className="btn btn-outline-success btn-sm" onClick={() => get_parcel_details()}>Refresh</button>

                    </div>
                </div >


            )
        }
    }

    const openModalFeeEdit = (data) => {
        setNewFeeModal(false)
        setSelectedFee(data);
        setEditFeeModal(true)
    }

    const openModalNotesNew = (data) => {
        setNewNotesModal(true)
    }

    const openModalDocumentsNew = (data) => {
        setNewDocumentsModal(true)
    }

    const openModalPaymentEdit = (data) => {
        setSelectedPayment(data);
        setShowEditPaymentModal(true)
    }

    const openModalFeeNew = (data) => {
        setNewFeeModal(true)
        setSelectedFee(data);
        setEditFeeModal(true)
    }

    const openRedeemModal = (redeem_level) => {
        setRedeemLevel(redeem_level)
        setRedeemModal(true)
    }

    const render_parcel_fees = () => {
        if (parcelFees) {
            return (
                <div className="mr-4 container">
                    <div className="d-flex justify-content-between">
                        <span className="badge rounded-pill bg-dark col-md-2 text-white align-middle m-1">Fees</span>
                        <a href="#" onClick={() => openModalFeeNew()} ><FontAwesomeIcon className="" icon={faPlusCircle} /> Add </a>
                    </div>
                    {
                        parcelFees.length > 0 ?
                            <table className='table table-sm small table-hover"'>
                                <thead className="thead-dark">
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th>Category</th>
                                        <th>Effective Date</th>
                                        <th>Effective End Date</th>
                                        <th>Rate</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        parcelFees.map((data, index) =>
                                            <tr key={index} className={(data['ID'] < 99) ? 'font-weight-bold table-secondary' : null}>
                                                <td>
                                                    {(data['ID'] > 99) ?
                                                        <a href="#"><FontAwesomeIcon className="" icon={faTrash} onClick={() => utils.delteFeeByID(data['ID'])} /></a>
                                                        : null
                                                    }
                                                </td>
                                                <td>
                                                    {(data['ID'] > 99) ?
                                                        <a href="#"><FontAwesomeIcon className="" icon={faEdit} onClick={() => openModalFeeEdit(data)} /></a>
                                                        : null
                                                    }
                                                </td>
                                                <td>{utils.getCategorybyValue(data['CATEGORY'])}</td>
                                                <td>{utils.convertTimeStampToString(data['EFFECTIVE_DATE'])}</td>
                                                <td>{utils.convertTimeStampToString(data['EFFECTIVE_END_DATE'])}</td>
                                                <td>{Math.round((data['INTEREST']) * 100) + '%'}</td>
                                                <td>{utils.toCurrency(data['AMOUNT'])}</td>
                                            </tr>)

                                    }
                                </tbody>
                            </table>
                            : null
                    }
                </div>
            )
        }
    }

    const render_parcel_notes = () => {
        if (parceNotes) {
            return (
                <div className="mr-4 container">
                    <div className="d-flex justify-content-between">
                        <span className="badge rounded-pill bg-dark col-md-2 text-white align-middle m-1">Notes</span>
                        <a href="#" onClick={() => openModalNotesNew()} ><FontAwesomeIcon className="" icon={faPlusCircle} /> Add </a>
                    </div>
                    {
                        parceNotes.length > 0 ?
                            <table className='table table-sm small table-hover w-100'>
                                <thead className="thead-dark">
                                    <tr>
                                        <th></th>
                                        <th>Date</th>
                                        <th>Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        parceNotes.map((data, index) =>
                                            <tr key={index} >
                                                <td>
                                                    {
                                                        <a href="#"><FontAwesomeIcon className="" icon={faTrash} onClick={() => utils.delteNoteByID(data['ID'])} /></a>
                                                    }
                                                </td>
                                                <td >{data['DATE']}</td>
                                                <td className="w-75">{data['NOTES']}</td>
                                            </tr>)

                                    }
                                </tbody>
                            </table>
                            : null

                    }
                </div>
            )
        }
    }

    const render_parcel_documents = () => {
        if (parcelDocuments) {
            return (
                <div className="mr-4 container">
                    <div className="d-flex justify-content-between">
                        <span className="badge rounded-pill bg-dark col-md-2 text-white align-middle m-1">Documents</span>
                        <a href="#" onClick={() => openModalDocumentsNew()} ><FontAwesomeIcon className="" icon={faPlusCircle} /> Add </a>
                    </div>
                    {
                        parcelDocuments.length > 0 ?
                            <table className='table table-sm small table-hover w-100'>
                                <thead className="thead-dark">
                                    <tr>
                                        <th></th>
                                        <th>Date</th>
                                        <th>Title</th>
                                        <th>Link</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        parcelDocuments.map((data, index) =>
                                            <tr key={index} >
                                                <td>
                                                    {
                                                        <a href="#"><FontAwesomeIcon className="" icon={faTrash} onClick={() => utils.delteDocumentByID(data['ID'])} /></a>
                                                    }
                                                </td>
                                                <td>{data['DATE']}</td>
                                                <td>{data['TITLE']}</td>
                                                <td className="w-75"><a href={data['LINK']} target="_blank">LINK</a></td>
                                            </tr>)

                                    }
                                </tbody>
                            </table>
                            : null

                    }
                </div>
            )
        }
    }

    const render_parcel_payments = () => {
        if (parcelPayments) {
            return (
                <div className="mr-4 container">
                    <div className="d-flex justify-content-between">
                        <span className="badge rounded-pill bg-dark col-md-2 text-white align-middle m-1">Payments</span>
                        <a href="#" onClick={() => openRedeemModal(parcelDetails['Status'])} ><FontAwesomeIcon className="" icon={faPlusCircle} /> Add </a>
                    </div>
                    {
                        parcelPayments.length > 0 ?
                            <table className='table table-sm small table-hover"'>
                                <thead className="thead-dark">
                                    <tr>
                                        <th></th>
                                        <th></th>
                                        <th>Effective Date</th>
                                        <th>Check Received</th>
                                        <th>Check Number</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        parcelPayments.map((data, index) =>
                                            <tr key={index} className=''>
                                                <td>
                                                    <a href="#"><FontAwesomeIcon className="" icon={faTrash} onClick={() => utils.deltePaymentByID(data['ID'])} /></a>
                                                </td>
                                                <td>
                                                    <a href="#"><FontAwesomeIcon className="" icon={faEdit} onClick={() => openModalPaymentEdit(data) } /></a>
                                                </td>
                                                <td>{utils.convertTimeStampToString(data['DATE_REDEEMED'])}</td>
                                                <td>{utils.convertTimeStampToString(data['CHECK_RECEIVED'])}</td>
                                                <td>{data['CHECK_NUMBER']}</td>
                                                <td>{utils.toCurrency(data['CHECK_AMOUNT'])}</td>
                                            </tr>)

                                    }
                                </tbody>
                            </table>
                            : null
                    }
                </div>
            )
        }
    }


    const render = () => {
        return (
            <div>
                <NavigationBar />
                {
                    isLoading ? <div className="d-flex justify-content-center mt-5"><Loading /></div>
                        :
                        <div>
                            {render_parcel_header()}
                            <hr className='mt-3 d-flex' />
                            <div className="mt-3 d-flex justify-content-between">
                                {/* Parcels details */}
                                <div className="row ml-3 w-50">
                                    {
                                        render_parcel_details()
                                    }
                                </div>
                                {/* Parcels fees and notes */}
                                <div className="ml-3 w-50">
                                    {render_parcel_payments()}
                                    <hr />
                                    {render_parcel_fees()}
                                    <hr />
                                    {render_parcel_notes()}
                                    <hr />
                                    {render_parcel_documents()}
                                </div>
                            </div>
                        </div>
                }


                <EditFeesModal show={showEditFeeModal} data={selectedFee} newFee={newFeeModal} close={() => { setEditFeeModal(false), get_parcel_details() }} />
                <EditNotesModal show={showNewNotesModal} close={() => { setNewNotesModal(false), get_parcel_details() }} />
                <RedeemModal show={showRedeemModal} level={redeemLevel} close={() => { setRedeemModal(false), get_parcel_details() }} />
                <EditDocumentsModal show={showNewDocumentsModal} close={() => { setNewDocumentsModal(false), get_parcel_details() }} />
                <EditPaymentsModal show={showEditPaymentModal} data={selectedPayment} close={() => { setShowEditPaymentModal(false), get_parcel_details()}} />
            </div>
        );
    }

    return (
        render()
    );
};

export default Parcel;