import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { TeamItem } from "./TeamItems";
import "./styles.css";
// import { searchTreeNodePath } from "./utils";
// import { cloneDeep } from "lodash";
import TreeModel from "tree-model";
import { appConstants } from "../../_helpers/consts";

const config = {
    id: "root",
    name: "root",
    children: []
};



const Parent = ({ item, onDragStart, onDragEnd, draggable }) => (
    <div className="test d-flex justify-content-between cusor-hand" key={item.ROWID}
        // onDragStart={onDragStart}
        // onDragEnd={onDragEnd}
        // draggable={draggable}
        onClick={(e) => {
            var url_to_open = appConstants.DEPLOYEMENT_URL.concat('reports/work_order_operations?base_id=').concat(item.WORKORDER_BASE_ID).concat('&sub_id=').concat(item.WORKORDER_SUB_ID).concat('&operation_seq=').concat(item.SEQUENCE_NO);
            window.open(url_to_open, 'operations', 'toolbar=0,location=0,menubar=0,width=900,height=300').focus();
            console.log(item);
        }}
    >
        <span className="badge badge-primary">{item.SUB_ID}</span> &nbsp; {item.PART_ID} &nbsp;
        {item.RESOURCE_ID}
        {
            item.SUB_ID >= 0 ? null : <input type='checkbox'></input>
        }
        {
            item.SUB_ID >= 0 ? null : <span className="cusor-hand" onClick={(e) => {
                var url = appConstants.DEPLOYEMENT_URL.concat('recordLabor?base_id=').concat(item.WORKORDER_BASE_ID).concat('&sub_id=').concat(item.WORKORDER_SUB_ID).concat('&operation_seq=').concat(item.SEQUENCE_NO);
                // open url in new tab
                window.open(url, '_blank').focus();
            }}>➡️</span>
        }


    </div>
);

export default function TreeDiagram(props) {
    const [path, setPath] = useState([]);
    var tree = new TreeModel();
    const [data, setData] = useState(props.data || config);
    const [root, setRoot] = useState(tree.parse(config));

    useEffect(() => {
        document.body.className = "currentapp_hr teams";
    }, []);

    useEffect(() => {
        if (props.data) {
            setRoot(tree.parse(props.data));
            var path_ = searchItemPath(props.data.id);
            setPath(path_);
        }
    }, [props.data]);

    const searchItemPath = (id) =>
        root
            .first((node) => node.model.id === id)
            .getPath()
            .filter((node) => "id" in node.model)
            .map((node) => ({
                id: node.model.id,
                index: node.getIndex()
            }));

    const onItemClick = (item) => {
        const path = searchItemPath(item.id);
        setPath(path);
    };

    return (
        <div className="hr-teams">
            <TeamItem
                items={root.model.children}
                onItemClick={onItemClick}
                selectedPath={path}
                itemNode={Parent}
                searchItemPath={searchItemPath}
            />
        </div>
    );
}
