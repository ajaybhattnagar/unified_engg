import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Preferences.css';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";
import BarcodeFont from '../../_images/code39.ttf';

const isBrowser = typeof window !== `undefined`

const Preferences = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSite, setSelectedSite] = useState(localStorage.getItem("SITE"));
    const [selectedWarehouse, setSelectedWarehouse] = useState(localStorage.getItem("WAREHOUSE"));
    const [isDefaultScan, setIsDefaultScan] = useState(localStorage.getItem("DEFAULT_SCAN") === 'true' ? true : false || false);

    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }

        fetch(appConstants.BASE_URL + appConstants.SITE_WAREHOUSE, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem("token")
            }
        }).then(res => res.json())
            .then((response) => {
                setData(response);
                setIsLoading(false);

                if (localStorage.getItem("SITE") && localStorage.getItem("WAREHOUSE")) {

                    if (response.SITES.filter(item => item.value == selectedSite).length === 0) {
                        alert('Invalid Site!');
                        setSelectedOperation(null)
                        setSelectedResourceString(null)
                        return;
                    } else {
                        setSelectedSite({
                            value: selectedSite,
                            label: response.SITES.filter(item => item.value == selectedSite)[0].label
                        })
                    }

                    if (response.WAREHOUSES.filter(item => item.value == selectedWarehouse).length === 0) {
                        alert('Invalid Warehouse!');
                        setSelectedOperation(null)
                        setSelectedResourceString(null)
                        return;
                    } else {
                        setSelectedWarehouse({
                            value: selectedWarehouse,
                            label: response.WAREHOUSES.filter(item => item.value == selectedWarehouse)[0].label
                        })
                    }

                }

            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });

    }, []);

    const render = () => {

        return (
            <div>
                <NavigationBar />

                {
                    data.SITES && data.SITES.length > 0 ?
                        <div>

                            {/* Preferences */}
                            <div className="container m-3">
                                <h3>Preferences</h3>
                                <div className="m-3">
                                    <div className="w-50">
                                        <div className="w-75">
                                            <DropDown text="Select Site" list={data.SITES}
                                                value={selectedSite}
                                                onSelect={(e) => { setSelectedSite(e); localStorage.setItem("SITE", e.value) }} />
                                        </div>
                                    </div>
                                    <div className="w-50 mt-3">
                                        <div className="w-75">
                                            <DropDown text="Select Warehouse" list={data.WAREHOUSES}
                                                value={selectedWarehouse}
                                                onSelect={(e) => { setSelectedWarehouse(e); localStorage.setItem("WAREHOUSE", e.value) }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Check box for scanning option */}
                                <div className="m-3">
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" checked={isDefaultScan}
                                            onChange={(e) => { setIsDefaultScan(e.target.checked); localStorage.setItem("DEFAULT_SCAN", e.target.checked) }} />
                                        <label className="form-check-label" for="flexCheckDefault">
                                            Default mode to scan
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Resources */}
                            <hr />

                            <div className="container m-3">
                                <h3>Resources</h3>
                                <div className="">
                                    <a href={BarcodeFont} download="font.ttf">
                                        <button className="btn btn-outline-primary mt-1">
                                            Download Barcode Fonts
                                        </button>
                                    </a>
                                </div>

                                <div className="">
                                    <a href='www.googel.com' target="_blank">
                                        <button className="btn btn-outline-primary mt-1">
                                            API Status Check
                                        </button>
                                    </a>
                                </div>

                                <div className="">
                                    <a href='www.googel.com' target="_blank">
                                        <button className="btn btn-outline-primary mt-1">
                                            SSRS Web Portal
                                        </button>
                                    </a>
                                </div>
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

export default Preferences;