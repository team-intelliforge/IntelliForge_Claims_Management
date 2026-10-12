import { Typography, Box, Button, Grid, IconButton, TextField, Snackbar, Tooltip, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Loader from '../components/Loader/Loader';
import CreateConfig from '../components/CreateConfig';
import RenderDocument from '../components/RenderDocuments';
import ChatConfig from '../components/ChatConfig';
import { useDispatch, useSelector } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import { updateFlowDiagram, updateBusinessWorkflow, updateSelectedFile, updateStep, updateType, updateYamlStatus, updateYamlThought } from '../app/chatSlice';
import LeftBar from '../components/LeftBar';
import ProcessIntelHome from './ProcessIntelHome';

// This is the main Home component that renders the application layout and handles navigation between different sections.
const Home = () => {
  const [loadLoader, setLoadLoader] = useState(false);
  // const [show, setShow] = useState(1);
  const show = useSelector((state) => state.chat.step);
  const firstTabData = useSelector((state) => state.chat.firstTabData)
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
          dispatch(updateStep(num))
        }}
        style={
          show !== Number(num)
            ? {
              cursor: 'pointer',
              fontWeight: 600,
              color: 'grey',
              fontSize: '15px',
              width: '33%',
              minHeight: '6vh',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              letterSpacing: '0.1em'
            }
            : {
              cursor: 'pointer',
              width: '33.5%',
              minHeight: '5vh',
              backgroundColor: '#EEF4FF',
              borderBottom: '3px solid #2563EB',
              fontWeight: 700,
              fontSize: '15px',
              color: '#2563EB',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '10px 10px 10px 10px',
              marginLeft: 4,
              letterSpacing: '0.1em'
            }
        }
      >
        <div style={{ marginLeft: '1vw' }}>{name}</div>

      </div>
    );
  };


  return (
    <>
      {(
        // If loadLoader is false, render the main application layout.
        <Grid>
          <Grid container flexDirection={'column'} justifyContent={'start'} alignItems={'start'} sx={{ minHeight: '100vh', maxHeight: '100vh', minWidth: '100vw', maxWidth: '100vw', overflow: 'hidden' }}>
            {/* Navbar */}
            <Navbar showAvatar={true} />
            {/* After Navbar Main Content */}
            <Grid container flexDirection={'column'} justifyContent={'start'} sx={{ maxHeight: '92vh', minHeight: '92vh', minWidth: '100vw', maxWidth: '100vw' }}>
              {/* Top Navigator */}
              <Grid item container flexDirection={'row'} alignContent={'start'} justifyContent={'start'} sx={{ borderRadius: '1px', minHeight: '6vh', maxHeight: '6vh', minWidth: '16vw', borderBottom: '2px solid #e0e0e0' }}>
                {step(1, 'Process Discovery')}
                {step(2, 'Automation Strategy')}
                {step(3, 'Transformed Workflow')}
              </Grid>
              {/* Main Content Area */}
              <Grid item container flexDirection={'column'} alignItems={'center'} justifyContent={'center'} maxWidth={'100vw'} minWidth={'100vw'} sx={{ borderRadius: '5px', maxHeight: '85vh', minHeight: '85vh' }}>
                {/* Content based on selected step */}
                <LeftBar setLoader={setLoadLoader} />
                <Grid item container flexDirection={'column'} p={0} sx={{ marginLeft: '0.7vw', minHeight: '85vh', maxHeight: '85vh', overflowY: 'auto', scrollbarWidth: 'none', borderRadius: '5px' }}>
                  {/* Create Config */}
                  {firstTabData && show <= 2 && <RenderDocument value={show} />}

                  {/* Optimize Config */}
                  {firstTabData && show == 3 && <ProcessIntelHome />}
                  {!loadLoader && !firstTabData &&
                    (
                      /* UI to show when data is null/missing */
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: '90vh',
                          maxWidth: '80vw',
                          borderRadius: '5px',
                          gap: 2,
                          textAlign: 'center',
                          backgroundColor: '#f9f9f9'
                          // padding: '2rem'
                        }}
                      >
                        <Paper
                          elevation={2}
                          sx={{
                            background: '#EEF4FF',
                            borderRadius: '12px',
                            padding: '3rem 2rem',
                            maxWidth: '500px',
                            border: '1px solid #e0e0e0'
                          }}
                        >
                          <Box sx={{ mb: 2, fontSize: '2.5rem' }}>📄</Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: '#333',
                              mb: 1
                            }}
                          >
                            Ready to Analyze Your Process?
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#666'
                            }}
                          >
                            Upload and process your files to generate analysis reports.
                          </Typography>
                        </Paper>
                      </Box>
                    )
                  }

                  {loadLoader && <Loader />}

                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default Home;
