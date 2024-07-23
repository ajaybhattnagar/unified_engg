import React, { useEffect, useRef } from 'react';
import { useState } from "react";
import 'handsontable/dist/handsontable.full.min.css';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';

registerAllModules();

const MTable = (props) => {
    const hotRef = useRef(null);
    const [data, setData] = useState([...props.data]);
    const [columnsTypes, setColumnsTypes] = useState(props.columnsTypes);
    const [columnsHeaders, setColumnsHeaders] = useState(props.columnsHeaders);
    const is_update = props.is_update || false;
    const [dataChanged, setDataChanged] = useState(false);
    const [cellSelected, setCellSelected] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    // const { title, columns, pageSize, showTitle, detailsPanel, filtering, loading, rowEdit, cellEdit, columnsButton, onRowSelect } = props;
    // const [selectedRow, setSelectedRow] = React.useState(null);
    // const [muiTableKey, setMuiTableKey] = React.useState(0);
    // let downloadAction = [];

    useEffect(() => {
        setData(props.data);
    }, [props.data]);

    const on_change_table = () => {
        props.onChange(data)
    }

    const on_cell_selected = (e) => {
        if (props.onSelectCell) {
            props.onSelectCell(e)
        }
    }

    const approve_all = () => {
        setSelectAll(!selectAll);
        if (selectAll) {
            let newData = data.map((item) => {
                item.APPROVED = false;
                return item;
            });
            setData(newData);
            setDataChanged(false);
        }
        else {
            let newData = data.map((item) => {
                item.APPROVED = true;
                return item;
            });
            setData(newData);
            setDataChanged(true);
        }
    }

    const validation_custom_columns = (arr) => {
        var allowed_columns = ['ADMIN', 'SUPER_ADMIN'];

        if (arr[1] === 'APPROVED') {
            return false;
        }
        if (arr[1] === 'LAB_DESC' && arr[3].length > 80) {
            alert('Notes should be less than 80 characters');
            return true;
        }
        if (arr[1] === 'QA_NOTES' && arr[3].length > 255) {
            alert('QA Notes should be less than 255 characters');
            return true;
        }
        if (arr[1] === 'HOURS_WORKED' || allowed_columns.includes(arr[1]) || arr[1].includes('ALLOWED')) {
            return false;
        }
        if (arr[3].includes('"') || arr[3].includes("'") || arr[3].includes("1=1")) {
            alert('Quotes are not allowed');
            return true;
        }
    }

    return (
        <div className=''>
            <HotTable
                data={data}
                rowHeaders={true}
                colHeaders={columnsHeaders}
                filters={true}
                columnSorting={true}
                dropdownMenu={['filter_by_condition', 'filter_by_value', 'filter_action_bar']}
                columns={columnsTypes}
                afterChange={(changes, source) => {
                    // Validation for notes and qa notes fields
                    if (source === 'edit') {
                        if (validation_custom_columns(changes[0])) {
                            return;
                        }
                    }

                    if (source === 'edit') { setDataChanged(true); props.onInstantDataChange(data) }
                }
                }
                afterSelection={(r, c) => { on_cell_selected(data[r]) }}
                autoWrapRow={true}
                autoWrapCol={true}
                manualColumnResize={true}
                fixedColumnsStart={1}
                stretchH="all"
                width="100%"
                height={props.height || "auto"}
                colWidths={props.colWidths || "auto"}
                className="customFilterButton"
                selectionMode="single"
                autoColumnSize={true}

                onSelectCell={(r, c, prop, value, cellProperties) => {
                    console.log(r, c, prop, value, cellProperties);
                }}

                licenseKey="non-commercial-and-evaluation" // for non-commercial use only
            />
            {
                props.hasApproval ? <div className="mb-3">
                    <label><input type="checkbox" onClick={approve_all} /> Approve all</label>
                </div> :
                    null
            }
            {
                dataChanged ?
                    <div className='d-flex mx-auto justify-content-center update-button mr-3'>
                        < button type="button" className="btn btn-primary mb-2" onClick={() => { on_change_table() }}>Update</button>
                    </div >
                    : null
            }


        </div >
    );
};

export default MTable;