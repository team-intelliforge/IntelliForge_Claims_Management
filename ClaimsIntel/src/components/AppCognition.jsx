import { Box, Button, ButtonBase, Fade, Grid, Grow, IconButton, Paper, Typography, Tooltip, Chip } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Markdown from './Markdown'
import Rating from '@mui/material/Rating';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import AIAgent from '../assets/orange_Agent.png'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ShieldWarningIcon from '@mui/icons-material/ReportProblem';
import doc1 from '../assets/result_001.pdf'
import doc2 from '../assets/result_002.pdf'
import doc3 from '../assets/result_003.pdf'
import GraphVisualization from './GraphVisualization';

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
CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};


const ApplicationCognition = ({ dataval, claimid }) => {
    const [anchorEl, setAnchorEl] = useState(false);
    const handleMouseEnter = () => setAnchorEl(true);
    const handleMouseLeave = () => setAnchorEl(false);
    const [value, setValue] = useState(0)
    const [checked, setChecked] = useState(true)
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const getPDF = () => {
        if (claimid === "CLM001") {
            return doc1
        }
        else if (claimid === "CLM002") {
            return doc2
        }
        else {
            return doc3
        }
    }



    // Custom rich tooltip layout with proper Popper configuration to prevent clipping/affecting layout
    const biasGuardTooltipContent = (
        <Box sx={{ p: 1, maxWidth: 380 }}>
            {dataval?.cognitiondata?.[0]?.applicationcognition?.["bias-guard"] ? (
                <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                        <ShieldWarningIcon color="warning" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            BiasGuard Risks Found ({dataval["cognitiondata"][0]["applicationcognition"]["bias-guard"]?.totalWarnings})
                        </Typography>
                    </Box>
                    <Box component="ul" sx={{ m: 0, pl: 2, typography: 'caption', maxHeight: '50vh', overflowY: 'scroll', scrollbarWidth: 'thin' }}>
                        {dataval["cognitiondata"][0]["applicationcognition"]["bias-guard"]?.warnings?.map((item, index) => (
                            <Box component="li" key={index} sx={{ mb: 0.5 }}>
                                <strong>{item.type}:</strong> {item.details}
                            </Box>
                        ))}
                    </Box>
                </>
            ) : (
                <Typography variant="caption">No bias guard data available.</Typography>
            )}
        </Box>
    );

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'space-between' }}>
                <Typography fontSize={'0.9rem'} fontWeight={'600'} >APPLICATION COGNITION ENTITIES</Typography>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                </div>
            </div>

            {dataval != undefined && dataval["cognitiondata"] != undefined && <Box sx={{ width: '100%', marginTop: '2vh' }}>
                <Box sx={{ backgroundColor: 'white' }}>
                    <Tabs value={value} onChange={handleChange} textColor="secondary" variant="fullWidth"
                        indicatorColor="secondary" aria-label="Application Cognition Entities"
                    >
                        <Tab sx={{ fontSize: '0.7rem', minWidth: '20%' }} label="Claims Information" />
                        <Tab sx={{ fontSize: '0.7rem', minWidth: '10%' }} label="Ontology" />
                        <Tab sx={{ fontSize: '0.7rem', minWidth: '10%' }} label="Eligibility" />
                        <Tab sx={{ fontSize: '0.7rem', minWidth: '20%' }} label="Member Information" />
                        <Tab sx={{ fontSize: '0.7rem', minWidth: '10%' }} label="Allergies" />
                        <Tab sx={{ fontSize: '0.7rem', minWidth: '20%' }} label="Physician Information" />

                    </Tabs>
                </Box>


                <Fade
                    in={checked}
                    style={{ transformOrigin: '0 0 0' }}
                    {...(checked ? { timeout: 1000 } : {})}
                    key={value}
                >
                    <Grid sx={{ backgroundColor: 'white', borderRadius: '10px', minHeight: '76vh', maxHeight: '76vh', overflowY: 'auto', scrollbarWidth: 'none', marginTop: '1vh' }}>
                        <CustomTabPanel value={value} index={0}>
                            {dataval != undefined &&
                                (<div style={{ minWidth: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'start', alignContent: 'center' }}>
                                    <img src={AIAgent} style={{ marginRight: '1vw', height: '7vh', wigth: '7vh', backgroundColor: 'white', borderRadius: '100px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} ></img>

                                    <div
                                        style={{ minWidth: '90%', maxWidth: '100%', minHeight: '10%', borderRadius: '10px', backgroundColor: 'white', padding: '2vh', paddingLeft: '3vh' }}
                                    >

                                        <Typography fontSize={'0.9rem'} color={'secondary'}>Claim Intake & Registration Agent</Typography>
                                        <br></br>
                                        <Paper elevation={3} sx={{ maxWidth: '100%', padding: '0.5vw' }}>
                                            <Typography fontSize={'0.7rem'}>
                                                <Markdown markdownText={"* **Claims ID :** " + dataval["Claimid"] + "\n\n * **Claims Data :** " + dataval["Inputdata"]} />
                                            </Typography>
                                        </Paper>

                                        <Accordion sx={{ marginTop: '1vh' }}>
                                            <AccordionSummary
                                                expandIcon={<ArrowDropDownIcon />}
                                                aria-controls="panel1-content"
                                                id="panel1-header"
                                                sx={{
                                                    '& .MuiAccordionSummary-content': {
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        width: '100%',
                                                        mr: 1
                                                    }
                                                }}
                                            >
                                                <Typography sx={{ fontSize: '0.8rem' }}>Claims Document</Typography>

                                                {/* Custom Hover Container matching your working component */}
                                                <Box
                                                    component="div"
                                                    onMouseEnter={handleMouseEnter} // Use your enter handler state here
                                                    onMouseLeave={handleMouseLeave} // Use your leave handler state here
                                                    onClick={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    onMouseUp={(e) => e.stopPropagation()}
                                                    sx={{ display: 'inline-block', position: 'relative', ml: 'auto', mr: 2 }}
                                                >
                                                    <Chip
                                                        size="small"
                                                        color={dataval["cognitiondata"][0]["applicationcognition"]["bias-guard"]?.totalWarnings > 0 ? "warning" : "success"}
                                                        label={`BiasGuard: ${dataval["cognitiondata"][0]["applicationcognition"]["bias-guard"]?.totalWarnings} risks`}
                                                        sx={{ fontSize: '0.7rem', height: '20px', cursor: 'pointer' }}
                                                    />

                                                    {anchorEl && (
                                                        <Paper
                                                            elevation={4}
                                                            sx={{
                                                                position: 'absolute',
                                                                right: 0,
                                                                bottom: '100%',
                                                                mb: 1,
                                                                bgcolor: 'background.paper',
                                                                color: 'text.primary',
                                                                boxShadow: 4,
                                                                p: 1.5,
                                                                border: '1px solid',
                                                                borderColor: 'divider',
                                                                zIndex: 9999,
                                                                borderRadius: '4px',
                                                                minWidth: '400px',
                                                                maxWidth: '400px',
                                                            }}
                                                        >
                                                            {biasGuardTooltipContent}
                                                        </Paper>
                                                    )}
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                                <iframe src={getPDF()} type="application/pdf" width="95%" height="1000" title="Claim PDF">
                                                    <p>Cannot display pdf</p>
                                                </iframe>
                                            </AccordionDetails>
                                        </Accordion>

                                    </div>
                                </div>)
                            }
                        </CustomTabPanel>

                        <CustomTabPanel value={value} index={2}>
                            {dataval["cognitiondata"] != undefined &&
                                (<div style={{ minWidth: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'start', alignContent: 'center' }}>
                                    <img src={AIAgent} style={{ marginRight: '1vw', height: '7vh', wigth: '7vh', backgroundColor: 'white', borderRadius: '100px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} ></img>

                                    <div
                                        style={{ minWidth: '90%', maxWidth: '100%', minHeight: '10%', borderRadius: '10px', backgroundColor: 'white', padding: '2vh', paddingLeft: '3vh' }}
                                    >

                                        <Typography fontSize={'0.9rem'} color={'secondary'}>Claim Intake & Registration Agent</Typography>
                                        <br></br>
                                        <Paper elevation={3} sx={{ maxWidth: '100%', padding: '0.5vw' }}>
                                            <Typography fontSize={'0.7rem'}>
                                                <div style={{ height: '20vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                        <div>Plan ID : <b>{dataval["plan_id"]}</b></div>
                                                        <div>Status : <CheckCircleIcon style={{ color: 'green', fontSize: 15 }} />&nbsp;<b>Active</b></div>
                                                    </div>
                                                    <hr style={{ width: '100%', border: '1px solid lightgrey' }}></hr>
                                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'start' }}>
                                                        <div>Start Date : <b>24/02/2024</b></div>
                                                        <div>End Date : <b>23/02/2025</b></div>
                                                        <br></br>
                                                        <div><b>Services covered by policy : </b>{dataval["Services_covered_by_policy"]}</div>
                                                    </div>
                                                </div>
                                            </Typography>
                                        </Paper>


                                    </div>
                                </div>)
                            }
                        </CustomTabPanel>

                        <CustomTabPanel value={value} index={5}>
                            {dataval["cognitiondata"] != undefined &&
                                (<div style={{ minWidth: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'start', alignContent: 'center' }}>
                                    <img src={AIAgent} style={{ marginRight: '1vw', height: '7vh', wigth: '7vh', backgroundColor: 'white', borderRadius: '100px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} ></img>

                                    <div
                                        style={{ minWidth: '90%', maxWidth: '100%', minHeight: '10%', borderRadius: '10px', backgroundColor: 'white', padding: '2vh', paddingLeft: '3vh' }}
                                    >

                                        <Typography fontSize={'0.9rem'} color={'secondary'}>Claim Intake & Registration Agent</Typography>
                                        <br></br>
                                        <Paper elevation={3} sx={{ maxWidth: '100%', padding: '0.5vw' }}>
                                            <Typography fontSize={'0.7rem'}>
                                                <Markdown markdownText={dataval["cognitiondata"][0]["applicationcognition"]["Physician Information"]} />
                                            </Typography>
                                        </Paper>


                                    </div>
                                </div>)
                            }
                        </CustomTabPanel>

                        <CustomTabPanel value={value} index={4}>
                            {dataval["cognitiondata"] != undefined &&
                                (<div style={{ minWidth: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'start', alignContent: 'center' }}>
                                    <img src={AIAgent} style={{ marginRight: '1vw', height: '7vh', wigth: '7vh', backgroundColor: 'white', borderRadius: '100px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} ></img>

                                    <div
                                        style={{ minWidth: '90%', maxWidth: '100%', minHeight: '10%', borderRadius: '10px', backgroundColor: 'white', padding: '2vh', paddingLeft: '3vh' }}
                                    >

                                        <Typography fontSize={'0.9rem'} color={'secondary'}>Claim Intake & Registration Agent</Typography>
                                        <br></br>
                                        <Paper elevation={3} sx={{ maxWidth: '100%', padding: '0.5vw' }}>
                                            <Typography fontSize={'0.7rem'}>
                                                <Markdown markdownText={dataval["cognitiondata"][0]["applicationcognition"]["Allergies"]} />
                                            </Typography>
                                        </Paper>


                                    </div>
                                </div>)
                            }
                        </CustomTabPanel>

                        <CustomTabPanel value={value} index={3}>
                            {dataval["cognitiondata"] != undefined &&
                                (<div style={{ minWidth: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'start', alignContent: 'center' }}>
                                    <img src={AIAgent} style={{ marginRight: '1vw', height: '7vh', wigth: '7vh', backgroundColor: 'white', borderRadius: '100px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} ></img>

                                    <div
                                        style={{ minWidth: '90%', maxWidth: '100%', minHeight: '10%', borderRadius: '10px', backgroundColor: 'white', padding: '2vh', paddingLeft: '3vh' }}
                                    >

                                        <Typography fontSize={'0.9rem'} color={'secondary'}>Claim Intake & Registration Agent</Typography>
                                        <br></br>
                                        <Paper elevation={3} sx={{ maxWidth: '100%', padding: '0.5vw' }}>
                                            <Typography fontSize={'0.7rem'}>
                                                <Markdown markdownText={dataval["cognitiondata"][0]["applicationcognition"]["Member Information"]} />
                                            </Typography>
                                        </Paper>


                                    </div>
                                </div>)
                            }
                        </CustomTabPanel>

                        <CustomTabPanel value={value} index={1}>
                            <GraphVisualization rawData={dataval["cognitiondata"][0]["applicationcognition"]["graph-data"]} />
                        </CustomTabPanel>

                    </Grid>
                </Fade>
            </Box>
            }
        </>
    )
}

export default ApplicationCognition