import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Input from "./input";
import DropDown from "./dropDown";
import { appConstants } from "../../_helpers/consts";
import { utils } from "../../_helpers/utils";
import { useParams } from 'react-router-dom';



const EditFeesModal = (props) => {
  const params = useParams();

  const [data, setData] = useState(null);
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState(null);
  const [amount, setAmount] = useState(null);
  const [interest, setInterest] = useState(null);
  const [intersAccInterval, setIntersAccInterval] = useState(null);
  const [effStartDate, setEffStartDate] = useState(null);
  const [effEndDate, setEffEndDate] = useState(null);
  const [feeId, setFeeId] = useState(null);
  const [newFee, setNewFee] = useState(false);
  const parcelId = useRef(params.parcel_id);

  useEffect(() => {
    {
      if (props.data) {
        setData(props.data);
        set_all_feilds(props.data);
      }
      else {
        setData({
          "UNIQUE_ID": parcelId.current,
          "CATEGORY": "",
          "DESCRIPTION": "",
          "AMOUNT": "",
          "INTEREST": "",
          "INTEREST_ACC_INTERVAL": "",
          "EFFECTIVE_DATE": "",
          "EFFECTIVE_END_DATE": ""
        });
      }
    }
    // setData(props.data);
    // set_all_feilds(props.data);
    setNewFee(props.newFee)
  }, [props.data]);

  const set_all_feilds = (_data) => {
    if (_data) {
      setCategory(_data.CATEGORY);
      setDescription(_data.DESCRIPTION);
      setAmount(_data.AMOUNT);
      setInterest(_data.INTEREST);
      setIntersAccInterval(_data.INTEREST_ACC_INTERVAL);
      setEffStartDate(_data.EFFECTIVE_DATE);
      setEffEndDate(_data.EFFECTIVE_END_DATE);
      setFeeId(_data.ID);
    }
  }

  const update_fee = () => {
    if (category === null || category === "" || category === undefined
      || amount === null || amount === "" || amount === undefined
      || interest === null || interest === "" || interest === undefined
      || intersAccInterval === null || intersAccInterval === "" || intersAccInterval === undefined
      || effStartDate === null || effStartDate === "" || effStartDate === undefined) {
      alert("Please enter all the fields!");
      return null;
    }

    var url = appConstants.BASE_URL.concat(appConstants.UPDATE_FEE_BY_ID);
    var body = {
      "ID": feeId,
      "CATEGORY": category,
      "DESCRIPTION": description,
      "AMOUNT": amount,
      "INTEREST": interest,
      "INTEREST_ACC_INTERVAL": intersAccInterval,
      "EFFECTIVE_DATE": utils.convertTimeStampToDateForInputBox(effStartDate),
      "EFFECTIVE_END_DATE": 'NULL'
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

  const add_fee = () => {
    if (category === null || category === "" || category === undefined
      || amount === null || amount === "" || amount === undefined
      || interest === null || interest === "" || interest === undefined
      || intersAccInterval === null || intersAccInterval === "" || intersAccInterval === undefined
      || effStartDate === null || effStartDate === "" || effStartDate === undefined) {
      alert("Please enter all the fields!");
      return null;
    }
    var url = appConstants.BASE_URL.concat(appConstants.ADD_FEE_BY_UNIQUE_ID);
    var body = {
      "UNIQUE_ID": parcelId.current,
      "CATEGORY": category,
      "DESCRIPTION": description,
      "AMOUNT": amount,
      "INTEREST": interest,
      "INTEREST_ACC_INTERVAL": intersAccInterval,
      "EFFECTIVE_DATE": utils.convertTimeStampToDateForInputBox(effStartDate),
      "EFFECTIVE_END_DATE": 'NULL'
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
    setCategory(null);
    setDescription(null);
    setAmount(null);
    setInterest(null);
    setIntersAccInterval(null);
    setEffStartDate(null);
    setEffEndDate(null);
    setFeeId(null);

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
          <Modal.Title id="contained-modal-title-vcenter">{newFee ? "Add Fee" : "Edit Fee"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            data ?
              <div>
                <div className="col m-1"><DropDown placeholder={utils.getCategorybyValue(category)} list={utils.categoryArray(99)} isMulti={false} prepareArray={false} onSelect={(e) => { setCategory(e.value) }} /></div>
                <div className="col m-1"><Input text="Description" type="text" value={description} onChange={(e) => { setDescription(e) }} /></div>

                <div className="d-flex">
                  <div className="col col-lg-5 m-1"><Input text="Amount" type="number" value={amount} onChange={(e) => { setAmount(e) }} /></div>
                  <div className="col col-lg-5 m-1"><Input text="Interest" type="number" value={interest} onChange={(e) => { setInterest(e) }} /></div>
                </div>

                <div className="col col-lg-5 m-1">
                  <DropDown placeholder={utils.getInterestIntervalbyValue(intersAccInterval)} list={utils.interestIntervalArray()} isMulti={false} prepareArray={false} onSelect={(e) => { setIntersAccInterval(e.value) }} />
                </div>

                <div className="d-flex">
                  <div className="col col-lg-5 m-1"><Input text="Start Date" type="date" onChange={(e) => { setEffStartDate(e) }} /></div>
                </div>
              </div>
              :

              null
          }

        </Modal.Body>
        <Modal.Footer>
          {
            newFee ?
              <button className="btn btn-outline-success mr-2" variant="success" onClick={() => add_fee()}>Add</button>
              :
              <button className="btn btn-outline-success mr-2" onClick={() => update_fee()}>Update</button>
          }
          <button className="btn btn-outline-primary mr-2" onClick={() => { closeModal(); props.close() }}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditFeesModal;
