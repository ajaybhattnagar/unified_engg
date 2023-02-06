import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navbar, Nav } from 'react-bootstrap';
import Brand from '../../_images/brand.png'
import './NavigationBar.css'
import { Link } from 'react-router-dom';

class NavigationBar extends Component {

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
                    <Nav.Link href="/signup"><strong></strong></Nav.Link>
                    <Nav.Link href="/"><strong></strong></Nav.Link>
                    <Nav.Link className='hover-underline-animation' as={Link} to="/uploadparcels"><strong>Upload</strong></Nav.Link>

                </Nav>
            </Navbar>
        );
    }
}


export default NavigationBar 