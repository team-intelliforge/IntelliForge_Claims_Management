import { Grid, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Loader from '../components/Loader/Loader';
import CreateConfig from '../components/CreateConfig';
import ChatConfig from '../components/ChatConfig';
import EvalConfig from '../components/EvalConfig';
import Button from '@mui/material/Button';
import { useDispatch, useSelector } from 'react-redux';
import { updateFlowDiagram, updateBusinessWorkflow, updateSelectedFile, updateStep, updateType, updateYamlStatus, updateYamlThought } from '../app/chatSlice';

// This is the main ProcessIntelHome component that renders the application layout and handles navigation between different sections.
const ProcessIntelHome = () => {
  const [loadLoader, setLoadLoader] = useState(false);
  const leftOpen = useSelector((state)=>state.chat.collapse)
  const [show, setShow] = useState(1);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // This effect checks if the user is authenticated when the component mounts.
  useEffect(() => {
    if (sessionStorage.getItem('isAuthenticated') !== 'true') {
      navigate('/');
    }
  }, []);

  // This function is generic and handles the click event for each step in the sidebar.
  const step = (num, name) => {
    return (
      <div
        onClick={() => {
          setShow(num)
        }}
        style={
          show !== Number(num)
            ? {
                cursor: 'pointer',
                fontSize: 'small',
                minWidth: (!leftOpen)?'16vw':'14vw', 
                maxWidth: (!leftOpen)?'16vw':'14vw',
                minHeight: '7vh',
                color: 'grey',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBlock: '1px solid #e0e0e0',
              }
            : {
                boxShadow: 'inset 3px 0 0 0 #000000',
                cursor: 'pointer',
                fontSize: 'small',
                minWidth: (!leftOpen)?'16vw':'14vw',
                 maxWidth: (!leftOpen)?'16vw':'14vw',
                minHeight: '7vh',
                color: 'black',
                backgroundColor: '#e8e8e8',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }
        }
      >
        <div style={{ marginLeft: '1vw' }}>{name}</div>
        {/* {show === Number(num) && (
          <IconButton sx={{ p: 0, marginRight: '1vw', color: '#FD5F07' }} variant="outlined">
            <CheckCircleIcon fontSize="small" />
          </IconButton>
        )} */}
      </div>
    );
  };

  return (
    <>
      {loadLoader ? (
        // If loadLoader is true, show the Loader component.
        <Loader />
      ) : (
        // If loadLoader is false, render the main application layout.

            <Grid container flexDirection={'row'} justifyContent={'start'} sx={{ marginTop:'0.5vh',maxHeight: '84vh', minHeight: '84vh', minWidth: (!leftOpen)?'95vw':'79vw', maxWidth: (!leftOpen)?'95vwvw':'79vw',backgroundColor:'#f9f9f9' }}>
              {/* Left Sidebar */}
              <Grid item container flexDirection={'column'} alignContent={'start'} justifyContent={'start'} sx={{  border: '1px solid #e0e0e0', maxHeight: '84vh',  minWidth: (!leftOpen)?'16vw':'14vw', maxWidth: (!leftOpen)?'16vw':'14vw', marginRight: '0.3vw' }}>
                {step(1, 'Create Agentic Workflow')}
                {step(2, 'Agentic Workflow Execution')}
                {/* {step(3, 'Observe Workflow')} */}
                {step(4, 'Agent Eval')}
                
              </Grid>

              {/* Main Content Area */}
              <Grid item container flexDirection={'column'} alignItems={'center'} justifyContent={'center'} maxWidth={(!leftOpen)?'80vw':'64vw'} minWidth={(!leftOpen)?'80vw':'64vw'} sx={{ border: '1px solid #e0e0e0', maxHeight: '84vh', minHeight: '84vh' }}>
                {/* Content based on selected step */}
                <Grid item container flexDirection={'column'} p={0} sx={{ maxHeight: '84vh', minHeight: '84vh', overflowY: 'auto', scrollbarWidth: 'none', borderRadius: '5px' }}>
                  {/* Create Config */}
                  {show == 1 && <CreateConfig />}
                  {/* Chat Section */}
                  {show == 2 && <ChatConfig />}
                  {/* Observe Workflow */}
                  {show == 3 && (
                    <iframe
                      // src={process.env.REACT_APP_IFRAME_URL}
                      src={'www.google.com'}
                      style={{
                        minWidth:(!leftOpen)?'80vw':'64vw',
                        maxWidth:(!leftOpen)?'80vw':'64vw',
                        height: '84vh',
                      }}
                    ></iframe>
                  )}
                  {/* Agent Eval */}
                  {show === 4 && <EvalConfig />}

                </Grid>
              </Grid>
            </Grid>
        
      )}
    </>
  );
};

export default ProcessIntelHome;
