import React from "react";
import { ProgressBar } from 'react-bootstrap';
import { utils } from '../../_helpers/utils';
import usa from '../../_images/usa.png'
import can from './../../_images/can.png'
import slk from '../../_images/slk.png'
import email from '../../_images/email.png'


export const columns = [
    {
        title: "",
        filtering: false,
        editable: "never",
        filtering: true,
        hidden: false,
        width: "2%",
        render: rowData =>
            <div>
                <img src={rowData.CNTY === 'USA' ? usa : rowData.CNTY === 'CANADA' ? can : slk} className='cntyIcon' />
            </div>
    },
    {
        title: "ID",
        field: "ID",
        filtering: false,
        editable: "never",
        filtering: true,
        hidden: false,
        width: "6%",
        render: rowData =>
            <div>{rowData.ID}<span className="badge badge-primary ml-1">{rowData.LINES}</span></div>
    },
    {
        title: "Name",
        field: "NAME",
        filtering: false,
        editable: "never",
        filtering: false,
        hidden: false,
        width: "10%",
    },
    {
        title: "Created Date",
        field: "CREATE_DATE",
        filtering: false,
        editable: "never",
        filtering: false,
        hidden: false,
        width: "4%",
        render: rowData =>
            <span className="badge badge-info">{utils.convertTimeStampToString(rowData.CREATE_DATE)}</span>
    },
    {
        title: "Sales Rep Name",
        field: "SALES_REP_NAME",
        filtering: false,
        editable: "never",
        filtering: false,
        hidden: false,
        width: "6%",
    },
    {
        title: "Est Date",
        field: "EST_DATE",
        filtering: false,
        editable: "never",
        filtering: false,
        hidden: false,
        width: "4%",
        render: rowData =>
            <span className="badge badge-info">{utils.convertTimeStampToString(rowData.EST_DATE)}</span>
    },
    {
        title: "Account Manager",
        field: "ACM",
        filtering: false,
        editable: "never",
        filtering: false,
        hidden: false,
        width: "6%",
    },
    {
        title: "Status",
        field: "ACM_STATUS",
        filtering: false,
        editable: "never",
        filtering: false,
        hidden: false,
        width: "10%",
    },
    {
        title: "Notes",
        field: "NOTES",
        filtering: false,
        editable: "never",
        filtering: false,
        hidden: false,
        width: "10%",
    },
    {
        title: "Total Quoted Time (Hrs)",
        field: "TOTAL_QUOTED_TIME",
        filtering: false,
        editable: "never",
        filtering: false,
        hidden: false,
        width: "6%",
    },
    {
        title: "Days Past",
        field: "QUOTE_TIME",
        filtering: false,
        editable: "never",
        filtering: false,
        hidden: false,
        width: "3%",
        render: rowData =>
            <span className="badge badge-danger">{rowData.QUOTE_TIME}</span>
    },

]