import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import Persona from '../assets/annuity.png';

import { Button, Grid, Paper, TextField, Typography } from '@mui/material';

// This is the login component
const Login = () => {
  // State variables for email, password, and error messages
  const [email, setEmail] = useState('jamesdoe@agents.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({ email: false, password: false });

  const navigate = useNavigate();

  // Function to handle login button click
  const handleClick = () => {

    setError({ email: false, password: false });
    if (email !== 'jamesdoe@agents.com') {
      setError({ email: true, password: false });
    } else if (email === 'jamesdoe@agents.com' && password !== 'Pass') {
      setError({ email: false, password: true });
    } else {
      sessionStorage.setItem('isAuthenticated', 'true');
      navigate('/create');
    }
  };
  
  // Render the login form
  return (
    <Grid container alignItems='center' justifyContent='center' sx={{ py: '2rem', mt: 12}} spacing={4}>
      <Paper
        elevation={5}
        sx={{
          p: 4,
          borderRadius: '10px',
          backgroundImage:'linear-gradient(to right, white, #eee)'
        }}
      >
        <Grid container alignItems='center'>
          <Grid
            item
            sx={{
              mr: 4,
            }}
          >
            <img src={Persona} alt='Persona' height='350px' style={{ borderRadius: '20px',maxHeight:'350px' }} />
          </Grid>
          <Grid
            item
            sx={{
              borderLeft: '1px solid rgba(0,0,0,0.1)',
              pl: 4,
            }}
          >
            <Typography
              fontWeight={600}
              variant='h6'
              sx={{
                mb: 1,
              }}
            >
              Email Id
            </Typography>
            <TextField sx={{ mb: 4 }} id='email' fullWidth type='email' placeholder='Enter Email Id' value={email} onChange={(e) => setEmail(e.target.value)} error={error.email} helperText={error.email ? 'Incorrect email' : ''} />
            <Typography
              fontWeight={600}
              variant='h6'
              sx={{
                mb: 1,
              }}
            >
              Password
            </Typography>
            <TextField id='password' fullWidth placeholder='Enter Password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} error={error.password} helperText={error.password ? 'Incorrect password' : ''} />
            <Button
              variant='contained'
              fullWidth
              sx={{
                mt: 4,
                mb: 1,
                fontSize: 'large',
              }}
              onClick={handleClick}
            >
              Login
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  );
};

export default Login;
