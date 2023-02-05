import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import Brand from '../../_images/brand.png'
import { Link } from 'react-router-dom';

class NavigationBar extends Component {

    render() {
        return (
            <Navbar bg="light" variant="light">
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

                    {/* <NavDropdown title="Material" id="nav-dropdown" >
                        <NavDropdown.Item eventKey="4.1" href="/material_request_gen">Material Request Generator</NavDropdown.Item>
                        <NavDropdown.Item eventKey="4.1" href="/allocation">Allocate Materials</NavDropdown.Item>
                    </NavDropdown>

                    <NavDropdown title="Scheduling" id="nav-dropdown" >
                        <NavDropdown.Item eventKey="4.1" href="/schedule">Schedule</NavDropdown.Item>
                        <NavDropdown.Item eventKey="4.1" href="/scheduling">Scheduling</NavDropdown.Item>
                    </NavDropdown> */}

                </Nav>
                {/* <Nav>
                    <Nav.Link className='hover-underline-animation' as={Link} to="/preferences"><strong>Preferences</strong></Nav.Link>
                    <Nav.Link className='hover-underline-animation' as={Link} to="/about"><strong>About</strong></Nav.Link>
                </Nav> */}
            </Navbar>
        );
    }
}

function mapState(state) {
    return {

    };
}

const actionCreators = {

}

export default connect(mapState, actionCreators)(NavigationBar);