import React, { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { appConstants } from '../../_helpers/consts.js';
import { utils } from "../../_helpers/utils.js";
import Input from "../_ui/input";
import Brand from '../../_images/brand.png'
import './PayoffReport.css'

const PayoffReport = () => {
    const navigate = useNavigate();
    const params = useParams();
    const parcelId = useRef(params.parcel_id);
    const inputRef = useRef(null);
    const [data, setData] = useState(null);
    const [endDate, setEndDate] = useState(null);
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
            var endDate = date;
        } else {
            let dt = new Date();
            let dateMDY = `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`;
            var endDate = dateMDY;
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
                    console.log(data);
                    setData(data);
                    setParcelDetails(data.parcel_details[0]);
                    setParcelFees(data.parcel_fees);
                    setParcelSummary(data.parcel_summary[0]);
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));
    }

    const handelEndDateChange = (e) => {
        setEndDate(e);
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
                            <span className='ml-3 row font-weight-bold'>Property Address: </span>
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
                    <table className="table table-striped table-bordered table-hover table-sm">
                        <thead className="thead-dark">
                            <tr>
                                <th>Effective Date</th>
                                <th>Category</th>
                                <th>Total Interest Days</th>
                                <th>Tax</th>
                                <th>Interest</th>
                                <th>Fees</th>
                                <th>Penalty</th>
                                <th>Payment Recieved</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                parcelFees.map((item, index) => {
                                    return (
                                        <tr key={index} className={item['CATEGORY'] === 'Total' ? 'font-weight-bold table-secondary' : null}>
                                            <td className = 'small'>{item['EFFECTIVE_DATE']}</td>
                                            <td className = 'small'>{item['CATEGORY'] === 'Total' ? "Total" : utils.getCategorybyValue(item['CATEGORY'])}</td>
                                            <td className = 'small'>{item['TOTAL_DAYS_OF_INTEREST']}</td>
                                            <td className = 'small'>{utils.toCurrency(item['AMOUNT'])}</td>
                                            <td className = 'small'>{utils.toCurrency(item['TOTAL_INTEREST'])}</td>
                                            <td className = 'small'>{utils.toCurrency(item['FEES'])}</td>
                                            <td className = 'small'>{utils.toCurrency(item['PENALTY'])}</td>
                                            <td className = 'small'>{utils.toCurrency(item['PAYMENTS_RECIEVED'])}</td>
                                            <td className = 'small font-weight-bold'>{utils.toCurrency(item['TOTAL_AMOUNT'])}</td>
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
                    <table className="table table-striped table-bordered table-hover table-sm">
                        <thead>
                            <tr>
                                <th>Pricipal: </th>
                                <th className="columnColor">{utils.toCurrency(parcelSummary['PRINCIPAL'])}</th>
                            </tr>
                            <tr>
                                <th>Premium: </th>
                                <th className="columnColor">{utils.toCurrency(parcelSummary['OVERBID'])}</th>
                            </tr>
                            <tr>
                                <th>Penalty: </th>
                                <th className="columnColor">{utils.toCurrency(parcelSummary['PENALTY'])}</th>
                            </tr>
                            <tr>
                                <th>Subsequent Taxes: </th>
                                <th className="columnColor">{utils.toCurrency(parcelSummary['SUB_TAXES'])}</th>
                            </tr>
                            <tr>
                                <th>Subsequent Taxes Interest: </th>
                                <th className="columnColor">{utils.toCurrency(parcelSummary['SUB_TAXES_INTEREST'])}</th>
                            </tr>
                            <tr>
                                <th>Total: </th>
                                <th className="columnColor">{utils.toCurrency(parcelSummary['TOTAL'])}</th>
                            </tr>
                            <tr>
                                <th>Payments: </th>
                                <th className="columnColor">{utils.toCurrency(parcelSummary['PAYMENT_RECIEVED'])}</th>
                            </tr>
                            <tr>
                                <th>Balance: </th>
                                <th className="columnColor">{utils.toCurrency(parcelSummary['BALANCE'])}</th>
                            </tr>
                        </thead>
                    </table>
                </div>

            )
        }
    }

    const download_payoff_report = () => {
        if (parcelDetails) {
            try {
                var document_name = 'Payoff Report - ' + parcelDetails['Parcel ID'] + '.pdf';
            }
            catch (err) {
                var document_name = 'Payoff Report.pdf';
            }
        } else {
            var document_name = 'Payoff Report.pdf';
        }
        html2canvas(inputRef.current).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF();
            pdf.addImage(imgData, "JPEG", 0, 0);
            pdf.save(document_name);
        });
    };

    return (
        <div >
            <div className='row container no-print'>
                <div className="col w-75 m-1 d-flex">
                    <Input text="Balance Date" type="date" onChange={(e) => { handelEndDateChange(e) }} />
                    <button className="btn btn-outline-primary ml-2" type="submit" onClick={() => { get_parcel_payoff_report(endDate) }}> Refresh </button>
                    <button className="btn btn-outline-primary ml-2" type="submit" onClick={() => { window.print(); }}> Print </button>
                    <button className="btn btn-outline-primary ml-2" type="submit" onClick={download_payoff_report}> Download </button>
                </div>
            </div>

            <div className="pdfA4" id="divToPrint" ref={inputRef}>
                <div className='mt-3 d-flex justify-content-between' >
                    <div className='mr-3'>
                        <img alt='logo' className='m-3' src={Brand} height={40} />
                        <span className='ml-3 row'>PO Box 815, Fort Washington</span>
                        <span className='ml-3 row'>19034 - 0815 PA</span>
                    </div>
                    <h2 className="m-3">Payoff Report </h2>
                </div>

                <hr />

                {<div className="m-2"> {render_parcel_header()} </div>}
                <hr />
                {<div className="m-2"> {render_parcel_fees()} </div>}
                <hr />
                {/* {<div className="m-2"> {render_parcel_summary()} </div>}
                <hr /> */}
            </div>



        </div>
    );
};

export default PayoffReport;