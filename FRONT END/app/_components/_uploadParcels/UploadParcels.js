import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from '../_navigation/NavigationBar';
import InputList from "../../_components/_ui/inputList";
import { appConstants } from '../../_helpers/consts.js';
import './UploadParcels.css';

const UploadParcels = () => {
    const [data, setData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/");
        }
    }, []);



    const inputListData = [{
        MANAGING_COMPANY: "",
    }]

    const uploadData = (e) => {
        var response_status = 0;
        fetch(appConstants.BASE_URL.concat(appConstants.UPLOAD_PARCELS), {
            method: "POST",
            body: JSON.stringify(e),
            headers: {
                "Content-Type": "application/json",
                "x-access-token": localStorage.getItem("token"),
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
                    alert(data.message);
                    window.location.reload();
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));
    }

    const updateData = (e) => {
        var response_status = 0;
        fetch(appConstants.BASE_URL.concat(appConstants.EDIT_BULK_PARCELS), {
            method: "POST",
            body: JSON.stringify(e),
            headers: {
                "Content-Type": "application/json",
                "x-access-token": localStorage.getItem("token"),
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
                    alert(data.message);
                    // window.location.reload();
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));
    }


    return (
        <div>
            <NavigationBar />

            <div className='container mt-3'>
                <InputList
                    data={inputListData}
                    type='uploadparcels'
                    buttonText1="Upload"
                    onClick1={(e) => uploadData(e)}
                    buttonText2="Edit/Update"
                    onClick2={(e) => updateData(e)}
                    lockRows={false}
                />
            </div>


        </div>

    );
};

export default UploadParcels;