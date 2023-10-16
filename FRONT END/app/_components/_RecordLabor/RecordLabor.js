import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './RecordLabor.css';
import { columns } from '../../_columns/parcelsDisplayColumns';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";

const isBrowser = typeof window !== `undefined`

const RecordsLabor = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
    }, []);


    const render = () => {
        return (
            <div>
                <NavigationBar />
                <h1>Labor</h1>

            </div>
        );
    }

    return (
        render()
    );
};

export default RecordsLabor;