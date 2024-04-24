import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils.js';
import { appConstants } from '../../_helpers/consts.js';
import MTableInsert from "../_ui/materialTableInsert.js";
import Input from "../_ui/input.js";
import NavigationBar from '../_navigation/NavigationBar.js';
import './CreateQuote.css';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown.js";
import Loading from "../_ui/loading.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";

const isBrowser = typeof window !== `undefined`

const CreateQuote = () => {
    const navigate = useNavigate();
    const [dropDownData, setDropDownData] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedFOB, setSelectedFOB] = useState(null);
    const [selectedSalesRep, setSelectedSalesRep] = useState(null);
    const [selectedShipVia, setSelectedShipVia] = useState(null);
    const [lineDetails, setLineDetails] = useState([{
        'LineNo': 1,
        'Description': "",
        'QuoteQty': 0,
        'UnitPrice': 0.00,
        'SellingUm': "",

    },]);


    const [selectedLineDetails, setSelectedLineDetails] = useState({});

    const [selectedQuoteDate, setSelectedQuoteDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [selectedFollowUpDate, setSelectedFollowUpDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [selectedExpirationDate, setSelectedExpirationDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [selectedExpectedWinDate, setSelectedExpectedWinDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingQuote, setIsCreatingQuote] = useState(false);

    useEffect(() => {
        var decoded_token = utils.decodeJwt(localStorage.getItem("token"));
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
            return;
        }
        setIsLoading(true);
        var url = appConstants.BASE_URL.concat(appConstants.GET_CREATE_QUOTE_INITIAL_LOAD_DETAILS);
        var response_status = 0;
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
                    setIsLoading(false);
                    setDropDownData(data);


                    // Set the default values for the dropdowns
                    if (data.SALES_REP.length > 0) {
                        // Find the index of the sales rep with the same name as the user
                        var index = data.SALES_REP.findIndex((e) => e.label === decoded_token.USERNAME);
                        setSelectedSalesRep(data.SALES_REP[index]);
                    }
                } else {
                    setIsLoading(false);
                    alert(data.message);
                    return null;
                }
            })
            .catch((err) => { console.error(err), setIsLoading(false); });


        // Add 15 days to the current date and set it as the expiration date
        var today = new Date();
        var expiration_date = new Date(today);
        expiration_date.setDate(today.getDate() + 30);
        setSelectedExpirationDate(utils.convertTimeStampToDateForInputBox(expiration_date));
        setSelectedFollowUpDate(utils.convertTimeStampToDateForInputBox(expiration_date));
        setSelectedExpectedWinDate(utils.convertTimeStampToDateForInputBox(expiration_date));
    }, []);


    const line_columns = [
        {
            data: 'LineNo',
            type: 'numeric',
            readOnly: true
        },
        {
            data: 'Description',
            type: 'text',
            readOnly: false
        },
        {
            data: 'QuoteQty',
            type: 'numeric',
            readOnly: false
        },
        {
            data: 'UnitPrice',
            type: 'numeric',
            readOnly: false
        },
        {
            data: 'SellingUm',
            type: 'dropdown',
            readOnly: false,
            source: ['EA', 'FT', 'KIT', 'LB', 'LOT']
        }

    ]
    const insert_blank_record_line = () => {
        var new_record = {
            'LineNo': Math.max.apply(Math, lineDetails.map(function (o) { return o.LineNo; })) + 1,
            'Description': "",
            'QuoteQty': 0,
            'UnitPrice': 0.00,
            'SellingUm': "",

        }
        var test = lineDetails.concat(new_record);
        setLineDetails(test);
    }

    const delete_record_line = () => {
        if (selectedLineDetails.LineNo === 1) {
            alert("Cannot delete first row");
            return;
        }
        var test = lineDetails.filter((e) => e['LineNo'] !== selectedLineDetails['LineNo']);
        setLineDetails(test);
    }

    const create_quote_in_visual = () => {
        var decoded_token = utils.decodeJwt(localStorage.getItem("token"));

        if (!selectedCustomer || !selectedQuoteDate || !selectedExpirationDate || !selectedFollowUpDate || !selectedSalesRep || !selectedFOB || !selectedShipVia || !selectedExpectedWinDate) {
            alert("Please fill all the fields");
            return;
        }
        setIsCreatingQuote(true);
        var obj_to_send = {
            "Database": decoded_token.DATABASE,
            "UserName": decoded_token.USERNAME,
            "Password": decoded_token.PASSWORD,
            "SiteId": localStorage.getItem("SITE"),
            "CustomerId": selectedCustomer.value,
            "QuoteDate": selectedQuoteDate,
            "ExpirationDate": selectedExpirationDate,
            "ExpectedWinDate": selectedExpectedWinDate,
            "FollowUpDate": selectedFollowUpDate,
            "SalesRep": selectedSalesRep.value,
            "Fob": selectedFOB.value,
            "ShipVia": selectedShipVia.value,
            "UserId": decoded_token.USERNAME,
            "QuoteLines": lineDetails
        };
        var url = appConstants.VISUAL_API.concat(appConstants.CREATE_QUOTE_IN_VISUAL);
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem("token")
            },
            body: JSON.stringify(obj_to_send)
        }).then(res => res.json())
            .then((response) => {
                var message_string = response.Message;
                // Split the message string to get the quote number
                var quote_number = message_string.split(" ")[0];
                create_folder_structure(quote_number);
                setIsCreatingQuote(false);
                alert(response.Message);
                window.location.reload();
            })
            .catch((error) => {
                setIsCreatingQuote(false);
                console.log(error);
            });
    }

    const create_folder_structure = (quote_id) => {
        var url = appConstants.BASE_URL.concat(appConstants.CREATE_QUOTE_FOLDER_STRUCTURE).concat(quote_id);
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    return res.json();
                }
                else {
                    return res.json();
                }
            })
            .then((data) => {
                console.log(data);
            })
            .catch((err) => { console.error(err); alert("Error creating folder structure"); });
    }


    const render = () => {
        return (
            <div>
                <NavigationBar />

                <div className="m-3">
                    <div className="">
                        {
                            isLoading ? <Loading /> :
                                <div className="d-flex w-100">
                                    <div className="w-50 m-2">
                                        <div className="w-75 mt-2 mb-1">
                                            <DropDown list={dropDownData.CUSTOMERS} isMulti={false}
                                                text='Customer'
                                                prepareArray={false} placeholder={"Select Customer"}
                                                onSelect={(e) => { setSelectedCustomer(e) }}
                                                value={selectedCustomer}
                                            />
                                        </div>
                                        {
                                            selectedCustomer ?
                                                <div>
                                                    <div className="w-50 mb-1"><Input text="Quote Date" type={'date'} value={selectedQuoteDate} onChange={(e) => setSelectedQuoteDate(e)} /></div>
                                                    <div className="w-50 mb-1"><Input text="Follow Up" type={'date'} value={selectedFollowUpDate} onChange={(e) => setSelectedFollowUpDate(e)} /></div>
                                                    <div className="w-50 mb-1"><Input text="Expiration" type={'date'} value={selectedExpirationDate} onChange={(e) => setSelectedExpirationDate(e)} /></div>
                                                    <div className="w-50 mb-1"><Input text="Expiration" type={'date'} value={selectedExpectedWinDate} onChange={(e) => setSelectedExpectedWinDate(e)} /></div>
                                                </div>
                                                : null
                                        }

                                    </div>
                                    {
                                        selectedCustomer ?
                                            <div className="w-50">
                                                <div className="mb-1">
                                                    <DropDown list={dropDownData.SALES_REP} isMulti={false}
                                                        text='Sales Rep'
                                                        prepareArray={false} placeholder={"Select Sales Rep"}
                                                        onSelect={(e) => { setSelectedSalesRep(e) }}
                                                        value={selectedSalesRep}
                                                    />
                                                </div>
                                                <div className="mb-1 mt-2">
                                                    <DropDown list={dropDownData.FOB_POINT} isMulti={false}
                                                        text='FOB'
                                                        prepareArray={false} placeholder={"Select FOB"}
                                                        onSelect={(e) => { setSelectedFOB(e) }}
                                                        value={selectedFOB}
                                                    />
                                                </div>
                                                <div className="mb-1">
                                                    <DropDown list={dropDownData.SHIP_VIA} isMulti={false}
                                                        text='Ship Via'
                                                        prepareArray={false} placeholder={"Select Ship Via"}
                                                        onSelect={(e) => { setSelectedShipVia(e) }}
                                                        value={selectedShipVia}
                                                    />
                                                </div>
                                            </div>
                                            : null
                                    }
                                </div>
                        }


                    </div>

                </div>

                {
                    selectedCustomer ?
                        <div>
                            <div className="d-flex justify-content-between">
                                <div className="m-3 w-50">

                                    <div className="d-flex justify-content-between">
                                        <div className="">Line Items</div>
                                        <div>
                                            <div className="cusor-hand m-2 badge badge-pill badge-light" onClick={() => insert_blank_record_line()}><FontAwesomeIcon icon={faPlus} /></div>
                                            {
                                                selectedLineDetails && selectedLineDetails.LineNo > 0 ?
                                                    <div className="cusor-hand m-2 badge badge-pill badge-light" onClick={() => delete_record_line()}><FontAwesomeIcon icon={faTimes} /></div>
                                                    : null
                                            }
                                        </div>
                                    </div>
                                    <MTableInsert
                                        data={lineDetails}
                                        columnsTypes={line_columns}
                                        columnsHeaders={['Line#', 'Description', 'Qty', 'Unit Price', 'Selling Um']}
                                        height={150}
                                        onSelectCell={(e) => { setSelectedLineDetails(e) }}
                                        onInstantDataChange={(e) => { setLineDetails(e); }}
                                    />
                                </div>

                            </div>


                            {/* Button */}
                            <div className="d-flex justify-content-end m-3">
                                {
                                    isCreatingQuote ? <Loading /> :
                                        <Button variant="primary" onClick={() => create_quote_in_visual()}><FontAwesomeIcon icon={faCheck} />&nbsp;Create</Button>
                                }
                            </div>


                        </div>
                        :
                        null
                }

            </div >
        );
    }

    return (
        render()
    );
};

export default CreateQuote;