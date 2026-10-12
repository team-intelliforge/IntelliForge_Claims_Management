import React, { useEffect, useState } from 'react';
import yaml from 'js-yaml';
import { FaCog, FaEdit, FaTrash } from 'react-icons/fa';
import AIAgent from '../assets/orange_agent.png';
import { useDispatch } from 'react-redux';
import { updateYamlCode } from '../app/chatSlice';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const AgentList = ({ yamlContent, layout = 'single' }) => {
  const dispatch = useDispatch();

  const [parsedYaml, setParsedYaml] = useState(null);
  const [agents, setAgents] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(null);
  const [editableAgent, setEditableAgent] = useState(null);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (!yamlContent) return;

    setDocuments([]);

    try {
      const parsed = yaml.load(yamlContent);
      setParsedYaml(parsed);

      const agentList = (parsed?.agents || []).map((agent) => ({
        name: agent.name,
        agent_description: agent.agent_description,
        tools: (agent.tools || []).map((tool) => ({
          tool_name: tool.tool_name,
          tool_description: (tool.config?.tool_description || 'No description available').trimStart(),
        })),
      }));
      setAgents(agentList);
    } catch (err) {
      console.error('Error parsing YAML:', err);
    }
  }, [yamlContent]);

  const handleEditClick = (index) => {
    if (!parsedYaml?.agents) return;
    const agent = JSON.parse(JSON.stringify(parsedYaml.agents[index]));
    setCurrentAgentIndex(index);
    setEditableAgent(agent);
    setDocuments([]);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentAgentIndex(null);
    setEditableAgent(null);
    setDocuments([]);
  };

  const handleChange = (field, value) => {
    setEditableAgent((prev) => ({ ...prev, [field]: value }));
  };

  const handleToolChange = (toolIndex, field, value) => {
    setEditableAgent((prev) => {
      const updatedTools = [...prev.tools];
      if (field === 'tool_name') {
        updatedTools[toolIndex].tool_name = value;
      } else {
        updatedTools[toolIndex].config = {
          ...updatedTools[toolIndex].config,
          [field]: value,
        };
      }
      return { ...prev, tools: updatedTools };
    });
  };

  const handleSave = () => {
    if (currentAgentIndex === null || !editableAgent || !parsedYaml?.agents) return;

    const updatedYaml = { ...parsedYaml };
    updatedYaml.agents[currentAgentIndex] = editableAgent;

    const newYamlStr = yaml.dump(updatedYaml, { sortKeys: false });
    dispatch(updateYamlCode(newYamlStr));
    setParsedYaml(updatedYaml);
    setOpen(false);
    setCurrentAgentIndex(null);
    setEditableAgent(null);
    setDocuments([]);
  };

  const handleDelete = (index) => {
    if (!parsedYaml?.agents || !parsedYaml?.workflow?.nodes) return;

    const agentToDelete = parsedYaml.agents[index].name;

    const updatedAgents = [...parsedYaml.agents];
    updatedAgents.splice(index, 1);

    const oldNodes = parsedYaml.workflow.nodes;

    const nodeToDelete = oldNodes.find((node) => node.agent === agentToDelete || node.name === agentToDelete);

    const newTargets = nodeToDelete?.next || [];

    const updatedNodes = oldNodes
      .filter((node) => node !== nodeToDelete)
      .map((node) => {
        let updatedNext = node.next?.filter((n) => n !== agentToDelete) || [];

        if (node.next?.includes(agentToDelete)) {
          updatedNext = [...updatedNext, ...newTargets];
        }

        const updatedNode = { ...node };

        if (updatedNext.length > 0) {
          updatedNode.next = [...new Set(updatedNext)];
        } else {
          delete updatedNode.next;
        }

        return updatedNode;
      });

    const updatedYaml = {
      ...parsedYaml,
      agents: updatedAgents,
      workflow: {
        ...parsedYaml.workflow,
        nodes: updatedNodes,
      },
    };

    const newYamlStr = yaml.dump(updatedYaml, {
      sortKeys: false,
      lineWidth: -1,
    });

    dispatch(updateYamlCode(newYamlStr));
    setParsedYaml(updatedYaml);

    const agentList = updatedAgents.map((agent) => ({
      name: agent.name,
      agent_description: agent.agent_description,
      tools: (agent.tools || []).map((tool) => ({
        tool_name: tool.tool_name,
        tool_description: (tool.config?.tool_description || 'No description available').trimStart(),
      })),
    }));
    setAgents(agentList);
  };

  const handleAddDocument = () => {
    setDocuments((prev) => [...prev, '']);
  };

  const handleDocumentChange = (index, value) => {
    setDocuments((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Determine container style based on layout prop
  const containerStyle = {
    ...styles.container,
    display: 'grid',
    gridTemplateColumns: layout === 'double' ? '1fr 1fr' : '1fr',
    gap: '18px',
    maxWidth: layout === 'double' ? '100%' : '70%',
    width: '100%',
  };

  return (
    <div style={containerStyle}>
      {agents.map((agent, index) => (
        <div key={index} style={styles.card}>
          <div style={styles.name}>
            <div style={styles.nameWrapper}>
              <div style={styles.iconBadge}>
                <img src={AIAgent} alt="icon" style={styles.iconImage} />
              </div>
              <span style={styles.agentName}>{agent.name}</span>
            </div>
            <div style={styles.buttonGroup}>
              <button onClick={() => handleEditClick(index)} style={styles.editButton} aria-label={`Edit ${agent.name}`}>
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(index)} style={styles.deleteButton} aria-label={`Delete ${agent.name}`}>
                <FaTrash />
              </button>
            </div>
          </div>

          <div style={styles.description}>{agent.agent_description}</div>

          {agent.tools.length > 0 && (
            <div style={styles.toolsSection}>
              <div style={styles.sectionLabel}>ASSOCIATED SUB-TOOLS</div>
              <div style={styles.tools}>
                {agent.tools.map((tool, i) => (
                  <div key={i} style={styles.toolRow}>
                    <span style={styles.bullet} />
                    <div style={styles.toolContent}>
                      <div style={styles.tool}>{tool.tool_name}</div>
                      <div style={styles.toolDescription}>
                        <i>{tool.tool_description}</i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Edit Agent Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Agent Details</DialogTitle>
        <DialogContent dividers>
          {editableAgent && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', marginBottom: '16px' }}>
                <img src={AIAgent} alt="Agent Icon" style={{ width: '32px', height: '32px', marginRight: '10px' }} />
                <TextField label="Agent Name" fullWidth value={editableAgent.name} onChange={(e) => handleChange('name', e.target.value)} />
              </div>

              <TextField
                label="Agent Description"
                fullWidth
                margin="normal"
                multiline
                minRows={3}
                value={editableAgent.agent_description}
                onChange={(e) => handleChange('agent_description', e.target.value)}
              />

              {currentAgentIndex === 100 && (
                <div style={{ marginTop: 20 }}>
                  <i>*Documents Required</i>
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      id="document-input"
                      multiple
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files).map((file) => file.name);
                        setDocuments((prev) => {
                          const combined = [...prev, ...newFiles];
                          return Array.from(new Set(combined));
                        });
                      }}
                    />
                    <Button variant="outlined" color="secondary" size="small" onClick={() => document.getElementById('document-input').click()}>
                      Add Document
                    </Button>
                  </div>
                  {documents.length === 0 && <p>No documents selected.</p>}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: 10 }}>
                    {documents.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '0.9em',
                          padding: '6px 10px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '150px',
                        }}
                        title={doc}
                      >
                        📄 {doc}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '30px' }}>
                <strong>Tools</strong>
                {editableAgent.tools.map((tool, i) => (
                  <div key={i} style={{ marginTop: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
                      <FaCog style={{ color: 'orange', marginRight: '6px' }} />
                      <TextField label="Tool Name" value={tool.tool_name} onChange={(e) => handleToolChange(i, 'tool_name', e.target.value)} fullWidth size="small" />
                    </div>
                    <TextField
                      label="Tool Description"
                      value={tool.config?.tool_description || ''}
                      onChange={(e) => handleToolChange(i, 'tool_description', e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                      size="small"
                      margin="dense"
                    />
                    <TextField label="Prompt" value={tool.config?.prompt || ''} onChange={(e) => handleToolChange(i, 'prompt', e.target.value)} fullWidth size="small" margin="dense" />
                    <TextField
                      label="MCP Server URL"
                      value={tool.config?.url || ''}
                      onChange={(e) => handleToolChange(i, 'url', e.target.value)}
                      fullWidth
                      size="small"
                      margin="dense"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

// Styles remain unchanged except container style moved inline
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    // backgroundColor: '#f9f9f9',
  },
  card: {
    border: '1px solid #dfe7f0',
    borderRadius: '12px',
    padding: '14px 16px 12px',
    backgroundColor: 'white',
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
    minHeight: '180px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    fontSize: '0.9em',
    fontWeight: '700',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  },
  nameWrapper: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    flex: 1,
    minWidth: 0,
  },
  agentName: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '18px',
    color: '#1f2937',
  },
  description: {
    marginBottom: '12px',
    color: '#3a3f46',
    fontSize: '14px',
    lineHeight: 1.5,
    overflow: 'hidden',
    wordBreak: 'break-word',
  },
  toolsSection: {
    marginTop: '10px',
    overflow: 'hidden',
    flex: 1,
    minWidth: 0,
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#6b7280',
    marginBottom: '8px',
  },
  tools: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflow: 'hidden',
  },
  toolRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    width: '100%',
  },
  bullet: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#f59e0b',
    marginTop: '8px',
    flexShrink: 0,
  },
  toolContent: {
    flex: 1,
    minWidth: 0,
  },
  tool: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '13px',
    fontWeight: 700,
    color: '#1f2937',
    marginBottom: '4px',
    lineHeight: 1.3,
    overflow: 'hidden',
    wordBreak: 'break-word',
  },
  toolDescription: {
    fontSize: '12px',
    color: '#4b5563',
    lineHeight: 1.5,
    fontStyle: 'italic',
    overflow: 'hidden',
    wordBreak: 'break-word',
  },
  iconBadge: {
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    backgroundColor: '#f5d7a8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '10px',
    border: '1px solid rgba(0,0,0,0.05)',
    flexShrink: 0,
  },
  iconImage: {
    width: '14px',
    height: '14px',
    objectFit: 'contain',
  },
  buttonGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  editButton: {
    background: '#f3f4f6',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#111827',
    fontSize: '12px',
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  deleteButton: {
    background: '#fdf2f2',
    border: '1px solid #f5c2c7',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#b91c1c',
    fontSize: '12px',
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};

export default AgentList;
