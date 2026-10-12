import { useEffect, useState } from 'react';

import { Box, Button, Grid, IconButton, TextField, Snackbar ,Paper,Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { xml } from '@codemirror/lang-xml';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Loader from '../components/Loader/Loader';
import UserSidebar from '../components/UserSidebar';
import { updateBusinessWorkflow, updateFlowDiagram, updateNewFlow, updateSelectedFile, updateStep, updateType, updateUuid, updateYamlCode, updateYamlStatus } from '../app/chatSlice';
import mammoth from 'mammoth';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import { load, dump } from 'js-yaml';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import AgentList from './AgentList';
import FlowDiagram from './FlowDiagram';
import AddAgentPopup from './AddAgentPopup';
import GraphVisualization from './GraphVisualization';
import Markdown from './Markdown';

// Styled Dialog component
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}
CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

// CreateConfig component
function CreateConfig() {
  function filterYaml(fullYaml) {
    if (fullYaml === '') return fullYaml;
    const parsed = load(fullYaml);

    if (parsed?.agents === undefined) {
      return fullYaml;
    }
    const filteredAgents = parsed?.agents.map((agent) => ({
      name: agent.name,
      agent_description: agent.agent_description,
      tools: agent.tools.map((tool) => ({
        tool_name: tool.tool_name,
      })),
    }));

    const filtered = {
      agents: filteredAgents,
      workflow: parsed?.workflow,
    };

    return dump(filtered);
  }
  const firstTabData = useSelector((state) => state.chat.firstTabData);
  const graph_data = useSelector((state) => state.chat.graph_data)
  const chain_of_thought = useSelector((state) => state.chat.chainOfThought)
  const [value, setValue] = useState(3);

  const [showAddAgentPopup, setShowAddAgentPopup] = useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // State variables for managing the component's state
  const [openDiagram, setOpenDiagram] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const uid = useSelector((state) => state.chat.uuid);
  const code = useSelector((state) => state.chat.yaml_code);
  const [upload_success, setUpload_success] = useState(false);
  const [upload_failed, setUpload_failed] = useState(false);
  const leftOpen = useSelector((state) => state.chat.collapse)
  const handleupload = async () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const file = new File([blob], 'code.yaml', { type: 'text/plain' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await fetch(`${process.env.REACT_APP_BASE_URL}/upload-config/${uid}`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        setUpload_failed(true);
        dispatch(updateYamlStatus('failed'));
        return;
      } else {
        fetch(`${process.env.REACT_APP_BASE_URL}/update_model_config/${uid}?model_name=${process.env.REACT_APP_MODEL_NAME}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setUpload_success(true);
            dispatch(updateYamlStatus('success'));
          })
          .catch((error) => {
            setUpload_failed(true);
            dispatch(updateYamlStatus('failed'));
          });

        return;
      }
    } catch (error) {
      dispatch(updateYamlStatus('failed'));
      setUpload_failed(true);
    }
  };

  const handleProcess = async (input) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('input_data', input);

    fetch(`${process.env.REACT_APP_BASE_URL}/process/dspy_priority/${uid}`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error('Config file upload failed');
        }
      })
      .then((data) => {
        dispatch(updateFlowDiagram(data));
        console.log('flow diagram completed :' + JSON.stringify(data));
        // input = data;
      })
      .catch((error) => {
        console.error('Flow diagram Error:', error);
        dispatch(
          updateFlowDiagram([
            {
              steps: 'some error occured while generating process steps',
              cognitive_complexity: 'high',
              automation_feasibility: 'semi-automatable',
              risk_level: 'high',
              impact_level: 'high',
            },
          ])
        );
      });

    formData.append('input_data', input);
    formData.append('type', 'multiple');
    formData.append('agent_list', []);
    fetch(`${process.env.REACT_APP_BASE_URL}/process/multiple/${uid}`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          console.log('Error while generating config file :' + response);
          throw new Error('Config file generating failed');
        }
      })
      .then((data) => {
        // dispatch(updateYamlCode(data);
        console.log('YAML Generated :' + data);
        dispatch(updateYamlCode(data));
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        // dispatch(updateYamlCode('Error while generating config');
        dispatch(updateYamlCode('Error while generating config'));
        dispatch(
          updateFlowDiagram([
            {
              steps: 'some error occured while generating config',
              cognitive_complexity: 'high',
              automation_feasibility: 'semi-automatable',
              risk_level: 'high',
              impact_level: 'high',
            },
          ])
        );
        setLoading(false);
      });
  };

  // Render the component
  return (
    <>
      {/* This is complete CreateConfig component */}
      <Grid
        sx={{
          minWidth: (!leftOpen) ? '80vw' : '52vw',
          maxWidth: (!leftOpen) ? '80vw' : '52vw',
          maxHeight: '84vh',
          minHeight: '84vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'start',
          alignItems: 'start',
          backgroundColor: '#f9f9f9'
        }}
      >

        <Grid
          sx={{
            minWidth: (!leftOpen) ? '80vw' : '64vw',
            maxWidth: (!leftOpen) ? '80vw' : '64vw',
            maxHeight: '84vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'start',
            alignItems: 'start'
          }}
        >


          {/* This is the container for the YAML code preview on right component */}
          <Grid
            sx={{
              position: 'relative',
              minWidth: (!leftOpen) ? '80vw' : '64vw',
              maxWidth: (!leftOpen) ? '80vw' : '64vw',
              minHeight: '84vh',
              maxHeight: '84vh',
              overflowY: 'scroll',
              scrollbarWidth: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'start',
              alignItems: 'center',
            }}
          >
            {/* Shows when loading is false */}
            {!loading &&
              (!firstTabData ? (
                <Grid sx={{ color: 'orange', minHeight: '70vh', maxHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Please Process Files First!</Grid>
              ) : (
                <>
                  {/* Heading  */}
                  <Box sx={{ minWidth: '100%' }}>
                    <Tabs value={value} onChange={handleChange} textColor="primary" variant="fullWidth" indicatorColor="primary" aria-label="Application Cognition Entities">
                      <Tab sx={{ fontSize: '0.7rem', }} label="Process Steps" />
                      <Tab sx={{ fontSize: '0.7rem', }} label="Chain of Thoughts" />
                      <Tab sx={{ fontSize: '0.7rem', }} label="Ontology" />
                      <Tab sx={{ fontSize: '0.7rem', }} label="Agents" />
                      <Tab sx={{ fontSize: '0.7rem', }} label="YAML" />
                    </Tabs>
                  </Box>
                  <Grid sx={{ borderRadius: '5px', minWidth: '100%', maxWidth: '100%', minHeight: '77vh', maxHeight: '77vh', overflowY: 'auto', scrollbarWidth: 'none' }}>


                    <CustomTabPanel sx={{ minWidth: '100%' }} value={value} index={0}>
                      <FlowDiagram />
                    </CustomTabPanel>
                    <CustomTabPanel sx={{ minWidth: '100%' }} value={value} index={1}>
                       <Typography fontSize={'0.9rem'} sx={{minWidth: '97%', maxWidth: '97%',minHeight: '72vh', maxHeight: '72vh',padding:'2vh', paddingInline:'5vh'}}>
                          <Markdown markdownText={chain_of_thought} />
                        </Typography>
                    </CustomTabPanel>
                    <CustomTabPanel sx={{ minWidth: '100%' }} value={value} index={2}>
                      <GraphVisualization rawData={graph_data} />
                    </CustomTabPanel>
                    <CustomTabPanel sx={{ minWidth: '100%' }} value={value} index={4}>
                      <Grid sx={{ width: '100%', display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
                        <div>YAML (sample) outlining Agentic Workflow</div>
                      </Grid>

                      {/* Code editor Section */}
                      <CodeMirror
                        value={filterYaml(code)}
                        style={{
                          width: '100%',
                          minHeight: '62%',
                          maxHeight: '62%',
                          overflowY: 'scroll',
                          scrollbarWidth: 'thin',
                        }}
                        extensions={[yaml()]}
                        theme="none"
                        onChange={(value) => {
                          // dispatch(updateYamlCode(value);
                          dispatch(updateYamlCode(value));
                        }}
                      />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={3}>
                      {code !== '' && (
                        <Grid sx={{ marginRight: '1vw', marginTop: '1vh', display: 'flex', justifyContent: 'end' }}>
                          <Button
                            height="100%"
                            variant="outlined"
                            color="secondary"
                            size="small"
                            sx={{ marginRight: '1vw' }}
                            onClick={() => {
                              setOpenDiagram(true);
                            }}
                          // onClick={()=>{setSaver(true)}}
                          >
                            BLUEPRINT
                          </Button>
                          <Button
                            height="100%"
                            variant="outlined"
                            color="secondary"
                            size="small"
                            sx={{ marginRight: '1vw' }}
                            onClick={() => {
                              setShowAddAgentPopup(true);
                            }}
                          // onClick={()=>{setSaver(true)}}
                          >
                            Add Agent
                          </Button>
                          <Button
                            height="100%"
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={() => {
                              handleupload();
                            }}
                          // onClick={()=>{setSaver(true)}}
                          >
                            Confirm
                          </Button>
                        </Grid>
                      )}
                      <Grid sx={{ maxWidth: (!leftOpen) ? '80vw' : '64vw', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        <AgentList yamlContent={code} layout={(!leftOpen) ? 'double' : 'single'} />
                      </Grid>
                    </CustomTabPanel>
                  </Grid>
                </>
              ))}

            {/* Shows when loading is true */}
            {loading && <Loader />}
          </Grid>


          {/* This is the popup that is used to displays the Blueprint */}
          <BootstrapDialog
            onClose={() => {
              setOpenDiagram(false);
            }}
            aria-labelledby="customized-dialog-title"
            open={openDiagram}
            fullWidth={true}
            maxWidth={'xl'}
            PaperProps={{
              sx: {
                backgroundColor: '#eee', // Plain color
                backgroundImage: 'linear-gradient(to right, white, #eee)', // Or your gradient
              },
            }}
          >
            <DialogTitle sx={{ m: 0, p: 2, width: '90%' }} id="customized-dialog-title">
              <div>Blueprint</div>
            </DialogTitle>

            <IconButton
              aria-label="close"
              onClick={() => {
                setOpenDiagram(false);
              }}
              sx={(theme) => ({
                position: 'absolute',
                right: 8,
                top: 8,
                color: theme.palette.grey[500],
              })}
            >
              <CloseIcon />
            </IconButton>

            {/* Content of the popup */}
            <DialogContent
              dividers
              sx={{
                height: '80vh',
                width: '90vw',
              }}
            >
              {/* Blueprint Content */}
              {/* uid => T2 for ProcessintelBlueprint && T4 for Different Blueprint */}
              <UserSidebar yaml={code} />
            </DialogContent>
          </BootstrapDialog>
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={upload_success}
            autoHideDuration={6000}
            onClose={() => {
              setUpload_success(false);
            }}
          >
            <Alert
              onClose={() => {
                setUpload_success(false);
              }}
              severity="success"
              variant="filled"
              sx={{ width: '100%' }}
            >
              Config Uploaded successfully!
            </Alert>
          </Snackbar>
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={upload_failed}
            autoHideDuration={6000}
            onClose={() => {
              setUpload_failed(false);
            }}
          >
            <Alert
              onClose={() => {
                setUpload_failed(false);
              }}
              severity="error"
              variant="filled"
              sx={{ width: '100%' }}
            >
              Config Uploaded failed!
            </Alert>
          </Snackbar>
        </Grid>
      </Grid>
      <AddAgentPopup open={showAddAgentPopup} onClose={() => setShowAddAgentPopup(false)} yamlContent={code} uid={uid} />
    </>
  );
}

export default CreateConfig;
