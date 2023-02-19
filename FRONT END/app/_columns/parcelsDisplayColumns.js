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
            <a className='mx-auto' href={'http://' + window.location.host + '/parcel/' + rowData.UNIQUE_ID} target="_blank">
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
        title: "Block",
        field: "LEGAL_BLOCK",
        filtering: false,
        editable: "never",
        hidden: false,
        width: "3%",
    },
    {
        title: "Lot",
        field: "LEGAL_LOT_NUMBER",
        filtering: false,
        editable: "never",
        hidden: false,
        width: "3%",
    },
    {
        title: "Qual.",
        field: "QUALIFIER",
        filtering: false,
        editable: "never",
        hidden: false,
        width: "3%",
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
        hidden: true,
    },
    {
        title: "State",
        field: "STATE",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "Beg. Bal.",
        field: "BEGINNING_BALANCE",
        filtering: false,
        editable: "never",
        hidden: false,
        render: rowData =>
            <span >
                {utils.toCurrency(rowData.BEGINNING_BALANCE)}
            </span >
    },
    {
        title: "First Check Date",
        field: "FIRST_CHECK_DATE",
        filtering: false,
        editable: "never",
        hidden: false,
        render: rowData =>
            <span >
                {utils.convertTimeStampToString(rowData.FIRST_CHECK_DATE)}
            </span >
    },
    {
        title: "Status",
        field: "STATUS",
        filtering: false,
        editable: "never",
        hidden: false,
        render: rowData =>
            <span className={rowData.STATUS == 1 ? "badge badge-success mx-auto" : "badge badge-primary mx-auto"} >
                {utils.getStatusbyValue(rowData.STATUS)}
            </span >
    },
    {
        title: "ID",
        field: "UNIQUE_ID",
        filtering: false,
        editable: "never",
        hidden: true,
    },
]