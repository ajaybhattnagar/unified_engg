import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import Brand from '../../_images/brand_png.png'
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
            <Navbar collapseOnSelect bg="light" expand="lg" data-bs-theme="dark">
                <Navbar.Brand href="/">
                    <img
                        alt='logo'
                        src={Brand}
                        height='40'
                        className='d-inline-block align-top'
                    />
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">

                    <Nav className="mr-auto">
                        <Nav.Link className='hover-underline-animation' as={Link} to="/home"><strong>Home</strong></Nav.Link>
                        <Nav.Link className='hover-underline-animation' as={Link} to="/recordLabor"><strong>Labor</strong></Nav.Link>
                        <Nav.Link className='hover-underline-animation' as={Link} to="/approve_labor_tickets"><strong>Approve</strong></Nav.Link>

                        <NavDropdown title="Reports" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/reports/eod">End Of Day</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <Nav>
                        <Nav.Link className='hover-underline-animation' as={Link} to="/preferences"><strong>Preferences</strong></Nav.Link>
                    </Nav>
                    {
                        localStorage.getItem('token') ?
                            <form className="form-inline my-2 my-lg-0">
                                <button className="btn btn-outline-primary" type="submit" onClick={() => this.handleSignOut()}>Sign out</button>
                            </form>
                            : null

                    }

                </Navbar.Collapse>

            </Navbar>

        );
    }
}


export default NavigationBar 