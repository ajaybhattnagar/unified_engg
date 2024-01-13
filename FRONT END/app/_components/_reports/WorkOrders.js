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
import { Card } from "react-bootstrap";


const isBrowser = typeof window !== `undefined`

const WorkOrders = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [treeLoading, setTreeLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [documentList, setDocumentList] = useState(null);
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

    // To load tree data
    useEffect(() => {
        if (selectedRow) {
            setTreeLoading(true);
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
                        setTreeLoading(false);
                        setTreeDiagramData(data);
                    }
                })
                .catch((error) => {
                    setTreeLoading(false);
                    console.log(error);
                });
        }
    }, [selectedRow]);

    // To load documents
    useEffect(() => {
        if (selectedRow) {
            var response_status = 0;
            var base_id = selectedRow.BASE_ID.slice(1);
            var url = appConstants.BASE_URL.concat(appConstants.GET_ALL_FILES_FROM_U_DRIVE).concat(base_id);
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
                        setDocumentList(data);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }, [selectedRow]);

    const open_document = (path) => {
        utils.open_document(path);
    }


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
                <div className="d-flex m-3">

                    {/*Table */}
                    <div className="col-12 col-lg-4">
                        {
                            isLoading ? <Loading />
                                :
                                <div className="">
                                    <Card bg='primary' text='white'>
                                        <Card.Header><h5>Work Orders</h5></Card.Header>
                                        <Card.Body>
                                            <MTable
                                                data={data}
                                                columnsTypes={columns}
                                                columnsHeaders={['Base ID', 'Part ID', 'Customer', 'Desired Qty']}
                                                onSelectCell={(e) => { setSelectedRow(e) }}
                                            />
                                        </Card.Body>
                                    </Card>
                                </div>
                        }
                    </div>

                    {/* Tree Diagram */}
                    <div className="">
                        {
                            treeLoading ? <Loading />
                                :
                                <div className="d-flex justify-content-center">
                                    <TreeDiagram data={treeDiagramData} />
                                </div>
                        }
                    </div>

                    {/* Documents */}
                    <div className="">
                        {
                            <div class="d-flex flex-column">
                                {
                                    documentList && documentList.length > 0 ?
                                        documentList.map((doc, index) => {
                                            return (
                                                doc.FILE_PATH == "" ? null :
                                                    <div className="m-2" key={index}>
                                                        <Button variant="primary" onClick={() => { open_document(doc.FILE_PATH) }}>{doc.FILE_NAME}</Button>
                                                    </div>
                                            )
                                        })
                                        : null
                                }
                            </div>
                        }
                    </div>

                </div>


            </div >
        );
    }

    return (
        render()
    );
};

export default WorkOrders;