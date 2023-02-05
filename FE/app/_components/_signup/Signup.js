import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Signup.css';
import { appConstants } from '../../_helpers/consts.js';

class Signup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            isTokenPresent: localStorage.getItem('token') || null,
        };
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.postLoginDetails = this.postLoginDetails.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.gotoSignUpPage = this.gotoSignUpPage.bind(this);

    }

    componentDidMount() {

    }

    handlePasswordChange(event, key) {
        this.setState({ password: event.target.value });
        if (event.key === "Enter") { this.submitLogin() }
    }

    postLoginDetails() {

        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        var response_status = 0;
        fetch(appConstants.BASE_URL.concat(appConstants.LOGIN), {
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
                    localStorage.setItem("token", data.token);
                    navigate("/home");
                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));


        // console.log(data.data);
        // localStorage.setItem("username", data.data.username);
        // navigate("/phone/verify");

    };

    gotoSignUpPage() {
        this.props.history.push('/')
    }


    handleSubmit() {
        console.log('email', email)
        console.log('password', password)
    }

    render() {
        const { email, isTokenPresent, token, isValidPassword, password } = this.state;
        return (
            <React.Fragment>
                <div className='container mx-auto mt-3 w-25  mx-auto'>
                    <h2>Signup </h2>
                    <form className='login__form'>

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text" id="basic-addon1">Email</span>
                            </div>
                            <input type="text" className="form-control" placeholder="Enter Email" id='email' name='email' value={email} onChange={(e) => this.setState({ email: e.target.value })} />
                        </div>

                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <span className="input-group-text" id="basic-addon1">Password</span>
                            </div>
                            <input type="password" className="form-control" placeholder="Enter Password" id='password' name='password' value={password} onChange={(e) => this.setState({ password: e.target.value })} />
                        </div>

                        <button type="button" className="btn btn-primary" onClick={() => this.handleSubmit()}>Sign Up</button>
                        <p>
                            Don't have an account?{" "}
                            <a href="#" className="badge badge-primary" onClick={() => this.gotoSignUpPage()}>Sign In</a>

                        </p>
                    </form>
                </div>

                {/* <div className=' w-25 mx-auto center-screen'>
                    <img src={logo} className='psilogo' />
                    <h3 className='center'>Sign In</h3>

                    <div className="form-group mt-3">
                        <input type='password' className="form-control" placeholder="Enter password" onChange={this.handlePasswordChange} onKeyDown={this.handlePasswordChange} />
                    </div>


                    <button type='submit' class="btn btn-primary btn-block" >Submit</button>

                </div> */}

                <div className="footer">
                    <div className='text-white center'> - Designed by Ajay Bhattnagar</div>
                </div>
            </React.Fragment>
        );
    }
}

function mapState(state) {

    return {

    };
}

const actionCreators = {

}

export default connect(mapState, actionCreators)(Signup);