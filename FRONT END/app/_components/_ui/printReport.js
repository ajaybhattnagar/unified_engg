import React from 'react';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport, faPrint, faDownload } from "@fortawesome/free-solid-svg-icons";

const PrintReport = (props) => {
    const type = props.type
    const [baseId, setBaseId] = useState(props.base_id)
    const [subId, setSubId] = useState(1)
    const report_file = props.report_file
    // const urlWorkOrderView = `http://jfena-sql02/ReportServer/Pages/ReportViewer.aspx?%2fWorkOrderTraveler%2f${report_file}&BASE_ID=${base_id}&rs:Command=Render`
    const urlWorkOrderView = `http://uni-vm-visdev:5009/ReportServer/Pages/ReportViewer.aspx?%2fShop+Floor%2fWork+Plan&BASE_ID=${baseId}&SUB_ID=${subId}&rs:Format=HTML5&rs:Command=Render`
    const urlWorkOrderDownload = `http://uni-vm-visdev:5009/ReportServer/Pages/ReportViewer.aspx?%2fShop+Floor%2fWork+Plan&BASE_ID=${baseId}&SUB_ID=${subId}&rs:Format=PDF`

    useEffect(() => {
        setBaseId(props.base_id);
    }, [props.base_id]);

    const loadView = () => {
        if (report_file === '1244' || report_file === '1247' || report_file === '1319') {
            window.open(urlWorkOrderView, "PRINT", "height=1200,width=800");
        }
        else {
            alert('No report file found!')
        }
    }

    const loadDownloadFile = () => {
        if (report_file === '1244' || report_file === '1247' || report_file === '1319') {
            window.open(urlWorkOrderDownload, "_blank")
        }
        else {
            alert('No report file found!')
        }
    }


    const render = () => {
        return (
            <div className="d-flex justify-content-left">
                <Button className='mr-2 btn btn-dark' disabled={true}>Work Plan: </Button>
                <Button type="button" data-toggle="tooltip" title="View" className='mr-2 btn btn-light' onClick={() => loadView()}>
                    <FontAwesomeIcon className="" icon={faFileExport} />
                </Button>
                <Button data-toggle="tooltip" title="Download" className='mr-2' onClick={() => loadDownloadFile()}>
                    <FontAwesomeIcon className="" icon={faDownload} /></Button>
                {/* <Button><FontAwesomeIcon className="" icon={faPrint} /></Button> */}
            </div>
        )
    }

    return (
        render()
    )

}

export default PrintReport;