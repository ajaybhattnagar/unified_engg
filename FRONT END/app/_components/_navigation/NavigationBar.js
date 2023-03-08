import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navbar, Nav } from 'react-bootstrap';
import Brand from '../../_images/brand.png'
import './NavigationBar.css'
import { Link, withRouter } from 'react-router-dom';

class NavigationBar extends Component {

    constructor(props) {
        super(props);
        this.handleSignOut = this.handleSignOut.bind(this);
    }

    handleSignOut() {
        console.log("sign out");
        localStorage.removeItem("token");
        // this.props.history.push("/");
    };

    render() {
        return (
            <Navbar >
                <Navbar.Brand href="/">
                    <img
                        alt='logo'
                        src={Brand}
                        // width='180'
                        height='40'
                        className='d-inline-block align-top'
                    />
                </Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link className='hover-underline-animation' as={Link} to="/home"><strong>Home</strong></Nav.Link>
                    <Nav.Link className='hover-underline-animation' as={Link} to="/uploadparcels"><strong>Upload</strong></Nav.Link>
                    <Nav.Link className='hover-underline-animation' as={Link} to="/reports"><strong>Reports</strong></Nav.Link>

                    <Nav.Link href="/signup"><strong></strong></Nav.Link>
                    <Nav.Link href="/"><strong></strong></Nav.Link>
                    <Nav.Link href="/parcel"><strong></strong></Nav.Link>
                    <Nav.Link href="/parcel/payoff_report"><strong></strong></Nav.Link>
                    <Nav.Link href="/parcel/audit"><strong></strong></Nav.Link>
                </Nav>
                {
                    localStorage.getItem('token') ?
                        <form className="form-inline my-2 my-lg-0">
                            <button className="btn btn-outline-primary" type="submit" onClick={() => this.handleSignOut()}>Sign out</button>
                        </form>
                        : null

                }

            </Navbar>

        );
    }
}


export default NavigationBar 