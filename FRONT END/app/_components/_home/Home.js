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

    }, [navigate]);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        navigate("/");
    };


    return (
        <div className='container mt-3'>



            <div className="d-flex justify-content-between">
                <button type="button" className="btn btn-primary logout-button" onClick={handleSignOut}>Sign out</button>
            </div>
        </div>
    );
};

export default Home;