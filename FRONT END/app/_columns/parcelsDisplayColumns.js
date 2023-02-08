import React from "react";
import { ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { utils } from '../_helpers/utils';


export const columns = [
    {
        title: "",
        filtering: false,
        editable: "never",
        hidden: false,
        width: "3%",
        render: rowData =>
            <a className='mx-auto' href={'http://' + window.location.host + '/allocation/' + rowData.BASE_ID} target="_blank">
                <FontAwesomeIcon className="" icon={faArrowRight} />
            </a >

    },
    {
        title: "Certificate",
        field: "CERTIFICATE",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "Location",
        field: "LOCATION_FULL_STREET_ADDRESS",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "City",
        field: "LOCATION_CITY",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "Parcel ID",
        field: "PARCEL_ID",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "Municipality",
        field: "MUNICIPALITY",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "County",
        field: "COUNTY",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "State",
        field: "STATE",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "Status",
        field: "STATUS",
        filtering: false,
        editable: "never",
        hidden: false,
        render: rowData =>
            <span className={rowData.STATUS == 1 ? "badge badge-success mx-auto": "badge badge-primary mx-auto"} >
                {utils.getStatusbyValue(rowData.STATUS)}
            </span >
    },
    {
        title: "ID",
        field: "UNIQUE_ID",
        filtering: false,
        editable: "never",
        hidden: false,
    },
]