import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import { columns } from '../_ui/quotesColumn';

import { utils } from '../../_helpers/utils';

import { appConstants } from '../../_helpers/consts.js';


import { Modal, Button } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MTable from '../_ui/materialTable';


import './Home.css';
import _ from 'lodash';

const isBrowser = typeof window !== `undefined`

class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isTokenPresent: localStorage.getItem('token') ? true : false,
        }
    }




    componentDidMount() {
        const { isTokenPresent } = this.state
        if (!isTokenPresent) {
            this.props.history.push('/')
        }
    }


    loadRefreshData() {
        this.setState({ isLoading: true })
        this.componentDidMount()
    }



    render() {
        const { file, responseData, isTokenPresent, modalisOpen, notes, scrollLimit, selectedCountry, selectedACMStatus, isLoading } = this.state

        return (
            <React.Fragment>
                <div class="container-fluid">
                    TEST
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

export default connect(mapState, actionCreators)(Home);