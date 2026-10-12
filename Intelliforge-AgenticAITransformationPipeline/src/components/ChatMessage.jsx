import { useState } from 'react';

import { Grid, IconButton, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AssistantIcon from '@mui/icons-material/Assistant';
import Markdown from './Markdown';

function ChatMessage({ text, who,last }) {
  return (
    <>
      <Grid
        container
        item
        sx={{
          width: '100%',
           background: who === 'bot' ? '#eee' : '#231e28',
          backgroundImage: who === 'bot' ? 'linear-gradient(to right, #fff5f57b, white)':'linear-gradient(to right, grey, grey)',
          color: who === 'bot' ? '#231e28' : '#ffffff',
          marginBottom: '8px',
          alignItems: 'center',
          borderRadius: '5px',
          padding: who !== 'bot' ? '5px 5px' : '0',
        }}
        direction='row'
      >
        <Grid item xs={0.8}>
          {who === 'bot' ? (
            <IconButton sx={{ color: '#231e28' }}>
              <AssistantIcon fontSize='small' />
            </IconButton>
          ) : (
            <IconButton sx={{ color: '#eaeaea' }}>
              <PersonIcon fontSize='small' />
            </IconButton>
          )}
        </Grid>

        <Grid item flex={1}>
          {who === 'bot' ? (

            <Typography fontSize={'14px'}>
              <Markdown markdownText={text} />
            </Typography>
          ) : (
            <Typography fontSize={'14px'}>{text}</Typography>
          )}
        </Grid>
      </Grid>
    </>
  );
}

export default ChatMessage;
