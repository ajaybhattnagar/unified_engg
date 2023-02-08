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

    downloadAction.push({
        icon: () => <FontAwesomeIcon className='fa-1x' icon={faDownload} />,
        tooltip: 'Download',
        isFreeAction: true,
        onClick: () => props.onDownloadButtonPressed(data)
    });

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