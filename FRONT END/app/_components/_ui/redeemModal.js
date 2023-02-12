import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Input from "./input";
import DropDown from "./dropDown";
import { appConstants } from "../../_helpers/consts";
import { utils } from "../../_helpers/utils";
import { useParams } from 'react-router-dom';

const RedeemModal = (props) => {
  const params = useParams();

  const [level, setLevel] = useState(props.level);
  const parcelId = useRef(params.parcel_id);
  const [dateRedeemed, setDateRedeemed] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
  const [checkAmount, setCheckAmount] = useState(0);
  const [checkNumber, setCheckNumber] = useState('');
  const [checkReceived, setCheckReceived] = useState(utils.convertTimeStampToDateForInputBox(new Date()));
  const [source, setSource] = useState('');
  const [method, setMethod] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setLevel(props.level);
  }, [props.level]);

  const add_notes = () => {
    var url = appConstants.BASE_URL.concat(appConstants.REDEEM_OR_PARTIAL_REDEEM_OR_ADD_PAYMENT).concat(parcelId.current);
    var date_redeemed = parseInt(level) > parseInt(8) ? dateRedeemed : null;
    var body = {
      "LEVEL": level,
      "DATE_REDEEMED": date_redeemed,
      "CHECK_AMOUNT": checkAmount,
      "CHECK_NUMBER": checkNumber,
      "CHECK_RECEIVED": checkReceived,
      "SOURCE": source,
      "METHOD": method,
      "DESCRIPTION": description
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
          <Modal.Title id="contained-modal-title-vcenter">Redemption</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            <div className="container">
              {
                parseInt(level) > parseInt(8) ? <div className="col m-1"><Input text="Date Redeemed" type="date" value={dateRedeemed} onChange={(e) => { setDateRedeemed(e) }} /></div> : null
              }
              {/* <div className="col m-1"><Input text="Date Redeemed" type="date" value={dateRedeemed} onChange={(e) => { setDateRedeemed(e) }} /></div> */}
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
          <button className="btn btn-outline-success mr-2" onClick={() => add_notes()}>
            {
              parseInt(level) === parseInt(9) ? "Partial Redeem" : parseInt(level) === parseInt(10) ? "Redeem" : "Add payment"
            }
          </button>
          <button className="btn btn-outline-primary mr-2" onClick={props.close}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RedeemModal;
