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
import { columns } from '../../_columns/parcelFeesColumns';
import DropDown from "../_ui/dropDown";
import EditFeesModal from "../_ui/editFeesModal";


const Parcel = () => {
    const navigate = useNavigate();
    const params = useParams();
    const parcelId = useRef(params.parcel_id);
    const [data, setData] = useState(null);
    const [parcelDetails, setParcelDetails] = useState(null);
    const [parcelFees, setParcelFees] = useState(null);
    const [showEditFeeModal, setEditFeeModal] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [newFeeModal, setNewFeeModal] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        get_parcel_details();
    }, []);

    const get_parcel_details = (e) => {
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
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));
    }

    const render_parcel_details = () => {
        if (parcelDetails) {
            return (
                <div>
                    <table className='table table-sm small'>
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
        window.open(url, "PRINT", "height=1200,width=1000");
    }

    const render_parcel_header = () => {
        if (parcelDetails) {
            return (
                <div className="mt-3 d-flex justify-content-between">

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
                        <div className=" ">
                            <DropDown value={1} placeholder={utils.getStatusbyValue(parcelDetails['Status'])}
                                list={utils.statusArray()}
                                isMulti={false}
                                prepareArray={false}
                                onSelect={(e) => utils.updateStatusParcelID(parcelId.current, e.value)}
                            />
                        </div>
                        <div className="">
                            <Button variant="primary" onClick={() => open_payoff_report()}>Payoff Report</Button>
                        </div>
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

    const openModalFeeNew = (data) => {
        setNewFeeModal(true)
        setSelectedFee(data);
        setEditFeeModal(true)
    }

    const render_parcel_fees = () => {
        if (parcelFees) {
            return (
                <div className="mr-4 ">
                    <div className="d-flex justify-content-end">
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
                                                <td>{data['INTEREST']}</td>
                                                <td>${data['AMOUNT']}</td>
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

                {render_parcel_header()}

                <hr className='mt-3 d-flex' />

                <div className="mt-3 d-flex justify-content-around">
                    {/* Parcels details */}
                    <div className="row ml-3">
                        {
                            parcelDetails ?
                                render_parcel_details()
                                : null
                        }
                    </div>

                    {/* Parcels fee */}
                    <div className="row ml-3">
                        {
                            parcelFees ?
                                render_parcel_fees()
                                : null
                        }
                    </div>

                </div>

                <EditFeesModal show={showEditFeeModal} data={selectedFee} newFee={newFeeModal} close={() => setEditFeeModal(false)} />

            </div>
        );
    }

    return (
        render()
    );
};

export default Parcel;