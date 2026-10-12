import React, { useState, useEffect } from 'react';
import { Paper, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Accordion, AccordionSummary, AccordionDetails, Checkbox, FormControlLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FaCog } from 'react-icons/fa';
import AIAgent from '../assets/orange_agent.png';
import yaml from 'js-yaml';
import { useDispatch } from 'react-redux';
import { updateYamlCode } from '../app/chatSlice';
import { Padding } from '@mui/icons-material';
import Markdown from './Markdown';

const AddAgentPopup = ({ open, onClose, yamlContent, uid }) => {
  const dispatch = useDispatch();

  const [predefinedToolsCatalog, setPredefinedToolsCatalog] = useState({
    task_generation: {
      tool_name: 'task_generation',
      type: 'pre-defined',
      config: {
        tool_description: 'Generates and manages task workflows.',
        prompt: 'Generate new tasks or workflows from user input.',
      },
    },

    analysis_support: {
      tool_name: 'analysis_support',
      type: 'pre-defined',
      config: {
        tool_description: 'Provides analytical support and diagnostic insights.',
        prompt: 'Assist with analysis and diagnostics based on input data.',
      },
    },

    resolution: {
      tool_name: 'resolution',
      type: 'pre-defined',
      config: {
        tool_description: 'Provides resolutions or recommended actions for identified issues.',
        prompt: 'Suggest resolutions or actions for a given problem or context.',
      },
    },
    extract_data: {
      tool_name: 'extract_data',
      type: 'pre-defined',
      config: {
        tool_description: 'Extracts relevant data from provided inputs.',
        prompt: 'Extract structured information from input data.',
        url: '<Data URL(GET) is required>',
      },
    },
    mcp_tool: {
      tool_name: 'mcp_tool',
      type: 'pre-defined',
      config: {
        tool_description: 'Handles MCP-related operations and integrations.',
        prompt: 'Handle MCP-related operations and data exchanges.',
        url: '<MCP URL is required>',
      },
    },

    a2a_tool: {
      tool_name: 'a2a_tool',
      type: 'pre-defined',
      config: {
        tool_description: 'Facilitates A2A communication and data processing.',
        prompt: 'Process A2A communications or related tasks.',
        url: '<A2A URL is required>',
      },
    },
  });

  useEffect(() => {
    setSelectedPredefinedTools({});
    setCustomTools([]);
    setNewAgent({
      name: '',
      agent_description: '',
      instructions: '',
    });
    setAgentInput('');
    setApiResponse('');
    setTestButtonText('Test Agent');
  }, [open]);
  const [customTools, setCustomTools] = useState([]);

  const [selectedPredefinedTools, setSelectedPredefinedTools] = useState({});
  const [accordionExpanded, setAccordionExpanded] = useState(false);

  const [newAgent, setNewAgent] = useState({
    name: '',
    agent_description: '',
    instructions: '',
  });

  const [agentInput, setAgentInput] = useState('');
  const [apiResponse, setApiResponse] = useState('');
  const [testButtonText, setTestButtonText] = useState('Test Agent');

  const handleChange = (field, value) => {
    setNewAgent((prev) => ({ ...prev, [field]: value }));
  };

  const handleToolChange = (index, field, value) => {
    const updated = [...customTools];
    if (field in updated[index]) {
      updated[index][field] = value;
    } else {
      updated[index].config[field] = value;
    }
    setCustomTools(updated);
  };

  const handleAddTool = () => {
    setCustomTools((prev) => [
      ...prev,
      {
        tool_name: '',
        type: 'custom_tool',
        config: {
          tool_description: '',
          prompt: '',
          url: '',
          tool_body: `
            <required if the type is custom_tool>
            from llm_model import initialize_llm, initialize_reasoning_llm #Already should be present
            from langchain_core.tools import tool #Already should be present
            import requests #Already should be present
            @tool(description=<replace this with tool_description>)#Already should be present
            def <replace it with tool_name>(input_data: str) -> str:
              try:
                prompt = "custom_prompt" #DO NOT CHANGE THIS LINE
                response = initialize_llm().invoke(prompt+input_data)
                return response
              except Exception as e:
                return f"Error in analysis: {str(e)}"`,
        },
      },
    ]);
  };

  const handleRemoveTool = (index) => {
    setCustomTools((prev) => prev.filter((_, i) => i !== index));
  };

  const togglePredefinedTool = (toolKey) => {
    setSelectedPredefinedTools((prev) => ({
      ...prev,
      [toolKey]: !prev[toolKey],
    }));
  };

  const handleTestAPI = async () => {
    setTestButtonText('Testing...');
    if (!newAgent || !agentInput) {
      setApiResponse('Missing agent or input.');
      setTestButtonText('Test Agent');
      return;
    }

    const selectedTools = [
      ...customTools,
      ...Object.entries(selectedPredefinedTools)
        .filter(([key, val]) => val)
        .map(([key]) => predefinedToolsCatalog[key]),
    ];

    try {
      const agentYamlObject = {
        agents: [
          {
            ...newAgent,
            tools: selectedTools,
          },
        ],
        workflow: {
          nodes: [
            {
              name: newAgent.name,
              agent: newAgent.name,
            },
          ],
        },
      };

      const yamlContent = yaml.dump(agentYamlObject, { sortKeys: false });
      const yamlBlob = new Blob([yamlContent], { type: 'text/yaml' });
      const yamlFile = new File([yamlBlob], 'agent.yaml', { type: 'text/yaml' });

      const formData = new FormData();
      formData.append('user_input', agentInput);
      formData.append('file', yamlFile);

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/process/single_agent/${uid}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      setApiResponse('**Agent Response:**\n' + data);
    } catch (err) {
      setApiResponse(`Error: ${err.message}`);
    } finally {
      setTestButtonText('Test Agent');
    }
  };

  const handleAddAgent = () => {
    let parsedYaml;
    try {
      parsedYaml = yaml.load(yamlContent);
    } catch (err) {
      console.error('Failed to parse YAML:', err);
      return;
    }

    if (!parsedYaml.agents) parsedYaml.agents = [];
    if (!parsedYaml.workflow) parsedYaml.workflow = { nodes: [] };
    if (!parsedYaml.workflow.nodes) parsedYaml.workflow.nodes = [];

    const nodes = parsedYaml.workflow.nodes;

    let commAgentIndex = nodes.findIndex((node) => node.name === 'communication_agent');
    if (commAgentIndex === -1) {
      nodes.push({
        name: 'communication_agent',
        type: 'agent',
        agent: 'communication_agent',
      });
      commAgentIndex = nodes.length - 1;
    }

    const penultimateNodes = nodes.filter((node) => Array.isArray(node.next) && node.next.includes('communication_agent'));

    const selectedTools = [
      ...customTools,
      ...Object.entries(selectedPredefinedTools)
        .filter(([key, val]) => val)
        .map(([key]) => predefinedToolsCatalog[key]),
    ];

    const finalAgent = {
      ...newAgent,
      tools: selectedTools,
    };

    if (!parsedYaml.agents.find((a) => a.name === newAgent.name)) {
      parsedYaml.agents.push(finalAgent);
    }

    if (!nodes.find((n) => n.name === newAgent.name)) {
      const newNode = {
        name: newAgent.name,
        type: 'agent',
        agent: newAgent.name,
        next: ['communication_agent'],
      };

      nodes.splice(commAgentIndex, 0, newNode);

      penultimateNodes.forEach((node) => {
        node.next = node.next.map((n) => (n === 'communication_agent' ? newAgent.name : n));
      });
    }

    const newYamlString = yaml.dump(parsedYaml, { noRefs: true });
    dispatch(updateYamlCode(newYamlString));
    onClose();
  };

  const selectedCount = Object.values(selectedPredefinedTools).filter(Boolean).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Agent</DialogTitle>
      <DialogContent dividers>
        {/* Agent Info */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <img src={AIAgent} alt="Agent Icon" style={{ width: '32px', height: '32px', marginRight: '10px' }} />
          <TextField label="Agent Name" fullWidth size="small" value={newAgent.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>

        <TextField label="Agent Description" fullWidth size="small" multiline minRows={2} value={newAgent.agent_description} onChange={(e) => handleChange('agent_description', e.target.value)} />
        <TextField label="Agent Instructions" fullWidth multiline size="small" minRows={2} value={newAgent.instructions || ''} onChange={(e) => handleChange('instructions', e.target.value)} style={{ marginTop: '16px' }} />

        {/* Accordion for Predefined Tools */}
        <Accordion expanded={accordionExpanded} onChange={() => setAccordionExpanded(!accordionExpanded)} style={{ marginTop: '24px' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <strong>Predefined Tools</strong>
            <span style={{ marginLeft: 'auto', color: 'gray' }}>{selectedCount} selected</span>
          </AccordionSummary>

          <AccordionDetails>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(predefinedToolsCatalog).map(([key, tool]) => (
                <Paper
                  key={key}
                  variant="outlined"
                  sx={{
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    borderRadius: 1,
                    bgcolor: selectedPredefinedTools[key] ? 'action.selected' : 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  elevation={0}
                  onClick={() => togglePredefinedTool(key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Checkbox checked={!!selectedPredefinedTools[key]} onChange={(e) => e.stopPropagation()} size="small" />
                    <FaCog style={{ color: 'orange', marginRight: '8px' }} />
                    <div>
                      <Typography variant="subtitle1" component="div" fontWeight="600">
                        {tool.tool_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 350 }}>
                        {tool.config.tool_description}
                      </Typography>
                    </div>
                  </div>

                  {/* ✅ Show URL input if tool.config.url exists (even if empty) */}
                  {tool.config.hasOwnProperty('url') && (
                    <TextField
                      size="small"
                      fullWidth
                      placeholder="Enter tool URL..."
                      value={tool.config.url || ''}
                      // onClick={(e) => e.stopPropagation()} // prevent toggle
                      onChange={(e) => {
                        setPredefinedToolsCatalog((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            config: { ...prev[key].config, url: e.target.value },
                          },
                        }));
                      }}
                      sx={{
                        mt: 0.5,
                        '& .MuiInputBase-input': {
                          fontSize: '0.8rem',
                          padding: '4px 6px',
                        },
                      }}
                    />
                  )}
                </Paper>
              ))}
            </div>
          </AccordionDetails>
        </Accordion>

        {/* Custom Tools */}
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Custom Tools</strong>
            <Button onClick={handleAddTool} variant="outlined" color="secondary" size="small" style={{ color: 'orange' }}>
              + Add Tool
            </Button>
          </div>
          {customTools.map((tool, i) => (
            <div key={i} style={{ marginTop: '15px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                <FaCog style={{ color: 'orange', marginRight: '6px' }} />
                <TextField label="Tool Name" value={tool.tool_name} size="small" onChange={(e) => handleToolChange(i, 'tool_name', e.target.value)} fullWidth />
              </div>
              <TextField label="Tool Description" value={tool.config.tool_description} onChange={(e) => handleToolChange(i, 'tool_description', e.target.value)} fullWidth multiline minRows={2} size="small" margin="dense" />
              <TextField label="Prompt" value={tool.config.prompt} onChange={(e) => handleToolChange(i, 'prompt', e.target.value)} fullWidth size="small" margin="dense" />
              <TextField label="MCP Server URL" value={tool.config.url} onChange={(e) => handleToolChange(i, 'url', e.target.value)} fullWidth size="small" margin="dense" />
              {customTools.length >= 1 && (
                <Button size="small" onClick={() => handleRemoveTool(i)} style={{ color: 'red', marginTop: '6px' }}>
                  Remove Tool
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Agent Input and Response */}
        <TextField label="Agent Input for Testing" fullWidth multiline minRows={3} value={agentInput} onChange={(e) => setAgentInput(e.target.value)} style={{ marginTop: '24px' }} />
        <br />
        <br></br>
        {apiResponse && (
          <div style={{ backgroundColor: '#F2F2F2', padding: '2vh' }}>
            <Markdown markdownText={apiResponse} />
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleTestAPI} variant="outlined">
          {testButtonText}
        </Button>
        <Button variant="contained" onClick={handleAddAgent}>
          Add Agent
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAgentPopup;
