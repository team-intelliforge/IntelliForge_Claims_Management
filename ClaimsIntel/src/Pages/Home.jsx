import { Button, ButtonGroup, Grid, Typography, AppBar, Toolbar, Box, Chip, Paper, Slide } from '@mui/material'
import React, { useEffect, useState } from 'react'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Drawer from '@mui/material/Drawer';
import { useNavigate } from "react-router-dom";
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';


import TableData from '../components/TableData';

// Make sure to pass 'navigate' and 'TableData' via your component scope
function Home() {

  var items = TableData

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("isAuthenticated") !== "true") {
      navigate("/");
    }
  }, [])

  


  return (
    <Grid sx={{ backgroundColor: '#EAF3FA', minHeight: '100vh', maxHeight: '100vh', minWidth: '100vw', maxWidth: '100vw' }}>

      <Grid container flexDirection={"row"} justifyContent={"start"} alignItems={"start"} sx={{ maxHeight: '100vh', minHeight: '100vh' }}>
        <Grid
          item
          container flexDirection={'column'} 
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
                paddingBlock: '2vh',
                textTransform: 'none', // prevent uppercase transformation of text
              }}
            >
              <div style={{ marginLeft: '0.5vw', fontWeight: 'bold', fontSize: '1rem' }}>Dashboard</div>
            </Button>
          <Button
            onClick={() => {sessionStorage.removeItem("isAuthenticated"); navigate("/");}}
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
              justifySelf: 'end',
              textTransform: 'none', // prevent uppercase transformation of text
            }}
          >
            <span style={{ fontSize: '3vh' }}>←</span>
            <div style={{ marginLeft: '0.5vw', fontWeight: 'bold' }}>Logout</div>
          </Button>
        </Grid>

        <Grid
          item
          container flexDirection={"column"} justifyContent={"start"} alignItems={"center"}
          sx={{
            minWidth: "84vw",
            maxWidth: "84vw", // width of the sidebar
            minHeight: "100vh",
            maxHeight: "100vh", // full viewport height
            paddingTop: "10vh"
          }}
        >

          <Slide direction="down" in={true} timeout={800} mountOnEnter unmountOnExit >
          <TableContainer
            component={Paper}
            elevation={2}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              maxWidth: '95%'
            }}
          >
            <Table sx={{ minWidth: 750 }} size="small" aria-label="enhanced table">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc', height: '48px' }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '2px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      Claim ID <SwapVertIcon fontSize="small" sx={{ ml: 0.5, fontSize: '1rem', color: 'text.secondary' }} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '2px solid #e2e8f0' }}>Member Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '2px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      Date <SwapVertIcon fontSize="small" sx={{ ml: 0.5, fontSize: '1rem', color: 'text.secondary' }} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '2px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      System Status <SwapVertIcon fontSize="small" sx={{ ml: 0.5, fontSize: '1rem', color: 'text.secondary' }} />
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '2px solid #e2e8f0' }}>System Comments</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '2px solid #e2e8f0' }} align="center">Claim Manager Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {TableData.map((row) => {
                  const isCompleted = row.status === "Completed";
                  return (
                    <TableRow
                      key={row.claimid || row.name}
                      sx={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.2s ease',
                        '&:hover': { backgroundColor: '#f8fafc' },
                        '&:last-child td': { borderBottom: 0 }
                      }}
                    >
                      <TableCell sx={{ py: 1.5, fontWeight: 500, color: 'text.primary' }}>{row.claimid}</TableCell>
                      <TableCell sx={{ py: 1.5, color: 'text.secondary' }}>{row.membername}</TableCell>
                      <TableCell sx={{ py: 1.5, color: 'text.secondary' }}>{row.date}</TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          label={row.status}
                          size="small"
                          sx={{
                            fontWeight: 500,
                            fontSize: '0.75rem',
                            height: '24px',
                            backgroundColor: isCompleted ? '#dcfce7' : '#e0f2fe',
                            color: isCompleted ? '#166534' : '#0369a1',
                            border: `1px solid ${isCompleted ? '#bbf7d0' : '#bae6fd'}`,
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ py: 1.5, color: 'text.secondary', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {row.comment}
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }} align="center">
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          startIcon={<VisibilityIcon fontSize="small" />}
                          sx={{
                            textTransform: 'none',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            py: 0.5,
                            px: 1.5
                          }}
                          onClick={() => navigate('/report/' + row.claimid)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          </Slide>
                
        </Grid>
        

      </Grid>



      <Footer />
    </Grid >
  )
}

export default Home