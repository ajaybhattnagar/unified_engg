import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appConstants } from '../../_helpers/consts.js';
import Brand from '../../_images/brand_png.png'
import jwt_decode from "jwt-decode";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [database, setDatabase] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = () => {
            if (localStorage.getItem("token")) {
                navigate("/recordLabor");
            }
        };
        checkUser();
    }, []);

    const postLoginDetails = () => {

        if (!email || !password || !database) {
            alert("Please enter username, password and database");
            return;
        }

        var response_status = 0;
        fetch(appConstants.BASE_URL.concat(appConstants.LOGIN), {
            method: "POST",
            body: JSON.stringify({
                USERNAME: email,
                PASSWORD: password,
                DATABASE: database,
            }),
            referrerPolicy: "unsafe-url",
            headers: {
                "Content-Type": "application/json",
                "allow-origin": "*"
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
                    localStorage.setItem("token", data.token);

                    // Decrypt JWT token to get username and database and save to local storage
                    var token = data.token;
                    const decoded = jwt_decode(token);
                    localStorage.setItem("EMPLOYEE_ID", decoded.USERNAME);
                    localStorage.setItem("DATABASE", decoded.DATABASE);
                    navigate("/recordLabor");
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));

    };


    const handleSubmit = (e) => {
        e.preventDefault();
        postLoginDetails();
        setPassword("");
        setEmail("");
    };

    const gotoSignUpPage = () => navigate("/signup");

    return (
        <div className='container mx-auto mt-3 mw-50'>

            <img
                alt='logo'
                src={Brand}
                height='50'
                className='mx-auto d-block mb-3'
            />
            {/* <h4 className="m-2">Login </h4> */}
            <form className='login__form' onSubmit={handleSubmit}>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">Username</span>
                    </div>
                    <input type="text" className="form-control" placeholder="Enter Username" id='email' name='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">Password</span>
                    </div>
                    <input type="password" className="form-control" placeholder="Enter Password" id='password' name='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">Database</span>
                    </div>
                    <input type="text" className="form-control" placeholder="Enter Database" id='database' name='database' value={database} onChange={(e) => setDatabase(e.target.value)} />
                </div>

                <div className="d-flex justify-content-end">
                    <button type="button" className="btn btn-outline-primary" onClick={() => postLoginDetails()}>Sign In</button>
                </div>
            </form>

            <div className="fixed-bottom d-flex justify-content-end m-3">
                <a href={appConstants.API_STATUS_CHECK} target="_blank">
                    <button className="btn btn-outline-primary mt-1">
                        API Status Check
                    </button>
                </a>
            </div>

        </div>
    );
};

export default Login;