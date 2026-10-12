import ReactFlow, { 
  useNodesState, 
  useEdgesState, 
  Controls // 1. Import Controls
} from 'reactflow';
import AgentNode from './AgentNode.jsx';
import TaskNode from './TaskNode.jsx';
import 'reactflow/dist/style.css';
import { AnimatedSVGEdge } from './ArchAnimatedEdge.tsx';

const nodeTypes = {
  Agent: AgentNode,
  Task: TaskNode,
};

const edgeTypes = {
  animatedSvg: AnimatedSVGEdge,
};

export default function BluePrint({ yaml_node, yaml_edges, error}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(yaml_node);
  const [edges, setEdges, onEdgesChange] = useEdgesState(yaml_edges);

  const proOptions = { hideAttribution: true };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      { error === undefined && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          panOnDrag={true}
          zoomOnDoubleClick={false}
          nodesDraggable={true}
          zoomOnScroll={false}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          edgeTypes={edgeTypes}
          proOptions={proOptions}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          preventScrolling={false}
        >
          {/* 2. Place Controls here */}
          <Controls /> 
        </ReactFlow>
      )}
      {error !== undefined && <div>{error.message}</div>}
    </div>
  );
}