import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from '../_navigation/NavigationBar';
import InputList from "../../_components/_ui/inputList";
import './UploadParcels.css';
import _ from 'lodash';

const UploadParcels = () => {
    const [data, setData] = useState([]);
    const navigate = useNavigate();


    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const inputListData = [{
        MANAGING_COMPANY: "",
    }]

    const uploadData = (e) => {
        console.log(e);
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
                    lockRows={false}
                />
            </div>

            <div className='container mt-3'>
                <div className="d-flex justify-content-between">
                    <button type="button" className="btn btn-primary logout-button" onClick={handleSignOut}>Sign out</button>
                </div>
            </div>


        </div>

    );
};

export default UploadParcels;