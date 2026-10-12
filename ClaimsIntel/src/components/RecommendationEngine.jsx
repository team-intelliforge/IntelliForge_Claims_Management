import { Box, Button, ButtonBase, Grid, IconButton, Paper, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Markdown from './Markdown'
import Rating from '@mui/material/Rating';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import CancelIcon from '@mui/icons-material/HighlightOff';
import AIAgent from '../assets/orange_Agent.png'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AddSimpleIcon from '@mui/icons-material/Add';
import AddIcon from '@mui/icons-material/ControlPoint';
import MinusIcon from '@mui/icons-material/RemoveCircleOutline';




const RecommendationEngine = ({ claimid,dataval, data7, setActionName, setEditOrAdd, setEditAddData, setOpenEditAddDialog, setData7 }) => {
    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'space-between' }}>
                {/* <h2 style={{ fontWeight: '500', color: '#fd5f07' }}>Application Cognition Entities</h2> */}
                <Typography fontSize={'0.9rem'} fontWeight={'600'} >NEXT STEPS</Typography>
                
            </div>
            <br></br>

            {dataval != undefined &&

                <Grid sx={{ padding: '1vw', backgroundColor: 'white', borderRadius: '10px', minHeight: '84vh', maxHeight: '84vh', overflowY: 'auto', scrollbarWidth: 'none' }}>

                    {dataval != undefined &&
                        (<div style={{ minWidth: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'start', alignContent: 'center', marginBottom: '3vh' }}>
                            <img src={AIAgent} style={{ marginRight: '1vw', height: '7vh', wigth: '7vh', backgroundColor: 'white', borderRadius: '100px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} ></img>

                            <div
                                style={{ minWidth: '90%', maxWidth: '100%', minHeight: '10%', borderRadius: '10px', backgroundColor: 'white', padding: '2vh', paddingLeft: '3vh', paddingRight: '4vh' }}
                            >

                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
                                    <Typography fontSize={'0.9rem'} color={'secondary'}>Claim Adjudicator Agent</Typography>

                                </div>
                                <Paper elevation={2} sx={{ maxWidth: '100%', padding: '0.5vw', paddingLeft: '2vw', marginTop: '2vh' }}>
                                    <Typography fontSize={'0.75rem'}>
                                        <Markdown markdownText={dataval["threshold"]} />
                                    </Typography>
                                </Paper>

                            </div>

                            {/* <div style={{maxWidth:'90%',maxHeight:'90%',borderRadius:'20px',backgroundColor:'#FFD580',marginLeft:'5px',color:'white',padding:'2vh'}}> Content</div> */}
                        </div>)

                    }
                    {dataval != undefined &&
                        (<div style={{ minWidth: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'start', alignContent: 'center' }}>
                            <img src={AIAgent} style={{ marginRight: '1vw', height: '7vh', wigth: '7vh', backgroundColor: 'white', borderRadius: '100px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} ></img>

                            <div
                                style={{ minWidth: '90%', maxWidth: '100%', minHeight: '10%', borderRadius: '10px', backgroundColor: 'white', padding: '2vh', paddingLeft: '3vh' }}
                            >

                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} >
                                    <Typography fontSize={'0.9rem'} color={'secondary'}>Decision & Adjudication Agent</Typography>

                                    <Button color='secondary' size='small' variant='contained'
                                        onClick={() => {
                                            setEditOrAdd("Add");
                                            setEditAddData({ "ActionName": "", "ActionDetail": "", "ActionReasoning": "" })
                                            setOpenEditAddDialog(true);
                                        }}
                                        sx={{ paddding: '0px', textTransform: 'none', fontSize: '0.7rem', marginRight: '1vw' }}
                                    >
                                        Add Task<AddSimpleIcon fontSize='small' />
                                    </Button>

                                </div>
                                <br></br>
                                <Paper elevation={0} sx={{ maxWidth: '100%', padding: '0.5vw' }}>

                                    {data7.filter(row => {
                                        return (row["ActionStatus"] === "Approved" || row["ActionStatus"] === "Rejected");
                                    }).length !== data7.length &&
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
                                                        (row.ActionStatus !== 'Approved' && row.ActionStatus !== 'Rejected') &&

                                                        <TableRow sx={{ height: '10vh' }}
                                                            key={row.name}
                                                        >
                                                            <TableCell sx={{ border: '1px solid #ddd', }} align="left">


                                                                <b style={{ fontSize: '0.7rem' }}>{row.ActionName}</b>&nbsp;:&nbsp;
                                                                <Typography fontSize={'0.7rem'}>
                                                                    <Markdown markdownText={row.ActionDetail} />
                                                                </Typography>


                                                                {row.ActionReasoning &&
                                                                    <Accordion >
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

                                                            <TableCell align="center" sx={{ border: '1px solid #ddd', verticalAlign: 'top' }}>
                                                                <div style={{ marginTop: '4vh', width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'start' }}>
                                                                    <IconButton
                                                                        sx={{ p: 0 }}
                                                                        variant="outlined"
                                                                        color="success"
                                                                        onClick={() => {
                                                                            fetch(process.env.REACT_APP_BASE_URL + "/updateactiondetailsstatusdata/" + claimid + "/" + row.ActionName + "/Approved")
                                                                                .then((response) => response.json())
                                                                                .then((json) => {

                                                                                    setData7(json[0]['ActionList'])
                                                                                })
                                                                                .catch(error => {
                                                                                    //alert("error in call 3");
                                                                                })

                                                                            
                                                                           
                                                                        }}
                                                                    >
                                                                        <CheckCircleIcon variant="outlined" fontSize='small' />
                                                                    </IconButton>

                                                                    <IconButton
                                                                        sx={{ p: 0 }}
                                                                        variant="outlined"
                                                                        color="error"
                                                                        onClick={() => {
                                                                            fetch(process.env.REACT_APP_BASE_URL + "/updateactiondetailsstatusdata/" + claimid + "/" + row.ActionName + "/Rejected")
                                                                                .then((response) => response.json())
                                                                                .then((json) => {

                                                                                    setData7(json[0]['ActionList'])
                                                                                })
                                                                                .catch(error => {
                                                                                    //alert("error in call 3");
                                                                                })

                                                                        }}
                                                                    >
                                                                        <CancelIcon fontSize='small' />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        sx={{ p: 0 }}
                                                                        variant="outlined"
                                                                        onClick={() => {
                                                                            // alert(row.ActionName)
                                                                            setActionName(row.ActionName)
                                                                            setEditOrAdd("Edit")
                                                                            setEditAddData(row);
                                                                            setOpenEditAddDialog(true);

                                                                        }}
                                                                    >

                                                                        <EditOutlinedIcon fontSize='small' />
                                                                    </IconButton>
                                                                </div>
                                                            </TableCell>

                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    }

                                </Paper>


                            </div>

                        </div>)

                    }


                </Grid>

            }
        </>
    )
}

export default RecommendationEngine




