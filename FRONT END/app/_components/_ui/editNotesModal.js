import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, FormGroup, FormControl } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Input from "./input";
import DropDown from "./dropDown";
import { appConstants } from "../../_helpers/consts";
import { utils } from "../../_helpers/utils";
import { useParams } from 'react-router-dom';

const EditNotesModal = (props) => {
  const params = useParams();

  const [newNotes, setNewNotes] = useState(true);
  const [notes, setNotes] = useState(null);
  const parcelId = useRef(params.parcel_id);

  useEffect(() => {

  }, []);



  const add_notes = () => {
    if (notes === null || notes === "") {
      alert("Please enter notes!");
      return null;
    }

    var url = appConstants.BASE_URL.concat(appConstants.ADD_NEW_NOTE).concat(parcelId.current);
    var body = {
      "NOTES": notes,
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
          <Modal.Title id="contained-modal-title-vcenter">Add Notes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
            <div>
              <div className="col m-1">
                <Form.Control as="textarea"
                  required
                  type="text"
                  placeholder=""
                  value={notes}
                  onChange={(e) => { setNotes(e.target.value) }}
                />
              </div>

            </div>
          }

        </Modal.Body>
        <Modal.Footer>
          {
            newNotes ?
              <button className="btn btn-outline-success mr-2" onClick={() => add_notes()}>Add</button>
              :
              <button className="btn btn-outline-success mr-2" onClick={() => add_notes()}>Update</button>
          }
          <button className="btn btn-outline-primary mr-2" onClick={props.close}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditNotesModal;
