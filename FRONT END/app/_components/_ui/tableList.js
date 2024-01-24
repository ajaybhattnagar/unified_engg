import React from 'react';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { utils } from '../../_helpers/utils';
import './styles.css';

const TableList = (props) => {
    const [data, setData] = useState(props.data);

    useEffect(() => {
        setData(props.data);
        console.log("props.data", props.data);
    }, [props.data]);


    const render = () => {
        return (

            <div className="container-fluid mt-1">
                {
                    data && data.length > 0 ?
                        <div>
                            <table className='table table-sm small mt-3'>
                                <thead className="thead-dark">
                                    <tr>
                                        <th scope="col">Field</th>
                                        <th scope="col">Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        Object.keys(data[0]).map((key, index) => {
                                            return (
                                                <tr key={index}>
                                                    <td className="font-weight-bold">{key}</td>
                                                    <td>{data[0][key]}</td>
                                                </tr>
                                            )
                                        })

                                    }
                                </tbody>
                            </table>
                        </div>
                        :
                        null
                }
            </div>


        );
    }

    return (
        render()
    )

}

export default TableList;
