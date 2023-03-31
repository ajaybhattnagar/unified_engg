import React, { useRef } from 'react';
import Select from 'react-select';
import { useState, useEffect } from "react";
import { utils } from '../../_helpers/utils';
import Input from "../_ui/input";

const UpdateFields = (props) => {
    const [showDetails, setShowDetails] = useState(true);
    const [parcelData, setParcelData] = useState(props.parcel_data);

    const yearEndPenalty = useRef('');


    useEffect(() => {
        setParcelData(props.parcel_data)
    }, [parcelData])

    const update_values = () => {
        utils.updateYEPbyID(parcelData['Unique ID'], yearEndPenalty.current)
    }

    const render = () => {
        return (
            <div className="d-flex justify-content-between">
                <div className='w-75'>
                    <div id="accordion" role="tablist" aria-multiselectable="true">
                        <div className="card">
                            <div className="card-header" >
                                <h6 className="mb-0 d-flex justify-content-between">
                                    <a href='#' onClick={() => setShowDetails(!showDetails)}>
                                        Update Fields
                                    </a>
                                </h6>
                            </div>

                            <div id="collapseOne" className={showDetails ? "collapse" : "collapse show"} >
                                <div className="card-block p-3">
                                    <Input type="number" text={'YEP'} value={yearEndPenalty.current} onChange={(e) => { yearEndPenalty.current = e }} />
                                </div>
                                <div className='d-flex justify-content-end mb-2'>
                                    <button className="btn btn-outline-success mr-2 " onClick={() => update_values()}>Update</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        render()
    )

}

export default UpdateFields;