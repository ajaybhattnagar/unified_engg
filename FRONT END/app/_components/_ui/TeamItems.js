import React, { useState } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { countLineParams } from "./utils";

export const TeamItem = ({
  items,
  hasParent = false,
  level = 0,
  onItemClick,
  selectedPath,
  active = false,
  onItemDragStart,
  onItemDragEnd,
  onItemDrop,
  allItemsDraggable,
  itemNode: Component,
  marginBottomDefault = 7,
  itemHeightDefault = 46,
  searchItemPath,
  draggableId,
  setDraggableId,
  draggedOverId,
  setDraggedOverId
}) => {
  // const [draggedOverId, setDraggedOverId] = useState(null)
  const { length } = items;
  const isRoot = level === 0;

  const handleClick = (event, item) => {
    event.stopPropagation();
    onItemClick(item);
  };

  const handleStartDrag = (event, id) => {
    event.stopPropagation();
    onItemDragStart(id);
    setDraggableId(id);
  };

  const handleEndDrag = (event, id) => {
    event.stopPropagation();
    onItemDragEnd(id);
    setDraggableId(null);
    // setDraggedOverId(null)
  };

  const handleDragOver = (event, id, level) => {
    event.stopPropagation();
    const targetLevel = searchItemPath(id);
    if (!allItemsDraggable && level !== targetLevel + 1) {
      event.preventDefault();
      return false;
    }
    // if (id !== draggedOverId) {
    // setDraggedOverId(id)
    // }
  };

  const handleDropItem = (event, id) => {
    // event.stopPropagation();
    // onItemDrop(id);
  };

  return items.map((item, index) => {
    const { id } = item;
    const hasItemBelow = index < length - 1;
    const childrenCount = item.children && item.children.length;
    const { top, height } = countLineParams(
      item,
      index,
      hasItemBelow,
      marginBottomDefault,
      itemHeightDefault
    );
    const { id: activeId, index: activeIndex } = selectedPath[level] || {};
    const isActive = id === activeId;
    const isDraggable = allItemsDraggable ? "true" : !childrenCount;
    let marginBottom = marginBottomDefault;
    if (index === items.length - 1) {
      marginBottom = 0;
    }
    if (!level) {
      marginBottom = marginBottomDefault * 2;
    }
    // console.log({item: item.name, level})

    return (
      <div className="item" key={id} style={{ marginBottom }}>
        <div
          className={classNames("item__parent", {
            active: isActive
          })}
        >
          {!isRoot && hasItemBelow && (
            <div
              className={classNames("item__parent__line", {
                active: active && index < activeIndex
              })}
              style={{ top, height: "calc(100% + 7px)" }}
            />
          )}
          <div
            onClick={(event) => handleClick(event, item)}
            className={classNames("item__parent__element", {
              "has-children": childrenCount,
              "has-parent": hasParent,
              "no-active-children": level === selectedPath.length - 1
            })}
            style={{ height: itemHeightDefault }}
          >
            <Component
              onDragStart={(event) => handleStartDrag(event, id)}
              onDragEnd={(event) => handleEndDrag(event, id)}
              draggable={isDraggable}
              item={item}
            />
          </div>
        </div>
        <div
          id={id}
          // style={{ backgroundColor: id === draggedOverId ? 'aliceblue' : null }}
          className="item__children"
          onDrop={(event) => handleDropItem(event, id)}
          onDragOver={(event) => handleDragOver(event, id, level)}
        >
          {childrenCount > 0 && (
            <TeamItem
              items={item.children}
              hasParent
              level={level + 1}
              onItemClick={onItemClick}
              selectedPath={selectedPath}
              active={isActive}
              onItemDragStart={onItemDragStart}
              onItemDragEnd={onItemDragEnd}
              allItemsDraggable={allItemsDraggable}
              onItemDrop={onItemDrop}
              itemNode={Component}
              marginBottomDefault={marginBottomDefault}
              itemHeightDefault={itemHeightDefault}
              searchItemPath={searchItemPath}
              draggableId={draggableId}
              setDraggableId={setDraggableId}
              draggedOverId={draggedOverId}
              setDraggedOverId={setDraggedOverId}
            />
          )}
        </div>
      </div>
    );
  });
};

TeamItem.propTypes = {
  items: PropTypes.array,
  hasParent: PropTypes.bool
};
