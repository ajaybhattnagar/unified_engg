import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { appConstants } from '../../_helpers/consts.js';
import { utils } from "../../_helpers/utils.js";
import Input from "../_ui/input";
import './PayoffReport.css'

const PayoffReport = () => {
    const navigate = useNavigate();
    const params = useParams();
    const parcelId = useRef(params.parcel_id);
    const [data, setData] = useState(null);
    const [endDate, setEndDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [parcelDetails, setParcelDetails] = useState(null);
    const [parcelFees, setParcelFees] = useState(null);
    const [parcelSummary, setParcelSummary] = useState(null);


    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        get_parcel_payoff_report();
    }, []);

    const get_parcel_payoff_report = (date) => {
        var response_status = 0;
        if (date) {
            var endDate = utils.convertTimeStampToDateForInputBox(date);
        } else {
            var endDate = utils.convertTimeStampToDateForInputBox(new Date());
        }
        var url = appConstants.BASE_URL.concat(appConstants.GET_PAYOFF_REPORT).concat(parcelId.current).concat('/payoff_report').concat(`?endDate=${endDate}`);
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
                    setParcelSummary(data.parcel_summary);
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));
    }

    const handelEndDateChange = (e) => {
        setEndDate(e);
        get_parcel_payoff_report(e);
    }

    const render_parcel_header = () => {
        if (parcelDetails) {
            return (
                <div className="mt-3 d-flex justify-content-between">

                    <div className='ml-3 d-flex col-lg-5'>
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

                    <div className='col-lg-5'>
                        <div className='ml-3 d-flex'>
                            <div className="col">
                                <span className='ml-3 row'>Certificate: {parcelDetails['Certificate']}</span>
                                <span className='ml-3 row'>Parcel ID: {parcelDetails['Parcel ID']}</span>
                                <span className='ml-3 row'>Unique ID: {parcelDetails['Unique ID']}</span>
                                <span className='ml-3 row font-weight-bold'>Balance Date: {parcelFees ? parcelFees[0]['EFFECTIVE_END_DATE'] : null}</span>
                            </div>
                        </div>
                    </div>

                </div >
            )
        }
    }

    const render_parcel_fees = () => {
        if (parcelFees) {
            return (
                <div className='mt-3'>
                    <table className="table table-striped table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th>Effective Date</th>
                                <th>Category</th>
                                <th>Total Interest Days</th>
                                <th>Interest</th>
                                <th>Payment Recieved</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                parcelFees.map((item, index) => {
                                    return (
                                        <tr key={index} className={item['CATEGORY'] === 'Total' ? 'font-weight-bold table-secondary' : null}>
                                            <td>{item['EFFECTIVE_DATE']}</td>
                                            <td>{item['CATEGORY'] === 'Total' ? "Total" : utils.getCategorybyValue(item['CATEGORY'])}</td>
                                            <td>{item['TOTAL_DAYS_OF_INTEREST']}</td>
                                            <td>{utils.toCurrency(item['TOTAL_INTEREST'])}</td>
                                            <td>{utils.toCurrency(item['PAYMENTS_RECIEVED'])}</td>
                                            <td>{utils.toCurrency(item['TOTAL_AMOUNT'])}</td>
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

    const render_parcel_summary = () => {
        if (parcelSummary) {
            return (
                <div className='mt-3'>
                    <table className="table table-striped table-bordered table-hover">
                        <thead className="thead-dark">
                            <tr>
                                <th>Pricipal</th>
                                <th>Premium</th>
                                <th>Penalty</th>
                                <th>Subsequent Taxes</th>
                                <th>Subsequent Taxes Interest</th>
                                <th>Total</th>
                                <th>Payments</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                parcelSummary.map((item, index) => {
                                    return (
                                        <tr key={index} className='font-weight-bold table-secondary'>
                                            <td>{utils.toCurrency(item['PRINCIPAL'])}</td>
                                            <td>{utils.toCurrency(item['OVERBID'])}</td>
                                            <td>{utils.toCurrency(item['PENALTY'])}</td>
                                            <td>{utils.toCurrency(item['SUB_TAXES'])}</td>
                                            <td>{utils.toCurrency(item['SUB_TAXES_INTEREST'])}</td>
                                            <td>{utils.toCurrency(item['TOTAL'])}</td>
                                            <td>{utils.toCurrency(item['PAYMENT_RECIEVED'])}</td>
                                            <td>{utils.toCurrency(item['BALANCE'])}</td>
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

    return (
        <div>
            <div className='row container no-print'>
                <div className="col col-lg-5 m-1 d-flex">
                    <Input text="Balance Date" type="date" value={utils.convertTimeStampToDateForInputBox(endDate)} onChange={(e) => { handelEndDateChange(e) }} />
                    <button className="btn btn-outline-primary ml-2" type="submit" onClick={() => {  window.print(); }}> Print </button>
                </div>
            </div>

            <div className='container mx-auto mt-3 w-25'>
                <h2>Payoff Report </h2>
            </div>

            <hr />

            {<div className="container"> {render_parcel_header()} </div>}
            <hr />
            {<div className="container"> {render_parcel_fees()} </div>}
            <hr />
            {<div className="container"> {render_parcel_summary()} </div>}
            <hr />



        </div>
    );
};

export default PayoffReport;