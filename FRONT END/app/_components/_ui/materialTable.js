import React, { useEffect } from 'react';
import { useState } from "react";
import { utils } from '../../_helpers/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faRetweet, faTrash, faRegistered } from "@fortawesome/free-solid-svg-icons";
import { appConstants } from '../../_helpers/consts.js';

import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
registerAllModules();

const MTable = (props) => {
    const [data, setData] = useState([...props.data]);
    const [columnsTypes, setColumnsTypes] = useState(props.columnsTypes);
    const [columnsHeaders, setColumnsHeaders] = useState(props.columnsHeaders);
    // const { title, columns, pageSize, showTitle, detailsPanel, filtering, loading, rowEdit, cellEdit, columnsButton, onRowSelect } = props;
    // const [selectedRow, setSelectedRow] = React.useState(null);
    // const [muiTableKey, setMuiTableKey] = React.useState(0);
    // let downloadAction = [];

    useEffect(() => {
        setData(props.data);
    }, [props.data]);

    return (
        <div className=''>
            <HotTable
                data={data}
                rowHeaders={true}
                colHeaders={columnsHeaders}
                filters={true}
                dropdownMenu={['filter_by_condition', 'filter_by_value', 'filter_action_bar']}
                height="auto"
                columns={columnsTypes}
                columnSummary={[
                    {
                        sourceColumn: 0,
                        type: 'sum',
                        // now, to always display this column summary in the bottom row,
                        // set `destinationRow` to `0` (i.e. the last possible row)
                        destinationRow: 4,
                        destinationColumn: 1,
                        forceNumeric: true
                    }
                ]}

                licenseKey="non-commercial-and-evaluation" // for non-commercial use only
            />
        </div>
    );
};

export default MTable;