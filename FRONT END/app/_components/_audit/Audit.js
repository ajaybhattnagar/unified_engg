import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from '../../_helpers/utils';
import { useParams } from 'react-router-dom';
import { appConstants } from '../../_helpers/consts.js';
import ReactTableFilter from "../_ui/reactTableFilter";
import MTable from "../_ui/materialTable";
import Input from "../_ui/input";
import NavigationBar from '../_navigation/NavigationBar';
import './Audit.css';
import Loading from "../_ui/loading";

const isBrowser = typeof window !== `undefined`

const Audit = () => {
    const navigate = useNavigate();
    const params = useParams();
    const parcelId = useRef(params.parcel_id);

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
        utils.getParcelAuditData(parcelId.current)
            .then((data) => {
                setData(data);
                setIsLoading(false);
            })
            .catch((err) => {
                setIsLoading(false);
                console.log(err);
            });
    }, []);


    const render = () => {
        return (
            <div>
                <NavigationBar />

                <div className='m-3'>
                    {/* History Table */}
                    {
                        isLoading ?
                            <Loading />
                            :
                            <div className='p-3'>
                                {
                                    data.length > 0 ?
                                        <table className='table table-sm small table-hover w-100'>
                                            <thead className="thead-dark">
                                                <tr>
                                                    <th>Column Name</th>
                                                    <th>Old Value</th>
                                                    <th>New Value</th>
                                                    <th>Done By</th>
                                                    <th>Done At</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    data.map((data, index) =>
                                                        <tr key={index} >
                                                            <td>{data['COLUMN_NAME']}</td>
                                                            <td>{data['OLD_VALUE']}</td>
                                                            <td>{data['NEW_VALUE']}</td>
                                                            <td>{data['DONE_BY']}</td>
                                                            <td>{utils.convertTimeStampToString(data['DONE_AT']) + ' ' + utils.convertStringToTime(data['DONE_AT'])}</td>
                                                        </tr>)

                                                }
                                            </tbody>
                                        </table>
                                        :
                                        <div className='text-center'>
                                            <h3>No Audit Data Found</h3>
                                        </div>
                                }
                            </div>
                    }
                </div>

            </div>
        );
    }

    return (
        render()
    );
};

export default Audit;