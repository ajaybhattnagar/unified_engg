import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Input from "../_ui/input";
// import Button from "@material-ui/core/Button";

const EditFeesModal = (props) => {
  const [data, setData] = useState(null);
  const [category, setCategory] = useState(null);
  const [description, setDescription] = useState(null);
  const [amount, setAmount] = useState(null);
  const [interest, setInterest] = useState(null);
  const [interst_acc_interval, setInterst_acc_interval] = useState(null);
  const [eff_start_date, setEff_start_date] = useState(null);
  const [eff_end_date, setEff_end_date] = useState(null);

  useEffect(() => {
    setData(props.data);
    set_all_feilds(props.data);
  }, [props.data]);

  const set_all_feilds = (_data) => {
    if (_data) {
      setCategory(_data.CATEGORY);
      setDescription(_data.DESCRIPTION);
      setAmount(_data.AMOUNT);
      setInterest(_data.INTEREST);
      setInterst_acc_interval(_data.INTEREST_ACC_INTERVAL);
      setEff_start_date(_data.EFFECTIVE_DATE);
      setEff_end_date(_data.EFFECTIVE_END_DATE);
    }
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
          <Modal.Title id="contained-modal-title-vcenter">Edit Fee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            data ?
              <div>
                <div className="col col-lg-5 m-1"><Input text="CATEGORY" type="text" value={category} onChange={(e) => { setCategory(e) }} /></div>
                <div className="col col-lg-5 m-1"><Input text="DESCRIPTION" type="text" /></div>

                <div className="d-flex">
                  <div className="col col-lg-5 m-1"><Input text="AMOUNT" type="number" /></div>
                  <div className="col col-lg-5 m-1"><Input text="INTEREST" type="number" /></div>
                </div>

                <div className="col col-lg-5 m-1"><Input text="INTEREST_ACC_INTERVAL" type="text" /></div>

                <div className="d-flex">
                  <div className="col col-lg-5 m-1"><Input text="EFFECTIVE_DATE" type="date" /></div>
                  <div className="col col-lg-5 m-1"><Input text="EFFECTIVE_END_DATE" type="date" /></div>
                </div>
              </div>
              :

              null
          }

        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.close}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditFeesModal;
