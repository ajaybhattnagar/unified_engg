import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Receiving.css';
import MTable from "../_ui/materialTable";
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";
import { Card } from "react-bootstrap";

const isBrowser = typeof window !== `undefined`

const Receiving = () => {
    const navigate = useNavigate();
    const [POS, setPOS] = useState([]);
    const [poDetails, setPoDetails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPo, setSelectedPo] = useState(null);
    const [vendorPacklistId, setVendorPacklistId] = useState(null);
    const [vendorPacklistDate, setVendorPacklistDate] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
    const [vendorFreightId, setVendorFreightId] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        if (!localStorage.getItem("SITE")) {
            navigate("/preferences");
        }
        if (!localStorage.getItem("WAREHOUSE")) {
            navigate("/preferences");
        }

        var url = appConstants.BASE_URL.concat(appConstants.GET_PURCHASE_ORDERS);
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
                    setPOS(data);
                } else {
                    setIsLoading(false);
                    alert(data.message);
                    return null;
                }
            })
            .catch((err) => { console.error(err), setIsLoading(false); });

    }, []);

    useEffect(() => {
        if (selectedPo) {

            var url = appConstants.BASE_URL.concat(appConstants.GET_PURCHASE_ORDERS).concat("?purchase_order=").concat(selectedPo.value);
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
                        setPoDetails(data);
                    } else {
                        alert(data.message);
                        return null;
                    }
                })
                .catch((err) => { console.error(err), setIsLoading(false); });
        }

    }, [selectedPo]);

    const columns_purchase_order_details = [
        {
            data: 'ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'LINE_NO',
            type: 'text',
            readOnly: true
        },
        {
            data: 'PART_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'DESCRIPTION',
            type: 'text',
            readOnly: true
        },
        {
            data: 'USER_ORDER_QTY',
            type: 'text',
            readOnly: true
        },
        {
            data: 'TOTAL_USR_RECD_QTY',
            type: 'text',
            readOnly: true
        },
        {
            data: 'BALANCE',
            type: 'text',
            readOnly: true
        },
        {
            data: 'TO_REC',
            type: 'text',
        },
    ]

    const validate_create_receiver = (e) => {
        var decoded_token = utils.decodeJwt(localStorage.getItem("token"));

        if (e) {
            setIsLoading(true);
            var arr = e
            // Modify arr where to_rec is greater than 0
            arr = arr.filter((item) => {
                return item.TO_REC > 0;
            });

            for (var i = 0; i < arr.length; i++) {
                if (arr[i].TO_REC > arr[i].BALANCE) {
                    alert("To Receive cannot be greater than Balance!");
                    setIsLoading(false);
                    return null;
                }
                if (arr[i].LENGTH_REQD == 'Y' || arr[i].HEIGHT_REQD == 'Y' || arr[i].WIDTH_REQD == 'Y' || arr[i].TRACE_AVAIL_CHECK >= 1) {
                    alert("Cannot Receive this item as it is a Traceable Item or requires Length, Height and Width!");
                    setIsLoading(false);
                    return null;
                }
            }

            var receiver_lines = [];
            for (var i = 0; i < arr.length; i++) {
                var obj = {
                    "PURCHASE_ORDER_LINE": arr[i].LINE_NO,
                    "USER_QTY": Number(arr[i].TO_REC)
                }
                receiver_lines.push(obj);
            }

            // Create Receiver object
            var receiver = {
                "DATABASE": decoded_token.DATABASE,
                "USERNAME": decoded_token.USERNAME,
                "PASSWORD": decoded_token.PASSWORD,
                "SITEID": localStorage.getItem("SITE"),
                "PURCHASE_ORDER_ID": arr[0].ID,
                "VENDOR_PACKLIST_ID": vendorPacklistId || '',
                "VENDOR_PACKLIST_DATE": vendorPacklistDate || '',
                "VENDOR_FREIGHT_BILL_ID": vendorFreightId || '',
                "ReceiveOrderOrderlineDetails": receiver_lines
            }

            // Create Receiver in Visual
            var url = appConstants.VISUAL_API.concat(appConstants.CREATE_RECEIVER_VISUAL);
            var response_status = 0;
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": localStorage.getItem('token'),
                    "allow-origin": "*", //CORS
                },
                body: JSON.stringify(receiver)
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
                        alert(data.Message);
                        window.location.reload();
                        return null;
                    } else {
                        setIsLoading(false);
                        alert(data.Message);
                        return null;
                    }
                })
                .catch((err) => { console.error(err), setIsLoading(false); });
        }
    }

    const render = () => {
        return (
            <div>
                <NavigationBar />

                {
                    !isLoading ?
                        <div className="container mt-2">

                            {/* Add Dropdown */}
                            <div className="">
                                <div className="w-100 mb-2">
                                    <DropDown list={POS} text='Purchase Order'
                                        isMulti={false} prepareArray={false}
                                        placeholder={selectedPo === null ? "Select Work Order" : selectedPo}
                                        onSelect={(e) => { setSelectedPo(e) }}
                                        value={selectedPo}
                                    />
                                </div>

                                <Card bg='primary' text='white'>
                                    <Card.Header><h5>Receipt Entry</h5></Card.Header>
                                    <Card.Body>
                                        <div className="">
                                            <div className='mt-1 w-25'><Input type={'text'} placeholder="Vendor Packlist ID" value={vendorPacklistId} text='Packlist ID' onChange={(e) => setVendorPacklistId(e)} /></div>
                                            <div className='mt-1 w-25'><Input type={'date'} placeholder="Vendor Packlist Date" value={vendorPacklistDate} text='Packlist Date' onChange={(e) => setVendorPacklistDate(e)} /></div>
                                            <div className='mt-1 w-25'><Input type={'text'} placeholder="Vendor Freight ID" value={vendorFreightId} text='Freight ID' onChange={(e) => setVendorFreightId(e)} /></div>
                                        </div>

                                        <div className="mt-3">
                                            <MTable
                                                data={poDetails ? poDetails : []}
                                                columnsTypes={columns_purchase_order_details}
                                                columnsHeaders={['ID', 'Line', 'Part ID', 'Description',
                                                    'Order QTY', 'Received QTY', 'Balance', 'To Receive']}
                                                onChange={(e) => { validate_create_receiver(e) }}
                                            />
                                        </div>
                                    </Card.Body>
                                </Card>



                            </div>
                        </div>

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

export default Receiving;