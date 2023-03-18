import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Reports.css';
import { columns } from '../../_columns/parcelsDisplayColumns';
import { Button, Spinner } from "react-bootstrap";
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";

const isBrowser = typeof window !== `undefined`

const Reports = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const selected_report = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
    }, []);

    const get_report = (e) => {
        setIsLoading(true);
        var url = '';

        if (selected_report.current === 'ALL_FIELDS') {
            url = appConstants.BASE_URL.concat(appConstants.GET_ALL_FIELDS_REPORT);
        }
        else if (selected_report.current === 'FEE_DETAILS') {
            url = appConstants.BASE_URL.concat(appConstants.GET_FEE_DETAILS_REPORT);
        }
        else if (selected_report.current === 'SUB_REQUEST_FORM') {
            url = appConstants.BASE_URL.concat(appConstants.GET_SUB_REQUEST_FORM_REPORT);
        }
        else {
            alert('Please select a report or report definition not found!');
            setIsLoading(false);
            return false;
        }

        var response_status = 0;
        return fetch(url, {
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
                    utils.exportCSV(data, selected_report.current);
                    setIsLoading(false);
                    alert('Report exported to CSV!');
                } else {
                    setIsLoading(false);
                    alert(data.message);
                    return null;
                }
            })
            .catch((err) => console.error(err));

    }


    const render = () => {
        return (
            <div>
                <NavigationBar />

                <div className='container mt-3 d-flex'>
                    <div className="col col-lg-5">
                        <DropDown
                            placeholder={'Select Report'}
                            list={utils.reportsArray}
                            isMulti={false}
                            prepareArray={false}
                            onSelect={(e) => { selected_report.current = e.value; }}
                        />
                    </div>
                    <Button className="" variant="primary" onClick={(e) => get_report()}> Get Report
                        {
                            isLoading ? <Spinner className="ml-2" animation="border" size="sm" /> : null
                        }
                    </Button>
                </div>

                <hr className='container mt-3 d-flex' />

            </div>
        );
    }

    return (
        render()
    );
};

export default Reports;