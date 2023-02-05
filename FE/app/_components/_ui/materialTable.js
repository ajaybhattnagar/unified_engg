import React, { useEffect } from 'react';
import { useState } from "react";
import MaterialTable from '@material-table/core';
import { utils } from '../../_helpers/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faRetweet, faCalendar, faRegistered } from "@fortawesome/free-solid-svg-icons";

const MTable = (props) => {
    const [data, setData] = useState([... props.data]);
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
            backgroundColor: onRowSelect ? selectedRow === rowData.tableData.id ? "#B2BEB5" : "#FFF" : rowData.tableData.id % 2 ? "#F2F2F2" : '#FFF',
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
            icon: () => <FontAwesomeIcon icon={faCalendar} color='black' />,
            tooltip: 'Update dates',
            onClick: (evt, data) => props.onClick(data)
        });
    }

    if (props.isOnClick2) {
        downloadAction.push({
            icon: () => <FontAwesomeIcon icon={faRegistered} color='green' />,
            tooltip: 'Release work orders',
            onClick: (evt, data) => props.onClick2(data)
        });
    }

    downloadAction.push({
        icon: () => <FontAwesomeIcon icon={faDownload} color='orange' />,
        tooltip: 'Download',
        isFreeAction: true,
        onClick: () => props.onDownloadButtonPressed(data)
    });
    downloadAction.push({
        icon: () => <FontAwesomeIcon icon={faRetweet} color='green' />,
        tooltip: 'Refresh',
        isFreeAction: true,
        onClick: (evt, data) => props.onRefresh(data)
    });

    const detailPanelProps = {};

    if (detailsPanel != undefined) {
        detailPanelProps.detailPanel = rowData => {
            return (
                <div className='mx-auto'>
                    Details
                </div>
            )
        }

        detailPanelProps.onRowClick = (event, rowData, togglePanel) => {
            togglePanel();
        }
    }

    const editableOptions = {
        onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    const dataUpdate = [...data];
                    const index = oldData.tableData.id;
                    dataUpdate[index] = newData;
                    setData([...dataUpdate]);

                    resolve();
                }, 1000)
            }),
    };

    const cellEditableOptions = {
        onCellEditApproved: (newValue, oldValue, rowData, columnDef) => {
            return new Promise((resolve, reject) => {
                const clonedData = [...data]
                clonedData[rowData.tableData.id][columnDef.field] = newValue
                setData(clonedData)

                setTimeout(resolve, 1000);
            });
        }
    }

    return (
        <div className='material-table'>
            <MaterialTable
                columns={columns}
                data={data}
                title={title}
                options={options}
                actions={downloadAction}
                {...detailPanelProps}
                editable={props.rowEdit === true ? editableOptions : null}
                cellEditable={props.cellEdit === true ? cellEditableOptions : null}
                onRowClick={(evt, selectedRow) => { setSelectedRow(selectedRow.tableData.id), onRowSelect ? onRowSelect(selectedRow) : null }
                }
            />
        </div>
    );
};

export default MTable;