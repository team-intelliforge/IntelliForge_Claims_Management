import { Box, Button, ButtonBase, Grid, IconButton, Paper, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Rating from '@mui/material/Rating';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


const Eligibility = ()=> {
    return(
        <>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <h2 style={{ fontWeight: '500', color: '#fd5f07' }}>Eligibility</h2>
                                        <div style={{ fontSize: '16px', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Rating name="customized-10" defaultValue={1} max={1} sx={{ justifySelf: 'center' }} />
                                            Confidence Score : <Box color={'red'} ml={1}>{(parseFloat(dataval["ConfidenceScore"]["Eligibility"]) * 100).toFixed(2)}</Box>
                                        </div>
                                    </div>

                                    {/* <Markdown markdownText={data1} /> */}
                                    {/* <Box */}
                                    <div
                                        style={{
                                            border: '1px',
                                            padding: '16px',               // Padding inside the box
                                            borderRadius: '8px',           // Rounded corners
                                            boxShadow: '0px 0.2px 3px 0.2px #fd5f07',
                                            width: '97%',
                                            height: '100px'           // Center the box
                                        }}
                                    >
                                        <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly' }}>
                                            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <div>Case Id : <b>{caseid}</b></div>
                                                <div>Status : <CheckCircleIcon style={{ color: 'green', fontSize: 15 }} />&nbsp;<b>Active</b></div>
                                            </div>
                                            <hr style={{ width: '100%', border: '1px solid lightgrey' }}></hr>
                                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'end' }}>
                                                <div>Start Date : <b>24/02/2024</b></div>
                                                <div>End Date : <b>23/02/2025</b></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <hr style={{ width: '98%' }}></hr> */}
        </>
    )
}

export default Eligibility