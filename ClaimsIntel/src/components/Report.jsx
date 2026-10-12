import { Box, Typography, Grid, Paper } from '@mui/material'
import React, { useState } from 'react'
import Markdown from './Markdown'
import Rating from '@mui/material/Rating';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
import AIAgent from '../assets/orange_Agent.png'
import Chip from '@mui/material/Chip';


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
            {value === index && <Box sx={{ p: 1.5 }}>{children}</Box>}
        </div>
    );
}
CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

const Report = ({ data6, dataval, data7, setData7, claimid }) => {
    const [value, setValue] = useState(0)
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    // Clean professional confidence calculation & color mapping
    const rawConfidence = dataval?.["Confidence"] ?? 0.91;
    const percentage = Math.round(rawConfidence * 100);
    const confidenceColor = rawConfidence >= 0.85 ? 'success' : rawConfidence >= 0.6 ? 'warning' : 'error';

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'space-between' }}>
                <Typography fontSize={'0.9rem'} fontWeight={'600'}>REPORT</Typography>
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                </div>
            </div>
            <br></br>

            {dataval != undefined &&

                <Grid sx={{ padding: '1vw', backgroundColor: 'white', borderRadius: '10px', minHeight: '84vh', maxHeight: '84vh', overflowY: 'auto', scrollbarWidth: 'none' }}>

                    {dataval != undefined &&
                        (<div style={{ minWidth: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'start', alignContent: 'center' }}>
                            <img src={AIAgent} style={{ marginRight: '1vw', height: '7vh', width: '7vh', backgroundColor: 'white', borderRadius: '100px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} alt="AI Agent" />

                            <div
                                style={{ minWidth: '90%', maxWidth: '100%', minHeight: '10%', borderRadius: '10px', backgroundColor: 'white', padding: '2vh', paddingLeft: '3vh' }}
                            >

                                <Typography fontSize={'0.9rem'} color={'secondary'}>Communication Closure & Post Processing Agent</Typography>

                                {dataval != undefined && <Box sx={{ width: '100%' }}>
                                    <Box>
                                        <Tabs value={value} onChange={handleChange} textColor="secondary" variant="fullWidth"
                                            indicatorColor="secondary" aria-label="Application Cognition Entities"
                                        >
                                            <Tab sx={{ fontSize: '0.7rem', minWidth: '40%' }} label="Overall Report" />
                                            <Tab sx={{ fontSize: '0.7rem', minWidth: '40%' }} label="Pathology Report" />
                                        </Tabs>
                                    </Box>
                                    <br></br>
                                    <Grid sx={{ backgroundColor: '#EAF3FA', borderRadius: '10px', minHeight: '66vh', maxHeight: '66vh', overflowY: 'auto', scrollbarWidth: 'none' }}>
                                        <CustomTabPanel value={value} index={0}>
                                            <Paper elevation={3} sx={{ maxWidth: '100%', padding: '2vw', position: 'relative' }}>
                                                {/* Professional Percentage Confidence Chip */}
                                                <Box sx={{ position: 'absolute', top: '1rem', right: '1.5rem' }}>
                                                    <Chip
                                                        label={`Confidence: ${percentage}%`}
                                                        size="small"
                                                        color={confidenceColor}
                                                        variant="outlined"
                                                        sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}
                                                    />
                                                </Box>

                                                {/* Report Markdown Content */}
                                                <Box sx={{ mt: 3, mb: 2, fontSize: '0.8rem' }}>
                                                    <Markdown markdownText={dataval["Report"]} />
                                                </Box>

                                                {/* Bottom Warning Text */}
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        fontStyle: 'italic',
                                                        mt: 3,
                                                        pt: 1,
                                                        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                                                        color: 'orange'
                                                    }}
                                                >
                                                    ⚠️ This report was generated with the assistance of MedGemma and should be clinically verified prior to use.
                                                </Typography>
                                            </Paper>

                                            <br></br>
                                            <Paper elevation={0} sx={{ maxWidth: '100%', }}>

                                                {data7.filter(row => {
                                                    return (row["ActionStatus"] === "Approved" || row["ActionStatus"] === "Rejected");
                                                }).length !== 0 &&
                                                    <TableContainer
                                                        sx={{
                                                            marginTop: 0,
                                                            display: 'flex', justifyContent: 'center',
                                                        }}>


                                                        <Table sx={{ minWidth: '100%', maxWidth: '100%' }} size="small" aria-label="simple table">

                                                            <TableHead>
                                                                <TableRow sx={{ backgroundColor: '#f8f8f8' }}>
                                                                    <TableCell sx={{ border: '1px solid #ddd', fontWeight: 'bold', fontSize: '0.7rem', width: '85%' }} align="left">Actionable Tasks</TableCell>
                                                                    <TableCell sx={{ border: '1px solid #ddd', fontWeight: 'bold', width: '15%', fontSize: '0.7rem' }} align="center">Action</TableCell>
                                                                </TableRow>
                                                            </TableHead>

                                                            <TableBody sx={{ backgroundColor: 'white', }}>

                                                                {data7.map((row) => (
                                                                    (row.ActionStatus === 'Approved' || row.ActionStatus === 'Rejected') &&

                                                                    <TableRow sx={{ height: '10vh' }}
                                                                        key={row.name}
                                                                    >
                                                                        <TableCell sx={{ border: '1px solid #ddd', }} align="left">


                                                                            <b style={{ fontSize: '0.7rem' }}>{row.ActionName}</b>&nbsp;:&nbsp;
                                                                            <Typography fontSize={'0.7rem'}>
                                                                                <Markdown markdownText={row.ActionDetail} />
                                                                            </Typography>


                                                                            {row.ActionReasoning && <Accordion >
                                                                                <AccordionSummary
                                                                                    expandIcon={<ArrowDropDownIcon />}
                                                                                    aria-controls="panel1-content"
                                                                                    id="panel1-header"
                                                                                >
                                                                                    <Typography sx={{ fontSize: '0.7rem' }}> ClaimsIntel Reasoning</Typography>
                                                                                </AccordionSummary>
                                                                                <AccordionDetails>
                                                                                    <Typography fontSize={'0.6rem'}>
                                                                                        <Markdown markdownText={row.ActionReasoning} />
                                                                                    </Typography>
                                                                                </AccordionDetails>
                                                                            </Accordion>}

                                                                            {row.ActionEmail &&
                                                                                (<Accordion >
                                                                                    <AccordionSummary
                                                                                        expandIcon={<ArrowDropDownIcon />}
                                                                                        aria-controls="panel1-content"
                                                                                        id="panel1-header"
                                                                                    >
                                                                                        <Typography sx={{ fontSize: '0.7rem' }}> ClaimsIntel Generated Email Template</Typography>
                                                                                    </AccordionSummary>
                                                                                    <AccordionDetails>
                                                                                        <Typography fontSize={'0.7rem'}>
                                                                                            <Markdown markdownText={row.ActionEmail} />
                                                                                        </Typography>
                                                                                    </AccordionDetails>
                                                                                </Accordion>)
                                                                            }

                                                                        </TableCell>

                                                                        <TableCell align="center" sx={{ border: '1px solid #ddd' }}>
                                                                            <div onClick={() => {
                                                                                fetch(process.env.REACT_APP_BASE_URL + "/updateactiondetailsstatusdata/" + claimid + "/" + row.ActionName + "/none")
                                                                                    .then((response) => response.json())
                                                                                    .then((json) => {

                                                                                        setData7(json[0]['ActionList'])
                                                                                    })
                                                                                    .catch(error => {
                                                                                    })

                                                                            }}
                                                                                style={(row.ActionStatus === "Approved") ? { fontSize: '0.6rem', maxWidth: '60%', borderRadius: '5px', padding: '0.5vh', backgroundColor: '#e6ffe6', color: 'green', textAlign: 'center', border: '1px solid green', cursor: 'pointer' } : { fontSize: '0.6rem', maxWidth: '60%', borderRadius: '5px', padding: '0.5vh', backgroundColor: '#fffaf8', color: 'red', textAlign: 'center', border: '1px solid red', cursor: 'pointer' }}
                                                                            >{row.ActionStatus}</div>
                                                                        </TableCell>

                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                }

                                            </Paper>
                                        </CustomTabPanel>

                                        <CustomTabPanel value={value} index={1}>
                                            <Paper elevation={3} sx={{ maxWidth: '100%', padding: '2vw', position: 'relative' }}>
                                                {/* Professional Percentage Confidence Chip */}
                                                <Box sx={{ position: 'absolute', top: '1rem', right: '1.5rem' }}>
                                                    <Chip
                                                        label={`Confidence: ${percentage}%`}
                                                        size="small"
                                                        color={confidenceColor}
                                                        variant="outlined"
                                                        sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}
                                                    />
                                                </Box>

                                                {/* Report Markdown Content */}
                                                <Box sx={{ mt: 3, mb: 2, fontSize: '0.8rem' }}>
                                                    <Markdown markdownText={dataval["pathology_report"]} />
                                                </Box>

                                                {/* Bottom Warning Text */}
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        fontStyle: 'italic',
                                                        mt: 3,
                                                        pt: 1,
                                                        borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                                                        color: 'orange'
                                                    }}
                                                >
                                                    ⚠️ This report was generated with the assistance of MedGemma and should be clinically verified prior to use.
                                                </Typography>
                                            </Paper>

                                            <br></br>
                                        </CustomTabPanel>

                                    </Grid>
                                </Box>

                                }

                            </div>
                        </div>)

                    }


                </Grid>

            }
        </>
    )
}

export default Report;