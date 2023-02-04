import React, { useEffect, useState } from "react";
import { connect } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { appConstants } from '../../_helpers/consts.js';
import FormInput from '../_ui/form';
import ReactTableFilter from "../_ui/reactTableFilter";
import MTable from "../_ui/materialTable";
import './Home.css';
import _ from 'lodash';

const isBrowser = typeof window !== `undefined`

const Home = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);

    useEffect(() => {
        const checkUser = () => {
            if (!localStorage.getItem("token")) {
                navigate("/");
            }
        };
        checkUser();
        get_user_activities();
    }, [navigate]);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const columns_table = [
        {
            title: "ID",
            field: "ID",
            filtering: true,
            editable: false,
            hidden: false,
            width: "6%",
        },
        {
            title: "FIELD_1",
            field: "FIELD_1",
            filtering: true,
            // editable: "initial edit value",
            hidden: false,
            width: "6%",
        },
        {
            title: "FIELD_1",
            field: "FIELD_2",
            filtering: true,
            // editable: "initial edit value",
            hidden: false,
            width: "6%",
        },
        {
            title: "FIELD_1",
            field: "FIELD_3",
            filtering: true,
            // editable: "initial edit value",
            hidden: false,
            width: "6%",
        },
    ]

    const get_user_activities = () => {
        var response_status = 0;
        fetch(appConstants.BASE_URL.concat(appConstants.GET_USER_ACTIVITIES), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem("token")
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
    };

    return (
        <div className='container mt-3'>

            <div className="d-flex justify-content-around">

                <div className="p-2">
                    <h4 className="mx-auto m-3">Add Activity</h4>
                    <FormInput />
                </div>

                <div className="p-2">
                    <h4 className="mx-auto m-3">Activities</h4>
                    {
                        data.length > 0 ?
                            // <ReactTableFilter data={data} />
                            <MTable
                                data={data}
                                columns={columns_table}
                                pageSize={10}
                                selection={false}
                                showTitle={false}
                                cellEdit={false}
                                rowEdit={true}
                                isOnClick={true}
                                // onRefresh={() => this.componentDidMount()}
                                // tableLayout='Fixed'
                                columnsButton={false}
                                // onRowSelect={(e) => this.handleRowSelection(e)}
                            />
                            :
                            null

                    }
                </div>

            </div>
            <br />

            <div className="d-flex justify-content-between">
                <button type="button" className="btn btn-primary logout-button" onClick={handleSignOut}>Sign out</button>
            </div>
        </div>
    );
};

export default Home;