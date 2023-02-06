import React, { useRef } from 'react';
import { useState, useEffect } from "react";
import { DataSheetGrid, dateColumn, textColumn, keyColumn, floatColumn, checkboxColumn, CellProps } from 'react-datasheet-grid'
import { Button, Card, Form } from "react-bootstrap";
import 'react-datasheet-grid/dist/style.css'
import { upload_parcel_columns } from '../../_columns/uploadParcelColumns';

const InputList = (props) => {
    const [data, setData] = useState(props.data);
    const searchString = useRef("");

    const type = props.type
    const buttonText1 = props.buttonText1 || "Add"
    const buttonText2 = props.buttonText2 || "Add"
    const lockRows = props.lockRows || "false"
    const selectedRow = props.selectedRow || false
    const searchBox = props.searchBox || false

    var columns

    useEffect(() => {
        setData(props.data)
    }, [props.data]);

    const handleSearch = (e) => {
        searchString.current = e
        if (e.length > 0) {
            var summary = props.data
            summary = summary.filter(x =>
                Object.keys(x).some(y => {
                    if (x[y] != null) {
                        return x[y].toString().toLowerCase().indexOf(e.toLowerCase()) != -1;
                    }
                })
            )
            setData(summary)
        }
        else {
            setData(props.data)
        }
    }


    if (type === "uploadparcels") {
        columns = upload_parcel_columns
    }

    const render = () => {
        return (
            <div>
                {
                    searchBox ?
                        <div className='mb-1 col-sm-5'>
                            <Input value={searchString.current} text="Search" type="text" onChange={(e) => handleSearch(e)} />
                        </div>
                        : null
                }

                <DataSheetGrid
                    value={data}
                    onChange={setData}
                    columns={columns}
                    lockRows={props.lockRows}
                    height={600}
                    rowHeight={30}
                    headerHeight={50}
                />
                <div className="d-flex justify-content-end">
                    {
                        props.buttonText1 ?
                            <div className='m-2'> <Button onClick={() => props.onClick1(data)}>{buttonText1}</Button>  </div>
                            : null
                    }
                    {
                        props.buttonText2 ?
                            <div className='m-2'> <Button onClick={() => props.onClick2(data)}>{buttonText2}</Button>  </div>
                            : null
                    }
                </div>
            </div>
        )
    }

    return (
        render()
    )

}

export default InputList;