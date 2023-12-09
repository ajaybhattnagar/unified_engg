import React, { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { TeamItem } from "./TeamItems";
import "./styles.css";
// import { searchTreeNodePath } from "./utils";
// import { cloneDeep } from "lodash";
import TreeModel from "tree-model";

const config = {
    id: "root",
    name: "root",
    children: [
        // sudo
        {
            id: "1",
            name: "sudo",
            children: []
        }]


};



const Parent = ({ item, onDragStart, onDragEnd, draggable }) => (
    <div
        className="test"
    // onDragStart={onDragStart}
    // onDragEnd={onDragEnd}
    // draggable={draggable}
    >
        {item.BASE_ID} {item.PART_ID} &nbsp;
        {item.RESOURCE_ID}
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
            console.log("props.data", props.data);
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
