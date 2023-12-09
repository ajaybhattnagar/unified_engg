export const searchTreeNodePath = (nodeId, parent) => {
    const stack = [[parent, []]]
    while (stack.length) {
      const [node, path] = stack.pop()
      if (node.id === nodeId) {
        return path
      }
      if (node.children) {
        stack.push(...node.children.map((node, index) => (
          [node, [...path, { index, id: node.id }]])
        ))
      }
    }
  }
  
  const countItemsWithoutChildren = (item, count = 0) => {
    if (item.children && item.children.length) {
      return item.children.reduce((acc, item) => {
        if (item.children && item.children.length) {
          return countItemsWithoutChildren(item.children, count)
        } else {
          return acc + 1
        }
      }, count)
    }
  }
  
  export const countLineParams = (
    item,
    index,
    hasItemBelow,
    marginBottom,
    itemHeight
  ) => {
    const baseHeight = itemHeight + marginBottom
    const nestedChildrenCount = countItemsWithoutChildren(item)
    const top = itemHeight / 2
    let height
    if (hasItemBelow && !nestedChildrenCount) {
      height = baseHeight + 1
    } else {
      height = baseHeight * nestedChildrenCount + 1
    }
    return { top, height }
  }
  
  export const dropTreeNode = id => {
  
  }
  
  export const getTreeNode = (path = [], tree) => {
  
  }
  