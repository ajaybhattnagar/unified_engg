import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, FormGroup, FormControl } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Input from "./input";
import DropDown from "./dropDown";
import { appConstants } from "../../_helpers/consts";
import { utils } from "../../_helpers/utils";
import { useParams } from 'react-router-dom';

import { validUrl } from 'valid-url';


const EditPaymentsModal = (props) => {

  var validUrl = require('valid-url');
  const params = useParams();
  const [data, setData] = useState(null);
  const [checkAmount, setCheckAmount] = useState(0);
  const [checkNumber, setCheckNumber] = useState('');
  const [checkReceived, setCheckReceived] = useState('');
  const [source, setSource] = useState('');
  const [method, setMethod] = useState('');
  const [description, setDescription] = useState('');
  const parcelId = useRef(params.parcel_id);

  useEffect(() => {
    if (props.data) {
      setData(props.data);
      setCheckAmount(props.data.CHECK_AMOUNT);
      setCheckNumber(props.data.CHECK_NUMBER);
      setCheckReceived(utils.convertTimeStampToDateForInputBox(props.data.CHECK_RECEIVED));
      setSource(props.data.SOURCE);
      setMethod(props.data.METHOD);
      setDescription(props.data.DESCRIPTION);
    }
  }, [props.data]);



  const update_payment = () => {
    if (data) {
      var url = appConstants.BASE_URL.concat(appConstants.UPDATE_PAYMENT_BY_ID).concat(data.ID);
      var body = {
        "ID": data.ID,
        "CHECK_AMOUNT": checkAmount,
        "CHECK_NUMBER": checkNumber,
        "CHECK_RECEIVED": checkReceived,
        "SOURCE": source,
        "METHOD": method,
        "DESCRIPTION": description
      }
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'x-access-token': localStorage.getItem('token')
      },
      body: JSON.stringify(body)
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
        else {
          return res.json();
        }
      })
      .then((data) => {
        if (data.status === 200) {
          alert(data.message);
        }
        else {
          alert(data.message);
        }
      })
      .then(() => {
        props.close();
      })
  }

  const closeModal = () => {
    setCheckAmount(0);
    setCheckNumber('');
    setCheckReceived('');
    setSource('');
    setMethod('');
    setDescription('');
  }

  return (
    <>
      <Modal
        show={props.show}
        cancel={props.close}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">Edit Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            <div className="container">
              <div className="d-flex justify-content-between">
                <div className="col m-1"><Input text="Check Amount" type="number" value={checkAmount} onChange={(e) => { setCheckAmount(e) }} /></div>
                <div className="col m-1"><Input text="Check Number" type="text" value={checkNumber} onChange={(e) => { setCheckNumber(e) }} /></div>
              </div>
              <div className="col m-1"><Input text="Check Received" type="date" value={checkReceived} onChange={(e) => { setCheckReceived(e) }} /></div>
              <div className="d-flex justify-content-between">
                <div className="col m-1"><Input text="Source" type="text" value={source} onChange={(e) => { setSource(e) }} /></div>
                <div className="col m-1"><Input text="Method" type="text" value={method} onChange={(e) => { setMethod(e) }} /></div>
              </div>
              <div className="col m-1"><Input text="Description" type="text" value={description} onChange={(e) => { setDescription(e) }} /></div>
            </div>
          }

        </Modal.Body>
        <Modal.Footer>

          <button className="btn btn-outline-success mr-2" onClick={() => update_payment()}>Update</button>

          <button className="btn btn-outline-primary mr-2" onClick={() => { closeModal(); props.close() }}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditPaymentsModal;
