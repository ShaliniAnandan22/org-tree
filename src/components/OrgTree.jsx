import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Controls,
  useReactFlow,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  getOutgoers,
} from "reactflow";
import "reactflow/dist/style.css";
import { getLayoutedElements } from "./layoutUtil";

function OrgTreeFlow(props) {
  let { userList, teamHash, updateUser } = props;
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { getIntersectingNodes } = useReactFlow();

  useEffect(() => {
    let nodes = userList.map((user) => {
      let { id, name, designation, manager, team } = user;
      return {
        id,
        data: {
          label: (
            <div className="user-detail">
              <div className="user-name">{name}</div>
              <div className="user-desig">
                {designation}
                {teamHash[team] && ` | ${teamHash[team]}`}
              </div>
            </div>
          ),
          managerId: manager,
        },
      };
    });

    let edges = userList
      .map((user) => {
        let { id, manager } = user;

        if (!manager) return;

        return {
          id: `${manager}_${id}`,
          markerEnd: { type: "arrowclosed" },
          source: manager,
          target: id,
          type: "smoothstep",
        };
      })
      .filter((edge) => !!edge);

    onLayout(nodes, edges);
  }, [userList]);

  const onLayout = useCallback(
    (curNodes, curEdges) => {
      const currentNodeList = curNodes || nodes;
      const currentEdgeList = curEdges || edges;

      if (currentNodeList || currentEdgeList) {
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(currentNodeList, currentEdgeList);

        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
      }
    },
    [nodes, edges]
  );

  const isValidConnection = useCallback(
    (connection) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once

      const target = nodes.find((node) => node.id === connection.target);
      const hasCycle = (node, visited = new Set()) => {
        if (visited.has(node.id)) return false;

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      if (!target || target.id === connection.source) return false;
      return !hasCycle(target);
    },
    [nodes, edges]
  );

  const onNodeDrag = useCallback(
    (_, node) => {
      const intersections = getIntersectingNodes(node).map((n) => n.id);
      const [firstIntersection = null] = intersections;
      const getClassName = (id) =>
        firstIntersection && firstIntersection === id ? "highlight" : "";

      setNodes((ns) =>
        ns.map((n) => ({
          ...n,
          className: getClassName(n.id),
        }))
      );
    },
    [setNodes, getIntersectingNodes]
  );

  const onNodeDragStop = useCallback(
    async (_, node) => {
      const intersections = getIntersectingNodes(node).map((n) => n.id);
      const [firstIntersection = null] = intersections;

      if (firstIntersection) {
        const connection = { source: firstIntersection, target: node.id };
        const isValid = isValidConnection(connection);
        const managerId = node.data.managerId;

        if (isValid && managerId !== firstIntersection) {
          await updateUser({
            id: node.id,
            manager: firstIntersection,
          });
        } else {
          onLayout();
        }
      }
    },
    [nodes, edges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onNodeDrag={onNodeDrag}
      onNodeDragStop={onNodeDragStop}
      onInit={setReactFlowInstance}
      className="org-tree-flow"
      fitView
      selectNodesOnDrag={false}
    >
      <Controls />
    </ReactFlow>
  );
}

export default function OrgTree(attrs) {
  return (
    <ReactFlowProvider>
      <OrgTreeFlow {...attrs} />
    </ReactFlowProvider>
  );
}
