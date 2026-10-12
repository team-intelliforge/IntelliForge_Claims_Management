import { Grid } from '@mui/material';
import BluePrint from './BluePrint';
import { load } from 'js-yaml';
// Component to display the BLUEPRINT or ARCHITECTURE DIAGRAM
function UserSidebar({ yaml }) {
  function parseYamlToFlow(yamlText) {
    try {
      const data = load(yamlText);

      // Treat Supervisor exactly like Orchestrator
      if (data?.workflow?.nodes) {
        data.workflow.nodes = data.workflow.nodes.map((node) => ({
          ...node,
          name: node.name === 'Supervisor' ? 'Orchestrator' : node.name,
        }));
      }

      const nodes = [];
      const edges = [];
      const agentIds = {};
      const usedIds = new Set();

      const xBase = 150;
      const xGap = 550;
      const agentY = 250;
      const OrchestratorY = 0;
      const toolYOffset = 250;
      const toolVerticalGap = 200;

      function createId(name) {
        let id = String(Math.abs(hashCode(name)) % 10000);
        while (usedIds.has(id)) {
          id = String(Number(id) + 1);
        }
        usedIds.add(id);
        return id;
      }

      function hashCode(str) {
        return str.split('').reduce((a, b) => {
          a = ((a << 5) - a + b.charCodeAt(0)) | 0;
          return a;
        }, 0);
      }

      // Filter workflow nodes
      const workflowNodes = data.workflow.nodes.filter((n) => n.name !== 'communication_agent');
      const agentNodes = workflowNodes.filter((n) => n.name !== 'Orchestrator');
      const agentPositions = {};

      // Assign x positions to agents
      agentNodes.forEach((node, idx) => {
        const x = xBase + idx * xGap;
        agentPositions[node.name] = x;
      });

      const agentXs = Object.values(agentPositions);
      const OrchestratorX = agentXs.length > 0 ? agentXs.reduce((a, b) => a + b, 0) / agentXs.length : 0;

      // Create Orchestrator + Agent nodes
      workflowNodes.forEach((node) => {
        const name = node.name;
        const isOrchestrator = name === 'Orchestrator';
        const x = isOrchestrator ? OrchestratorX : agentPositions[name];
        const y = isOrchestrator ? OrchestratorY : agentY;
        const description = isOrchestrator ? 'Orchestrator that decides which Agent to select to perform the task.' : data.agents.find((a) => a.name === node.agent)?.agent_description || '';
        const source = isOrchestrator ? 'left' : 'right';
        const target = isOrchestrator ? 'right' : 'left';
        
        const nodeId = createId(name);
        agentIds[name] = nodeId;

        if(name.includes('rule_based')){
          nodes.push({
            id: nodeId,
            type: 'Task',
            position: { x,y },
            data: { tool_type: 'rpa', name: name, description:description, source:target, target:source},
          });
          }
        else{
          nodes.push({
          id: nodeId,
          type: 'Agent',
          position: { x, y },
          data: { name: name.replace('Agent', ' Agent').replace('Relations', ' Relations'), description, source, target },
        });
        }
        
      });

      // Add tools under each agent
      data.agents.forEach((agent) => {
        const name = agent.name;
        const parentId = agentIds[name];
        if (!parentId) return;

        const agentX = agentPositions[name];
        agent.tools?.forEach((tool, i) => {
          const toolId = createId(tool.tool_name);
          const toolDescription = tool.config?.tool_description || '';
          const toolName = tool.tool_name.replace('Handler', ' Handler tool').replace('Monitor', ' Monitor tool').replace('Notifier', ' Notifier tool').replace('Collector', ' Collection Coordinator tool').replace('Runner', ' Manager tool').replace('Manager', ' Manager tool');
          const type = tool.type || '';
          nodes.push({
            id: toolId,
            type: 'Task',
            position: { x: agentX, y: agentY + toolYOffset + i * toolVerticalGap },
            data: { tool_type: type, name: toolName, description: toolDescription, source: 'top', target: 'top' },
          });

          edges.push({
            id: `${parentId}->${toolId}`,
            type: 'default',
            source: parentId,
            target: toolId,
            sourceHandle: 'source-bottom',
          });
        });
      });

      // Only orchestrator <-> agent edges. No agent-to-agent connections.
      const orchestratorId = agentIds['Orchestrator'];
      if (orchestratorId) {
        agentNodes.forEach((agentNode) => {
          const agentName = agentNode.name;
          const agentId = agentIds[agentName];
          if (!agentId) return;

          const isAgentOnLeft = (agentPositions[agentName] ?? OrchestratorX) < OrchestratorX;

          // Orchestrator -> Agent
          edges.push({
            id: `${orchestratorId}->${agentId}`,
            type: 'default',
            source: orchestratorId,
            target: agentId,
            sourceHandle: isAgentOnLeft ? 'source-bottom-left' : 'source-bottom-right',
            targetHandle: isAgentOnLeft ? 'target-right' : 'target-left',
          });

          // Agent -> Orchestrator (loop back)
          edges.push({
            id: `${agentId}->${orchestratorId}`,
            type: 'default',
            source: agentId,
            target: orchestratorId,
            sourceHandle: isAgentOnLeft ? 'source-left' : 'source-right',
            targetHandle: isAgentOnLeft ? 'target-left' : 'target-right',
          });
        });
      }

      return { initialNodes: nodes, initialEdges: edges, error: undefined };
    } catch (error) {
      console.error('Error parsing YAML:', error);
      return { initialNodes: [], initialEdges: [], error: error };
    }
  }

  const { initialNodes, initialEdges, error } = parseYamlToFlow(yaml);

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        width: '100%',
        height: '100%',
      }}
    >
      {/* Blueprint for DOC upload */}
      <BluePrint yaml_edges={initialEdges} yaml_node={initialNodes} error={error} />
    </Grid>
  );
}

export default UserSidebar;