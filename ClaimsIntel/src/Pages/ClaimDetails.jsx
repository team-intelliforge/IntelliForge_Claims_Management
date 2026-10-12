import { Box, Button, Grid, IconButton, Paper, Typography, Toolbar, Zoom, Grow } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Markdown from '../components/Markdown'
import { useLocation, useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import AddIcon from '@mui/icons-material/AddCircle';
import MinusIcon from '@mui/icons-material/RemoveCircle';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Slide from '@mui/material/Slide';

import AppCognition from '../components/AppCognition';
import MemberCaseAnalysis from '../components/MemberCaseAnalysis';
import DecisionEngine from '../components/DecisionEngine';
import RecommendationEngine from '../components/RecommendationEngine';
import Report from '../components/Report';
import Loader from '../components/Loader/Loader';
import Footer from '../components/Footer';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));



const ClaimDetails = () => {
    const location = useLocation();
    const [checked, setChecked] = useState(true)
    const [loadLoader, setLoadLoader] = useState(false);
    const [editLoading, setEditLoading] = useState(false)
    const [openEditAddDialog, setOpenEditAddDialog] = useState(false);
    const [editAddData, setEditAddData] = useState(null);
    const [editOrAdd, setEditOrAdd] = useState("");
    const [actionName, setActionName] = useState("");
    const navigate = useNavigate();
    const { claimid } = useParams();
    const [show, setShow] = useState(1);

    
    const [dataval, setDataval] = useState({});
    const [data7, setData7] = useState([]);

    useEffect(() => {
        if (sessionStorage.getItem("isAuthenticated") !== "true") {
            navigate("/");
        }
    }, [])
    useEffect(() => {

    }, [editLoading])

    const handleEdit = () => {
        setEditLoading(true);

        if (editOrAdd == "Add") {



            fetch(process.env.REACT_APP_BASE_URL + "/addactiondetailsdata/" + claimid, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editAddData),
            })
                .then((response) => response.json())
                .then((json) => {

                    setData7(json[0]['ActionList'])
                    setEditLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setEditLoading(false);
                })
        }
        else if (editOrAdd == "Edit") {

            fetch(process.env.REACT_APP_BASE_URL + "/updateactiondetailsdata/" + claimid + "/" + actionName, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editAddData),
            })
                .then((response) => response.json())
                .then((json) => {

                    setData7(json[0]['ActionList'])
                    setEditLoading(false);
                })
                .catch(error => {
                    console.log(error);
                    setEditLoading(false);
                })
        }
        setOpenEditAddDialog(false);
        setEditAddData(null);
    }

    const step = (num, name) => {

        return (
            <div onClick={() => { setShow(Number(num)) }} style={(show < Number(num)) ?
                { cursor: 'pointer', fontSize: 'small', minWidth: '15.8vw', maxWidth: '15.8vw', minHeight: '7vh', color: 'white', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' } :
                { boxShadow: 'inset 3px 0 1px 0 #147D76', cursor: 'pointer', fontSize: 'small', minWidth: '15.9vw', maxWidth: '15.9vw', minHeight: '7vh', color: '#147D76', backgroundColor: '#EAF3FA', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
            }>
                <div style={{ marginLeft: '1vw' }}>{name}</div>
                {(show >= Number(num)) && <IconButton sx={{ p: 0, marginRight: '1vw', color: "#147D76" }}
                    variant="outlined"
                ><CheckCircleIcon fontSize='small' /></IconButton>}
            </div>
        )
    }




    // API call to generate and get Report data from backend 
    useEffect(() => {
        
            setEditLoading(true)
            fetch(process.env.REACT_APP_BASE_URL + "/getclaimcognitiondata/" + claimid)
                .then((response) => response.json())
                .then((json) => {
                    setDataval(json[0]);
                })
                .catch(error => {
                    //alert("error in call 1");
                    setDataval({})
                    console.log("ERROR IN TABULAR DATA : \n\n" + error);
                })

            fetch(process.env.REACT_APP_BASE_URL + "/getactiondetailsdata/" + claimid)
                .then((response) => response.json())
                .then((json) => {

                    setData7(json[0]['ActionList'])
                    setEditLoading(false)
                })
                .catch(error => {
                    //alert("error in call 3");
                    console.log("ERROR IN ACTION DATA : \n\n" + error);
                    setData7([])
                    setEditLoading(false)
                })

            setEditLoading(false);



    }, [location])


    return (
        <>
            {(loadLoader) ? <Loader /> :
                <Grid>
                    {

                        // Grid-1
                        <Grid container flexDirection={"row"} justifyContent={"start"} alignItems={"start"} sx={{ backgroundColor: '#EAF3FA', minHeight: '100vh' }}>
                            <Grid
                                item
                                container flexDirection={'column'} alignContent={'start'} justifyContent={'start'}
                                sx={{
                                    minWidth: "16vw",
                                    maxWidth: "16vh", // width of the sidebar
                                    minHeight: "100vh",
                                    maxHeight: "100vh", // full viewport height
                                    backgroundColor: '#10263D',
                                    color: 'white'
                                }}
                            >
                                <Toolbar>
                                    
                                    <Typography
                                        variant="h6"
                                        noWrap
                                        sx={{
                                            fontFamily: "Poppins",
                                            fontWeight: 900,
                                            color: "inherit",
                                            textDecoration: "none",
                                            padding: 2,
                                            fontSize: "20px",
                                            pr: 0.5,
                                        }}
                                    >
                                        ClaimsIntel
                                    </Typography>
                                </Toolbar>

                                <Box sx={{ paddingTop: 3, zIndex: 999 }}>
                                    {step(1, "Application Cognition")}
                                    {step(2, "Claims Analysis")}
                                    {step(3, "Recommendations")}
                                    {step(4, "Threshold")}
                                    {step(5, "Report Engine")}

                                </Box>
                                <Button
                                    onClick={() => {

                                        navigate('/home');
                                    }}
                                    size="small"
                                    sx={{
                                        cursor: 'pointer',
                                        fontSize: 'small',
                                        minWidth: '16vw',
                                        maxWidth: '16vw',
                                        display: 'flex', color: 'white',
                                        // backgroundColor: '#EBEBEB',
                                        backgroundImage: 'linear-gradient(to right, #011d42, #147D76)',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginTop: 'auto',
                                        alignSelf: 'end',
                                        justifySelf: 'end',
                                        textTransform: 'none', // prevent uppercase transformation of text
                                    }}
                                >
                                    <span style={{ fontSize: '3vh' }}>←</span>
                                    <div style={{ marginLeft: '0.5vw', fontWeight: 'bold' }}>Back</div>
                                </Button>
                            </Grid>





                            {/* After Diagram Grid (BOTTOM) */}
                            <Grid container flexDirection={"row"} justifyContent={"center"} sx={{ maxHeight: '100vh', minWidth: '84vw', maxWidth: '84vw' }}>

                                {/* Grid for right side data  (BOTTOM-RIGHT*/}
                                <Grid item container flexDirection={"column"} alignItems={'center'} justifyContent={'center'} maxWidth={'80vw'} minWidth={'80vw'} sx={{ backgroundColor: '#EAF3FA', borderRadius: '5px', maxHeight: '100vh', minHeight: '100vh' }}>
                                    {/* Grid for internal left  (BOTTOM-RIGHT-LEFT)*/}
                                    <Grid item container flexDirection={"column"} p={0} sx={{ marginLeft: '0.7vw', maxHeight: '100vh', minHeight: '100vh', overflowY: 'auto', scrollbarWidth: 'none', borderRadius: '5px' }}>
                                        <Slide direction="right" in={checked} key={show} timeout={800} mountOnEnter unmountOnExit >

                                            <Grid item container flexDirection={"column"} style={{ backgroundColor: '#EAF3FA', paddingTop: '5vh' }}>

                                                {show == 1 && <AppCognition dataval={dataval} claimid={claimid} />}
                                                {show == 2 && <MemberCaseAnalysis dataval={dataval} claimid={claimid} />}
                                                {show == 3 && <DecisionEngine dataval={dataval} />}
                                                {show == 4 && <RecommendationEngine claimid={claimid} dataval={dataval} data7={data7} setActionName={setActionName} setEditOrAdd={setEditOrAdd} setEditAddData={setEditAddData} setOpenEditAddDialog={setOpenEditAddDialog} setData7={setData7} />}
                                                {show == 5 && <Report dataval={dataval} data7={data7} setData7={setData7} claimid={claimid} />}

                                            </Grid>

                                        </Slide>

                                    </Grid>

                                </Grid>
                                <Footer />
                            </Grid>




                            {/* for Edit and Add dialog  */}
                            <BootstrapDialog
                                onClose={() => {
                                    setEditAddData(null);
                                    setOpenEditAddDialog(false);
                                }}
                                aria-labelledby="customized-dialog-title"
                                open={openEditAddDialog}
                                fullWidth={true}
                                maxWidth={'md'}
                            >
                                <DialogTitle sx={{ m: 0, p: 2, width: '90%' }} id="customized-dialog-title">
                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>{editOrAdd} Actionable Task</div>
                                        <Button color='secondary' variant='contained' onClick={() => { handleEdit() }}>Submit</Button>


                                    </div>
                                </DialogTitle>

                                <IconButton
                                    aria-label="close"
                                    onClick={() => {
                                        setOpenEditAddDialog(false);
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
                                {editAddData !== null &&
                                    <DialogContent dividers >
                                        <Typography variant='body2'
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}>

                                            <Box
                                                component="form"
                                                noValidate
                                                autoComplete="off"
                                                flex={'column'}
                                                minWidth={'95%'}
                                            >

                                                <TextField id="name" label="Name" variant="outlined" multiline fullWidth defaultValue={editAddData.ActionName}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#FD5F07', // Change the border color when focused
                                                            }
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: '#FD5F07', // Change label color when focused
                                                        },
                                                    }}
                                                    onChange={(event) => {
                                                        setEditAddData(prev => ({
                                                            ...prev, // Spread the previous state
                                                            'ActionName': event.target.value // Update only the name field
                                                        })
                                                        )
                                                    }}
                                                />
                                                <br></br>
                                                <br></br>
                                                <br></br>
                                                <TextField id="action" label="Detail" variant="outlined" multiline fullWidth defaultValue={editAddData.ActionDetail}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#FD5F07', // Change the border color when focused
                                                            }
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: '#FD5F07', // Change label color when focused
                                                        },
                                                    }}
                                                    onChange={(event) => {
                                                        setEditAddData(prev => ({
                                                            ...prev, // Spread the previous state
                                                            'ActionDetail': event.target.value // Update only the name field
                                                        })
                                                        )
                                                    }}
                                                />
                                                <br></br>
                                                <br></br>
                                                <br></br>
                                                <TextField id="reason" label="Reason" variant="outlined" multiline fullWidth defaultValue={editAddData.ActionReasoning}
                                                    sx={{
                                                        '& .MuiOutlinedInput-root': {
                                                            '&.Mui-focused fieldset': {
                                                                borderColor: '#FD5F07', // Change the border color when focused
                                                            }
                                                        },
                                                        '& .MuiInputLabel-root.Mui-focused': {
                                                            color: '#FD5F07', // Change label color when focused
                                                        },
                                                    }}
                                                    onChange={(event) => {
                                                        setEditAddData(prev => ({
                                                            ...prev, // Spread the previous state
                                                            'ActionReasoning': event.target.value // Update only the name field
                                                        })
                                                        )
                                                    }}
                                                />
                                                <br></br>
                                                <br></br>
                                                <br></br>
                                                {editAddData.ActionEmail !== undefined &&
                                                    <>
                                                        <TextField id="Email" label="Email" variant="outlined" multiline fullWidth defaultValue={editAddData.ActionEmail}
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    '&.Mui-focused fieldset': {
                                                                        borderColor: '#FD5F07', // Change the border color when focused
                                                                    }
                                                                },
                                                                '& .MuiInputLabel-root.Mui-focused': {
                                                                    color: '#FD5F07', // Change label color when focused
                                                                },
                                                            }}
                                                            onChange={(event) => {
                                                                setEditAddData(prev => ({
                                                                    ...prev, // Spread the previous state
                                                                    'ActionEmail': event.target.value // Update only the name field
                                                                })
                                                                )
                                                            }}
                                                        />
                                                    </>
                                                }


                                            </Box>
                                            {/* {JSON.stringify(editAddData)} */}
                                        </Typography>
                                    </DialogContent>}
                            </BootstrapDialog>




                            <Backdrop
                                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
                                open={editLoading}
                            >
                                <CircularProgress color="inherit" />
                            </Backdrop>


                        </Grid>

                    }
                </Grid>
            }

        </>
    )
}

export default ClaimDetails;


