import { Box, Button, ButtonBase, Chip, Grid, IconButton, Paper, Tooltip, Typography,Fade } from '@mui/material';
import React, { useState } from 'react';
import Markdown from './Markdown';
import Rating from '@mui/material/Rating';
import AIAgent from '../assets/orange_Agent.png';
import AddIcon from '@mui/icons-material/ControlPoint';
import MinusIcon from '@mui/icons-material/RemoveCircleOutline';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MapRouteView from './Map';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const MemberCaseAnalysis = ({ addnData, dataval, claimid }) => {
    const [anchorEl, setAnchorEl] = useState(false);
    const [value, setValue] = useState(0)
    const [checked, setChecked] = useState(true)
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'space-between' }}>
                <Typography fontSize={'0.9rem'} fontWeight={'600'} >CLAIMS ANALYSIS SUMMARY</Typography>
            </div>
            
            <br></br>

            {dataval != undefined &&
            <>
                {dataval.GoogleMapsData && <Box sx={{ backgroundColor: 'white' }}>
                    <Tabs value={value} onChange={handleChange} textColor="secondary" variant="fullWidth"
                        indicatorColor="secondary" aria-label="Application Cognition Entities"
                    >
                        <Tab sx={{ fontSize: '0.7rem', minWidth: '50%' }} label="Analysis" />
                        <Tab sx={{ fontSize: '0.7rem', minWidth: '50%' }} label="Google Maps" />
                        
                    </Tabs>
                </Box>}


                <Fade
                    in={checked}
                    style={{ transformOrigin: '0 0 0' }}
                    {...(checked ? { timeout: 1000 } : {})}
                    key={value}
                >
                    <Grid sx={{ backgroundColor: 'white', borderRadius: '10px', minHeight: '76vh', maxHeight: '76vh', overflowY: 'auto', scrollbarWidth: 'none' ,marginTop:'0.5vh'}}>
                        

                        <CustomTabPanel value={value} index={0}>
                          {dataval != undefined &&
                        (<div style={{ minWidth: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'start', alignContent: 'center' }}>
                            <img src={AIAgent} style={{ marginRight: '1vw', height: '7vh', width: '7vh', backgroundColor: 'white', borderRadius: '100px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} alt="AI Agent" />

                            <div
                                style={{ minWidth: '90%', maxWidth: '100%', minHeight: '10%', borderRadius: '10px', backgroundColor: 'white', padding: '2vh', paddingLeft: '3vh' }}
                            >
                                {/* Header Row with Agent Name & Right-Aligned Deep Research Tooltip/Panel */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', minHeight: '32px' }}>
                                    <Typography fontSize={'0.9rem'} color={'secondary'}>Classification & Assessment Agent</Typography>

                                    {/* Deep Research Trigger & Overlay Panel */}
                                    <div 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setAnchorEl(!anchorEl);
                                        }}
                                        style={{ position: 'relative', display: 'inline-block' }}
                                    >
                                        <Chip
                                            label="Deep Research"
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                            sx={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
                                        />

                                        {anchorEl && (
                                            <Paper
                                                elevation={6}
                                                onClick={(e) => e.stopPropagation()}
                                                sx={{
                                                    position: 'absolute',
                                                    right: 0,
                                                    top: '100%',
                                                    mt: 1,
                                                    width: '360px',
                                                    maxHeight: '380px',
                                                    scrollbarWidth: 'thin',
                                                    overflowY: 'auto',
                                                    padding: '16px',
                                                    zIndex: 1300,
                                                    backgroundColor: '#fff',
                                                    borderRadius: '8px',
                                                    boxShadow: '0px 8px 24px rgba(0,0,0,0.15)'
                                                }}
                                            >
                                                {/* Header with Title and Info Tooltip */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                    <Typography fontSize={'0.85rem'} fontWeight={'600'}>
                                                        Deep Research Audit Log
                                                    </Typography>
                                                    
                                                    {/* Restored MUI Tooltip with clean styling */}
                                                    {/* <Tooltip 
                                                        title="Powered by Gemini Deep Research (https://gemini.google/overview/deep-research/)" 
                                                        arrow 
                                                        placement="top"
                                                        PopperProps={{
                                                            sx: {
                                                                '& .MuiTooltip-tooltip': {
                                                                    fontSize: '0.7rem',
                                                                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        <IconButton size="small" sx={{ padding: '2px' }}>
                                                            <InfoOutlined fontSize="small" color="action" />
                                                        </IconButton>
                                                    </Tooltip> */}
                                                </Box>
                                                
                                                <Typography fontSize={'0.7rem'} >
                                                    Powered by Gemini Deep Research 
                                                </Typography>
                                                <Typography fontSize={'0.5rem'} color="textSecondary" sx={{ mb: 1 }}>
                                                    (https://gemini.google/overview/deep-research/)
                                                </Typography>
                                                <Typography fontSize={'0.7rem'} color="textSecondary" sx={{ mb: 2 }}>
                                                    Searched sources and evaluation reasoning:
                                                </Typography>

                                                {dataval["deep-research"].map((item, index) => (
                                                    <Box key={index} sx={{ mb: 1.5, p: 1, borderRadius: '6px', backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
                                                        <Typography fontSize={'0.75rem'} fontWeight={'600'} sx={{ wordBreak: 'break-all', color: '#1976d2' }}>
                                                            {item.url}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, mb: 0.5 }}>
                                                            <Chip
                                                                label={item.status}
                                                                size="small"
                                                                color={item.status === 'Selected' ? 'success' : 'error'}
                                                                sx={{ height: '20px', fontSize: '0.65rem' }}
                                                            />
                                                        </Box>
                                                        <Typography fontSize={'0.7rem'} color="textSecondary">
                                                            <strong>Reasoning:</strong> {item.reasoning}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Paper>
                                        )}
                                    </div>
                                </div>

                                <br></br>
                                <Paper elevation={3} sx={{ maxWidth: '100%', padding: '0.5vw', paddingLeft: '2vw' }}>
                                    <Typography fontSize={'0.7rem'}>
                                        <Markdown markdownText={dataval["suspension_reason"]} />
                                    </Typography>
                                </Paper>

                            </div>
                            
                        </div>)

                    }
                        </CustomTabPanel>

                        <CustomTabPanel value={value} index={1}>
                            <MapRouteView location_list={dataval.GoogleMapsData}/>
                        </CustomTabPanel>


                    </Grid>
                </Fade>
            </>
            }
        </>
    )
}

export default MemberCaseAnalysis;