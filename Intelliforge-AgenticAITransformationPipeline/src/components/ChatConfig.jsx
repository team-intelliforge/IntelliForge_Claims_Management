import { useEffect, useState } from 'react';

import { Grid, IconButton,Paper,Checkbox,Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CodeMirror from '@uiw/react-codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import ChatSection from '../components/ChatSection';
import { useDispatch, useSelector } from 'react-redux';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

function ChatConfig() {

  const yaml_status = useSelector((state) => state.chat.yaml_status);
  const [saver, setSaver] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState();
  const firstTabData = useSelector((state) => state.chat.firstTabData);
  const code = useSelector((state) => state.chat.yaml_code);
  const leftOpen = useSelector((state) => state.chat.collapse)


  useEffect(() => {}, [type]);

  return (
    <Grid
      sx={{
          minWidth:(!leftOpen)?'80vw':'64vw',
          maxWidth:(!leftOpen)?'80vw':'64vw',
          maxHeight: '84vh',
          minHeight:'84vh',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'start',
        alignItems: 'start',
      }}
    >
      {(code==='') ? (<Grid sx={{'color':'orange'}}>Please Upload a Config First !!!</Grid>) : (<Grid
        sx={{
          borderStyle: 'solid',
          borderColor: 'black',
          borderWidth: '1px',
          minWidth:(!leftOpen)?'80vw':'64vw',
          height: '100%',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'start',
          alignItems: 'center',
        }}
      >
        <ChatSection />
      </Grid>)
      }

    </Grid>
  );
}

export default ChatConfig;
