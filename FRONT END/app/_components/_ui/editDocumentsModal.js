import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, FormGroup, FormControl } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Input from "./input";
import DropDown from "./dropDown";
import { appConstants } from "../../_helpers/consts";
import { utils } from "../../_helpers/utils";
import { useParams } from 'react-router-dom';

import { validUrl } from 'valid-url';


const EditDocumentsModal = (props) => {

  var validUrl = require('valid-url');
  const params = useParams();
  const [title, setTitle] = useState(null);
  const [link, setLink] = useState(null);
  const parcelId = useRef(params.parcel_id);

  useEffect(() => {

  }, []);



  const add_document = () => {
    if (title === null || title === "" || title === undefined || link === null || link === "" || link === undefined) {
      alert("Please enter notes and link!");
      return null;
    }

    if (link !== null && link !== "" && link !== undefined) {
      if (!validUrl.isUri(link)) {
        alert("Please enter valid link!");
        return null;
      }
    }

    var url = appConstants.BASE_URL.concat(appConstants.ADD_NEW_DOCUMENT).concat(parcelId.current);
    var body = {
      "TITLE": title,
      "LINK": link
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
    setTitle(null)
    setLink(null)

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
              <div className="col m-1"><Input text="Title" type="text" value={title} onChange={(e) => { setTitle(e) }} /></div>
              <div className="col m-1"><Input text="Link" type="text" value={link} onChange={(e) => { setLink(e) }} /></div>
            </div>
          }

        </Modal.Body>
        <Modal.Footer>

          <button className="btn btn-outline-success mr-2" onClick={() => add_document()}>Add</button>

          <button className="btn btn-outline-primary mr-2" onClick={() => { closeModal(); props.close() }}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditDocumentsModal;
