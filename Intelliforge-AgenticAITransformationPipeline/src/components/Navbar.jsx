import { AppBar, Avatar, Grid, Tooltip, Typography } from '@mui/material';
import avatar from '../assets/avatar1.png';
import { useNavigate } from 'react-router-dom';
import teamIcon from '../assets/TeamIcon.png'

function Navbar({ showAvatar = true }) {
  const navigate = useNavigate();

  return (
    <Grid container justifyContent='space-between' sx={{backgroundColor:'white',borderBottom: '2px solid #e0e0e0',height:'8vh', }}>
      
        <Grid
          container
          alignItems='flex-start'
          sx={{
            alignItems: 'center',
            ml: 2,
            flex: 1,
            cursor: 'pointer',
            p: 0,
          }}
          onClick={() => navigate('/create')}
        >
          <img src={teamIcon} alt='IntelliForge' width={45} />
          <Typography
            variant='h6'
            noWrap
            sx={{
              
              fontWeight: 900,
              color: '#2563EB',
              textDecoration: 'none',
              padding: 2,
              fontSize: '1em',
              pr: 0.5,
              letterSpacing: '0.1em'
            }}
          >
            Intelliforge - Agentic AI Transformation Pipeline
          </Typography>
        </Grid>
        {showAvatar && (
          <Grid item container alignItems='center' xs justifyContent='flex-end' sx={{ mr: 4 }}>
            <Tooltip title='Logout'>
              <Avatar
                sx={{
                  width: '30px',
                  height: '30px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
                src={avatar}
                onClick={() => navigate('/')}
              />
            </Tooltip>
          </Grid>
        )}
    </Grid>
  );
}

export default Navbar;
