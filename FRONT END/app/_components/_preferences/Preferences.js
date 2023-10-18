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

const isBrowser = typeof window !== `undefined`

const Preferences = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


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
                console.log(response);
                setData(response);
                setIsLoading(false);
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
                            <div className="d-flex justify-content-center">
                                <div className="">Select Site:</div>
                                <div className="w-75"><DropDown text="Select Site" list={data.SITES} onSelect={(e) => console.log(e)} /></div>
                            </div>
                            <div className="d-flex justify-content-center">
                                <div className="">Select Warehouse:</div>
                                <div className="w-75"><DropDown text="Select Site" list={data.WAREHOUSES} onSelect={(e) => console.log(e)} /></div>
                            </div>
                        </div>
                        :
                        null
                }


            </div>
        );
    }

    return (
        render()
    );
};

export default Preferences;