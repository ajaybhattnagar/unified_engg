import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appConstants } from '../../_helpers/consts.js';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
		const checkUser = () => {
			if (localStorage.getItem("token")) {
				navigate("/home");
			}
		};
		checkUser();
	}, []);

    const postRegisterDetails = () => {
        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }
        var response_status = 0;
        fetch(appConstants.BASE_URL.concat(appConstants.REGISTER), {
            method: "POST",
            body: JSON.stringify({
                EMAIL: email,
                PASSWORD: password,
            }),
            headers: {
                "Content-Type": "application/json",
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
                    alert("User created successfully");
                    navigate("/");
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

    const gotoLoginPage = () => navigate("/");

    return (
        <div className='container mx-auto mt-3 w-25'>
            <h2>Sign up </h2>
            <form className='login__form' onSubmit={handleSubmit}>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">Email</span>
                    </div>
                    <input type="text" className="form-control" placeholder="Enter Email" id='email' name='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="input-group mb-3">
                    <div className="input-group-prepend">
                        <span className="input-group-text" id="basic-addon1">Password</span>
                    </div>
                    <input type="password" className="form-control" placeholder="Enter Password" id='password' name='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button type="button" className="btn btn-primary" onClick={() => postRegisterDetails()}>Sign Up</button>
                <p>
                    Already have an account?{" "}
                    <a href="#" className="badge badge-primary" onClick={gotoLoginPage}>Sign In</a>
                </p>
            </form>
        </div>
    );
};

export default Login;