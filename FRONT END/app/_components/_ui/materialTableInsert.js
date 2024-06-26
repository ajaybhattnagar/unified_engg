import React, { useEffect, useRef } from 'react';
import { useState } from "react";
import 'handsontable/dist/handsontable.full.min.css';
import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';

registerAllModules();

const MTableInsert = (props) => {
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
                    if (source === 'edit') { setDataChanged(true); props.onInstantDataChange(data) }
                }
                }
                afterSelection={(r, c) => { on_cell_selected(data[r]) }}
                // autoWrapRow={false}
                // autoWrapCol={false}
                manualColumnResize={true}
                fixedColumnsStart={1}
                stretchH="all"
                width="100%"
                height={props.height || "auto"}
                colWidths={props.colWidths || "auto"}
                className="customFilterButton"
                selectionMode="single"
                onSelectCell={(r, c, prop, value, cellProperties) => {
                    console.log(r, c, prop, value, cellProperties);
                }}

                licenseKey="non-commercial-and-evaluation" // for non-commercial use only
            />

            {/* {
                dataChanged ?
                    <div className='d-flex mx-auto justify-content-center update-button mr-3'>
                        < button type="button" className="btn btn-primary mb-2" onClick={() => { on_change_table() }}>Update</button>
                    </div >
                    : null
            } */}


        </div >
    );
};

export default MTableInsert;