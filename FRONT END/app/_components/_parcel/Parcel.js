import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { useParams } from 'react-router-dom';
import { appConstants } from '../../_helpers/consts.js';
import ReactTableFilter from "../_ui/reactTableFilter";
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Parcel.css';
import { columns } from '../../_columns/parcelsDisplayColumns';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown";

const Parcel = () => {
    const navigate = useNavigate();
    const params = useParams();
    const parcelId = useRef(params.parcel_id);
    const [data, setData] = useState([]);
    const [searchString, setSearchString] = useState("");
    const state = useRef(null);
    const county = useRef(null);
    const municipality = useRef(null);
    const status = useRef(null);
    const [distinctFilters, setDistinctFilters] = useState(null);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
    }, []);

    const handleSearch = (e) => {
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.SEARCH_PARCEL).concat(searchString);
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
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));
    }

    console.log("parcelId: ", parcelId.current)


    const render = () => {
        return (
            <div>
                <NavigationBar />

                <div className='container mt-3 d-flex'>
                    <h1>Parcel</h1>
                </div>

                <hr className='container mt-3 d-flex' />


            </div>
        );
    }

    return (
        render()
    );
};

export default Parcel;