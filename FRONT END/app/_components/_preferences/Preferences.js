import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Preferences.css';
import { columns } from '../../_columns/parcelsDisplayColumns';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";
import { responsiveFontSizes } from "@material-ui/core";

const isBrowser = typeof window !== `undefined`

const Preferences = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSite, setSelectedSite] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);

    useEffect(() => {

    }, []);


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

            })
            .catch((error) => {
                console.log(error);
                setIsLoading(false);
            });

    }, []);


    const render = () => {
        const local_storage_site = localStorage.getItem("SITE") ? localStorage.getItem("SITE") : null;
        const local_storage_warehouse = localStorage.getItem("WAREHOUSE") ? localStorage.getItem("WAREHOUSE") : null;

        return (        
            <div>
                <NavigationBar />

                {
                    data.SITES && data.SITES.length > 0 ?
                        <div className="m-3">
                            <div className="w-50 m-3">
                                <div className="text-lg-left">Select Site:</div>
                                <div className="w-75"><DropDown placeholder={local_storage_site} text="Select Site" list={data.SITES} onSelect={(e) => { setSelectedSite(e.value); localStorage.setItem("SITE", e.value) }} /></div>
                            </div>
                            <div className="w-50 m-3">
                                <div className="">Select Warehouse:</div>
                                <div className="w-75"><DropDown placeholder={local_storage_warehouse} text="Select Site" list={data.WAREHOUSES} onSelect={(e) => { setSelectedWarehouse(e.value); localStorage.setItem("WAREHOUSE", e.value) }} /></div>
                            </div>
                        </div>
                        :
                        <Loading/>
                }


            </div>
        );
    }

    return (
        render()
    );
};

export default Preferences;