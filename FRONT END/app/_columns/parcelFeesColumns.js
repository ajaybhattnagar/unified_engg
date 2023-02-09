import React from "react";
import { ProgressBar } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { utils } from '../_helpers/utils';


export const columns = [
    {
        title: "Certificate",
        field: "UNIQUE_ID",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "Location",
        field: "CATEGORY",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "City",
        field: "DESCRIPTION",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "Parcel ID",
        field: "AMOUNT",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "Municipality",
        field: "INTEREST",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "County",
        field: "INTEREST_ACC_INTERVAL",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "State",
        field: "EFFECTIVE_DATE",
        filtering: false,
        editable: "never",
        hidden: false,
    },
    {
        title: "ID",
        field: "EFFECTIVE_END_DATE",
        filtering: false,
        editable: "never",
        hidden: false,
    },
]