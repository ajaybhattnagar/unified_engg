import React from 'react';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { appConstants } from '../../_helpers/consts.js';
import DropDown from "../_ui/dropDown";

const EmployeeSelect = (props) => {
    const type = props.type
    const [employeeId, setEmployeeId] = useState(localStorage.getItem("MIMIC_EMPLOYEE_ID") || localStorage.getItem("EMPLOYEE_ID"));
    const [allActiveEmployee, setAllActiveEmployee] = useState([]);

    // Get all active employees useEffect
    useEffect(() => {
        var response_status = 0;
        var url = appConstants.BASE_URL.concat(appConstants.GET_ALL_EMPLOYEES);
        const request_object = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                'x-access-token': localStorage.getItem('token')
            }
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
                    setAllActiveEmployee(data);
                } else {
                    alert(data.message);
                    return null;
                }
            }
            )
            .catch((err) => console.error(err));
    }, []);

    const render = () => {
        var all_active_employees = allActiveEmployee.map(({ USER_ID }) => ({ 'value': USER_ID, 'label': USER_ID }));
        var original_employee = localStorage.getItem("EMPLOYEE_ID");
        var mimic_employee = localStorage.getItem("MIMIC_EMPLOYEE_ID");
        // {
        //     mimic_employee == null || mimic_employee === '' ?
        //         null :
        //         mimic_employee === original_employee ?
        //             <span className="badge badge-success">Original Employee</span> : <span className="badge badge-danger">Mimic Employee: {mimic_employee}</span>
        // }
        return (
            <div className="">
                <div className="">
                    <DropDown list={all_active_employees}
                        text='Emp.'
                        isMulti={false} prepareArray={false}
                        placeholder={"Select Employee"}
                        onSelect={(e) => { setEmployeeId(e.value); localStorage.setItem("MIMIC_EMPLOYEE_ID", e.value); window.location.reload(); }}
                        value={{ 'value': employeeId, 'label': employeeId }}
                    />

                </div>
            </div>
        )
    }

    return (
        render()
    )

}

export default EmployeeSelect;