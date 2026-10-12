import { Box, Button, ButtonBase, Grid, IconButton, Paper, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Markdown from './Markdown'
import Rating from '@mui/material/Rating';
import AIAgent from '../assets/orange_Agent.png';
import AddIcon from '@mui/icons-material/ControlPoint';
import MinusIcon from '@mui/icons-material/RemoveCircleOutline';


const DecisionEngine = ({ dataval}) => {
    return (
        <>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', justifyContent: 'space-between' }}>
            <Typography fontSize={'0.9rem'} fontWeight={'600'}>RESOLUTION</Typography>
            <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                
            </div>
        </div>
        <br></br>

        {dataval != undefined &&

            <Grid sx={{ padding:'1vw', backgroundColor: 'white', borderRadius: '10px', minHeight: '84vh', maxHeight: '84vh', overflowY: 'auto', scrollbarWidth: 'none'}}>

                {dataval != undefined &&
                    (<div style={{ minWidth: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'start', alignContent: 'center' }}>
                        <img src={AIAgent} style={{ marginRight: '1vw', height: '7vh', wigth: '7vh', backgroundColor: 'white', borderRadius: '100px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }} ></img>

                        <div
                            style={{ minWidth: '90%', maxWidth: '100%', minHeight: '10%', borderRadius: '10px', backgroundColor: 'white', padding: '2vh', paddingLeft: '3vh' }}
                        >

                            <Typography fontSize={'0.9rem'} color={'secondary'}>Claim Resolution Agent</Typography>
                            <br></br>
                            <Paper elevation={3} sx={{ maxWidth: '100%', padding: '0.5vw',paddingLeft:'2vw' }}>
                                <Typography fontSize={'0.75rem'}>
                                    <Markdown markdownText={dataval["corrective_action"]} />
                                </Typography>
                            </Paper>


                        </div>

                        {/* <div style={{maxWidth:'90%',maxHeight:'90%',borderRadius:'20px',backgroundColor:'#FFD580',marginLeft:'5px',color:'white',padding:'2vh'}}> Content</div> */}
                    </div>)

                }


            </Grid>

        }
    </>
    )
}

export default DecisionEngine