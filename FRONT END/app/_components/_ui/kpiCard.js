import React, { Component } from 'react';
import './styles.css';


class KpiCard extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        const { header, value } = this.props;

        return (
            <div className='card bg-light text-primary custom-card'>
                <div className='card-body'>
                    <h5 className='card-title font-weight-bold header'>{header}&nbsp;</h5>
                    <hr className='card-divider' />
                    <div className='row'>
                        {
                            <div className='col text-center text-nowrap'>
                                <h6><span className='text-muted'>{value}</span></h6>
                                {/* <h4><span className='text-info font-weight-bold'>{100}</span></h4> */}
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

export default KpiCard;