import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navbar, Nav } from 'react-bootstrap';
import Brand from '../../_images/brand.png'
import './NavigationBar.css'

class NavigationBar extends Component {

    render() {
        return (
            <Navbar bg="light" variant="light">
                <Navbar.Brand href="/">
                    <img
                        alt='coronavirus'
                        src={Brand}
                        height='49'
                        className='d-inline-block align-top'
                    />
                </Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link href="/home"><strong></strong></Nav.Link>
                    <Nav.Link href="/signup"><strong></strong></Nav.Link>
                    <Nav.Link href="/"><strong></strong></Nav.Link>
                </Nav>
            </Navbar>
        );
    }
}


export default NavigationBar;

// export default connect(mapState, actionCreators)(NavigationBar);