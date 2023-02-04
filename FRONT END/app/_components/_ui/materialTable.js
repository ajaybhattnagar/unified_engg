import React, { useEffect } from 'react';
import { useState } from "react";
import MaterialTable from '@material-table/core';
import { utils } from '../../_helpers/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faRetweet, faTrash, faRegistered } from "@fortawesome/free-solid-svg-icons";
import { appConstants } from '../../_helpers/consts.js';

const MTable = (props) => {
    const [data, setData] = useState([...props.data]);
    const { title, columns, pageSize, showTitle, detailsPanel, filtering, loading, rowEdit, cellEdit, columnsButton, onRowSelect } = props;
    const [selectedRow, setSelectedRow] = React.useState(null);
    const [muiTableKey, setMuiTableKey] = React.useState(0);
    let downloadAction = [];

    // setData(props.data);
    useEffect(() => {
        setData(props.data);
    }, [props.data]);

    const options =
    {
        key: { muiTableKey },
        search: true,
        showTitle: showTitle ?? true,
        rowStyle: (rowData) => ({
            backgroundColor: onRowSelect ? selectedRow === rowData.tableData.id ? "#3498DB" : "#FFF" : rowData.tableData.id % 2 ? "#F2F2F2" : '#FFF',
            fontSize: '14px',
            padding: '0px',
        }),
        headerStyle: {
            zIndex: 0,
            fontWeight: 'bold',
            backgroundColor: '#5d5581',
            color: '#FFF',
            height: 50,
            whiteSpace: 'nowrap',
            textAlign: 'center',
            overflow: 'hidden',
            fontWeight: 'bold',
            wordWrap: 'break-word',
            wordBreak: 'break-all',
            whiteSpace: 'nowrap',
            fontSize: '15px !important',
        },
        padding: 'dense',
        pageSize: pageSize || 10,
        filtering: filtering,
        selection: props.selection,
        columnsButton: columnsButton ?? false,
        tableLayout: props.tableLayout ?? "auto",
    };

    if (props.isOnClick) {
        downloadAction.push({
            icon: () => <FontAwesomeIcon icon={faTrash} color='black' />,
            tooltip: 'Delete Record',
            onClick: (evt, data) => delete_record(data)
        });
    }

    const delete_record = (data) => {
        var response_status = 0;
        fetch(appConstants.BASE_URL.concat(appConstants.DELETE_ACTIVITY), {
            method: "POST",
            body: JSON.stringify({
                ID: data['ID'],
            }),
            headers: {
                "Content-Type": "application/json",
                "x-access-token": localStorage.getItem("token"),
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    response_status = 200;
                    return res.json();
                }
                else {
                    response_status = 400;
                    return res.json();
                }
            })
            .then((data) => {
                if (response_status === 200) {
                    alert(data.message);
                    window.location.reload();
                    clear_form();

                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));
    };

    const editableOptions = {
        onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    const dataUpdate = [...data];
                    const index = oldData.tableData.id;
                    // Update database with new data
                    update_record(newData);

                    dataUpdate[index] = newData;
                    setData([...dataUpdate]);
                    resolve();
                }, 1000)
            }),
    };

    const update_record = (newData) => {
        var response_status = 0;
        fetch(appConstants.BASE_URL.concat(appConstants.UPDATE_ACTIVITY), {
            method: "POST",
            body: JSON.stringify({
                ID: newData['ID'],
                FIELD_1: newData['FIELD_1'],
                FIELD_2: newData['FIELD_2'],
                FIELD_3: newData['FIELD_3'],
                FIELD_4: '',
                FIELD_5: '',
                FIELD_6: '',
                FIELD_7: '',
                FIELD_8: '',
                FIELD_9: '',
                FIELD_10: '',
            }),
            headers: {
                "Content-Type": "application/json",
                "x-access-token": localStorage.getItem("token"),
            },
        })
            .then((res) => {
                if (res.status === 200) {
                    response_status = 200;
                    return res.json();
                }
                else {
                    response_status = 400;
                    return res.json();
                }
            })
            .then((data) => {
                if (response_status === 200) {
                    alert(data.message);
                    window.location.reload();
                    clear_form();

                } else {
                    alert(data.message);
                }
            })
            .catch((err) => console.error(err));
    };

    return (
        <div className='material-table'>
            <MaterialTable
                columns={columns}
                data={data}
                title={title}
                options={options}
                actions={downloadAction}
                editable={props.rowEdit === true ? editableOptions : null}
                onRowClick={(evt, selectedRow) => { setSelectedRow(selectedRow.tableData.id), onRowSelect ? onRowSelect(selectedRow) : null }
                }
            />
        </div>
    );
};

export default MTable;