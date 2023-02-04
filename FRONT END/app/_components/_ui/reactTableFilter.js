import React from 'react';
// import "./QueryTool.css";
import TableFilter from "react-table-filter";
import { useEffect, useState } from "react";

const ReactTableFilter = (props) => {
  const [dataTableData, setDataTableData] = useState({ data: [] });
  const [dataTableColumn, setDataTableColumn] = useState({ columns: [] });
  const [data, setData] = useState(props.data);

  const filterUpdated = (newData, filtersObject) => {
    setData(newData);
  };

  const orderedColumns = (data) => {
    return Object.keys(data[0]);
  }


  const BuildTableData = (data) => {
    if (data.length > 0) {
      const columns = orderedColumns(data)
      setDataTableData({ data: data });
      setDataTableColumn({ columns: columns });
    }
  };


  useEffect(() => {
    BuildTableData(data);
  }, [data]);

  const render = () => {
    return (
      <div>
        <table className="table table-bordered table-hover table-sm">
          <thead className='primary-color'>
            {/* <TableFilter rows={data} onFilterUpdate={filterUpdated}> */}
            {dataTableData &&
              dataTableColumn.columns.map((title, index) => (
                <th className='table-column'
                  key={title}
                  filterkey={title}
                  casesensitive={"true"}
                  showsearch={"true"}
                >
                  {title}
                </th>
              ))}
            {/* </TableFilter> */}
          </thead>
          <tbody>

            {dataTableData.data.length > 0 ? dataTableData.data.map((data, index) => (
              <tr key={index}>
                {dataTableColumn.columns.map((title, index) => (
                  <td className='columnResizer' key={index}>{data[title]}</td>
                ))}
              </tr>
            )) : null
            }

          </tbody>
        </table>
      </div >
    );
  }

  return (
    render()
  );
};


export default ReactTableFilter;