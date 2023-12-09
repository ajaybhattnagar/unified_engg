import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Reports.css';
import { Button } from "react-bootstrap";
import DropDown from "../_ui/dropDown";
import Loading from "../_ui/loading";
import TreeDiagram from "../_ui/treeDiagram";

const isBrowser = typeof window !== `undefined`

const WorkOrders = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [treeDiagramData, setTreeDiagramData] = useState(null);
    const isAllowedEditLaborTicket = useRef(false);


    useEffect(() => {
        var access_rights = utils.decodeJwt();
        access_rights = access_rights.USER_DETAILS

        if (access_rights.ALLOWED_EDIT_LABOR_TICKET === '1') {
            isAllowedEditLaborTicket.current = true;
        }


    }, []);

    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        setIsLoading(true);
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.GET_ALL_ACTIVE_WORKORDER_DETAILS);
        const request_object = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
            },
        }
        fetch(url, request_object)
            .then((res) => {
                if (res.status === 200) {
                    response_status = 200;
                    return res.json();
                }
                else {
                    response_status = 400;
                    alert(res.json());
                }
            })
            .then((data) => {
                if (response_status === 200) {
                    setIsLoading(false);
                    setData(data);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    useEffect(() => {
        if (selectedRow) {
            var response_status = 0;
            var url = appConstants.BASE_URL.concat(appConstants.GET_ALL_ACTIVE_WORKORDER_DETAILS).concat('?base_id=' + selectedRow.BASE_ID);
            const request_object = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    'x-access-token': localStorage.getItem('token')
                },
            }
            fetch(url, request_object)
                .then((res) => {
                    if (res.status === 200) {
                        response_status = 200;
                        return res.json();
                    }
                    else {
                        response_status = 400;
                        alert(res.json());
                    }
                })
                .then((data) => {
                    if (response_status === 200) {
                        setTreeDiagramData(data);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [selectedRow]);


    const columns = [
        {
            data: 'BASE_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'PART_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'CUSTOMER_ID',
            type: 'text',
            readOnly: true
        },
        {
            data: 'DESIRED_QTY',
            type: 'numeric',
            readOnly: true
        },

    ]

    const render = () => {
        return (
            <div>
                <NavigationBar />
                <div className="m-3">
                    <div className="">
                        {
                            isLoading ? <Loading />
                                :
                                <MTable
                                    data={data}
                                    columnsTypes={columns}
                                    columnsHeaders={['Base ID', 'Part ID', 'Customer', 'Desired Qty']}
                                    onSelectCell={(e) => { setSelectedRow(e) }}
                                />
                        }
                    </div>

                    <div className="">
                        <TreeDiagram data={treeDiagramData} />
                    </div>
                </div>


            </div>
        );
    }

    return (
        render()
    );
};

export default WorkOrders;