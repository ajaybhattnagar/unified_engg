import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Navbar, Nav } from 'react-bootstrap';
import Brand from '../../_images/brand.png'
import './NavigationBar.css'

class NavigationBar extends Component {

    render() {
        return (
            <Navbar >
                <Navbar.Brand href="/">
                
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

function mapState(state) {
    return {

    };
}

const actionCreators = {

}

export default connect(mapState, actionCreators)(NavigationBar);