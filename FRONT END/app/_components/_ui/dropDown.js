import React from 'react';
import Select from 'react-select';
import { useState, useEffect } from "react";
import { Button, Card, Form } from "react-bootstrap";

const DropDown = (props) => {
  const [list, setList] = useState(props.list);
  const text = props.text
  const value = props.value || { value: '', label: ''}
  const isMulti = props.isMulti || false
  const prepareArray = props.prepareArray || false
  const placeholder = props.placeholder || "Select"
  const clearable = props.clearable || false
  const disabled = props.disabled || false


  useEffect(() => {
    setList(props.list)
  }, [props.list])

  const createObject = (list) => {
    var arrayObject = [];
    for (var i = 0; i < list.length; ++i) {
      arrayObject.push({ value: list[i], label: list[i] })
    }
    return arrayObject;
  }

  const render = () => {
    return (
      <div className="d-flex">
        <div className="input-group-prepend">
          <span className="input-group-text" id="basic-addon1">{text}</span>
        </div>
        <div className='w-100'>
          <Select
            name='Select'
            options={prepareArray ? createObject(list) : list}
            isMulti={isMulti}
            onChange={(e) => props.onSelect(e)}
            placeholder={placeholder}
            isOptionDisabled={(option) => option.disabled}
            isClearable={clearable}
            value={value}
            isDisabled={disabled}
          />
        </div>
      </div>
      // </div>
    );
  }

  return (
    render()
  )

}

export default DropDown;