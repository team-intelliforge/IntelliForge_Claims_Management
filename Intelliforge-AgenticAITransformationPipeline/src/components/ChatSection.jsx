import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Autocomplete, Box, Container, Grid, Paper, TextField, Button, IconButton, Link } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ScrollableChat from './ScrollableChat';
import CloseIcon from '@mui/icons-material/Close';
import CodeMirror from '@uiw/react-codemirror';
import animationData from '../assets/Lotties/typing.json';
import Lottie from 'lottie-react';
import { useSendChatMessage } from '../utils/calls';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import ExcelRenderer from './ExcelRenderer';
import LaunchIcon from '@mui/icons-material/Launch';

GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';


// Styled Dialog component
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));
export default function ChatSection() {
  const sendChatMessage = useSendChatMessage();

  const typing = useSelector((state) => state.chat.typing);
  const uid = useSelector((state) => state.chat.uuid);
  const displayedText = useSelector((state) => state.chat.console_data);
  const businessWorkflow = useSelector((state) => state.chat.businessWorkflow);
  const [saver, setSaver] = useState(false);
  const [doc, setDoc] = useState({ name: '', file: null, file_content: '', url: '' });
  const [newMessage, setNewMessage] = useState('');
  const titleRef = useRef(null);
  const [agentStatus, setAgentStatus] = useState('Agent Executing...');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [addButtonText, setAddButtonText] = useState('+ ADD FILE');
  const selectedFile = useSelector((state) => state.chat.selectedFile);
  const moneyMoverCount = useSelector((state) => state.chat.moneyMoverCount);

  const extractVideoText = async (file, url) => {
    try {
      const formData2 = new FormData();
      formData2.append('video', file);
      const response = await fetch(`${process.env.REACT_APP_PROCESSINTEL_URL}/upload-video/${uid}`, {
        method: 'POST',
        body: formData2,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      let object = await response.json();
      setUploadedFiles((prev) => [...prev, { name: file.name, file: file, file_content: object.transcript, url: url }]);
      console.log('Video transcript completed :' + object.transcript);
    } catch (error) {
      //set error messages here
      console.log('Video upload failed :' + error);
      return;
    }
  };

  // Function to extract text from PDF files
  const extractTextFromPDF = async (file, url) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const typedarray = new Uint8Array(e.target.result);

      const pdf = await getDocument({ data: typedarray }).promise;

      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();

        // Group text items by line
        const lines = [];
        let currentLine = [];
        let lastY = null;

        content.items.forEach((item) => {
          const thisY = item.transform[5]; // Y position

          if (lastY === null || Math.abs(thisY - lastY) < 5) {
            currentLine.push(item.str);
          } else {
            lines.push(currentLine.join(' '));
            currentLine = [item.str];
          }

          lastY = thisY;
        });

        if (currentLine.length > 0) {
          lines.push(currentLine.join(' '));
        }

        fullText += lines.join('\n') + '\n\n';
      }
      console.log('here');
      setUploadedFiles((prev) => [...prev, { name: file.name, file: file, file_content: fullText, url: url }]);
    };

    reader.readAsArrayBuffer(file);
  };

  const summarizeDocument = async (file, url) => {
    try {

      const formData = new FormData();
      formData.append('document_text', file);

      const response = await fetch(`${process.env.REACT_APP_PROCESSINTEL_URL}/summarize_doc/${uid}`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      let result = await response.json();

      // Example: update state with summary (adjust as needed)
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          file: file,
          file_content: result.summary, // depends on API response structure
          url: url
        },
      ]);

      console.log('Document summarization completed:', result.summary);
    } catch (error) {
      console.log('Document summarization failed:', error);
      return;
    }
  };

  // Function to extract text from DOCX files
  const extractTextFromDocx = async (file, url) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = await mammoth.extractRawText({
        arrayBuffer: e.target.result,
      });

      setUploadedFiles((prev) => [...prev, { name: file.name, file: file, file_content: result.value, url: url }]);
    };

    reader.readAsArrayBuffer(file);
  };

  // Function to extract text from PPTX files
  const extractTextFromPptx = async (file, url) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const zip = await JSZip.loadAsync(e.target.result);
      let fullText = '';

      // Loop through slide files
      const slideRegex = /^ppt\/slides\/slide\d+\.xml$/;
      const slideFiles = Object.keys(zip.files).filter((file) => slideRegex.test(file));

      for (const slideFile of slideFiles) {
        const content = await zip.file(slideFile).async('string');
        const matches = [...content.matchAll(/<a:t>(.*?)<\/a:t>/g)];
        const slideText = matches.map((m) => m[1]).join(' ');
        fullText += `Slide: ${slideFile}\n${slideText}\n\n`;
      }

      setUploadedFiles((prev) => [...prev, { name: file.name, file: file, file_content: fullText, url: url }]);
    };

    reader.readAsArrayBuffer(file);
  };

  const extractTextFromXlsx = async (file, url) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      let fullText = '';

      workbook.SheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const sheetText = XLSX.utils.sheet_to_csv(sheet, { header: 1 });
        fullText += `Sheet: ${sheetName}\n${sheetText}\n\n`;
      });

      setUploadedFiles((prev) => [...prev, { name: file.name, file: file, file_content: fullText, url: url }]);
    };

    reader.readAsArrayBuffer(file);
  };



  const handleFileChange = async (event) => {
    try {
      console.log("size of uploaded file : " + uploadedFiles.length);
      setAddButtonText('Processing...');
      const file = event.target.files[0];
      const extension = file.name.split('.').pop().toLowerCase();
      const url = URL.createObjectURL(file);

      if (extension === 'pdf') {

        await extractTextFromPDF(file, url);
      } else if (extension === 'docx') {
        await extractTextFromDocx(file, url);
      } else if (extension === 'pptx') {
        await extractTextFromPptx(file, url);
      } else if (extension === 'xlsx') {
        await extractTextFromXlsx(file, url);
      } else if (extension === 'mp4' || extension === 'mkv') {
        await extractVideoText(file, url);
      } else {
        // fallback for plain text files
        const reader = new FileReader();
        reader.onload = (e) => setUploadedFiles((prev) => [...prev, { name: file.name, file: file, file_content: e.target.result, url: url }]);
        reader.readAsText(file);
      }
      console.log("size of uploaded  after : " + uploadedFiles.length);
      setAddButtonText('+ ADD FILE');
    } catch (error) {
      console.log('File upload failed :' + error);
      setAddButtonText('+ ADD FILE');
      return;
    }
  };
  // send message handler
  const sendMessage = async (event, btn) => {
    if ((btn || event?.key === 'Enter') && newMessage) {
      let message = newMessage.trim();
      let docText = uploadedFiles.map((file) => file.file_content).join('\n');
      setNewMessage('');
      // setUploadedFiles([]);
      await sendChatMessage(message, docText);
    }
  };

  // scroll to end when new message
  useEffect(() => {
    titleRef?.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [newMessage]);

  const leftOpen = useSelector((state) => state.chat.collapse)

  return (
    <>
      {
        <Box
          sx={{
            width: (!leftOpen) ? '80vw' : '64vw',
            maxHeight: '84vh',
          }}
        >
          <>
            <Container
              sx={{

                borderRadius: '5px',
                overflowY: 'hidden',
                maxHeight: '83vh',
                minHeight: '83vh',
                display: 'flex',
                flexDirection: 'column',paddingTop:'1vh'
              }}
            >
             
              {/* Chat messages */}
              <div className="messages" >
                <ScrollableChat height="84vh" titleRef={titleRef} />
              </div>

              <Box id="query" isrequired="true">
                <Grid
                  item
                  container
                  direction="row"
                  sx={{
                    marginTop: '10px',
                    position: 'relative',
                  }}
                >
                  {/* Typing indicator OR Uploaded Files */}
                  {typing ? (
                    <div
                      style={{
                        width: '200px',
                        height: '60px',
                        position: 'absolute',
                        top: '-40px',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                      }}
                    >
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                        }}
                      >
                        <Lottie animationData={animationData} height={50} width={50} />
                      </div>
                      <div style={{ color: 'grey', fontWeight: '500', fontSize: '12px', marginTop: '6px', opacity: '0.6' }}>{agentStatus}</div>
                    </div>
                  )
                    :
                    null}

                  {/* Query Input Row */}
                  <Grid container item flex={1} sx={{ height: '1vh' }}>
                    {<Grid sx={{ paddingRight: '1vw' }}>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        component="label"
                        sx={{
                          height: '100%',
                          borderTopLeftRadius: 7,
                          borderBottomLeftRadius: 7,
                        }}
                      >
                        {addButtonText}
                        <input
                          type="file"
                          hidden
                          multiple
                          accept="*"
                          onChange={handleFileChange}

                        />
                      </Button>
                    </Grid>}

                    {/* Query input */}
                    <Autocomplete size="small"
                      options={[]}
                      value={newMessage} freeSolo sx={{ flex: 1 }} onChange={(e, d) => setNewMessage(d)} renderInput={(params) => <TextField {...params} label={'Query'} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={sendMessage} />} />

                    {/* Send button */}
                    <Grid>
                      <Button
                        variant="contained"
                        sx={{
                          borderRadius: 0,
                          height: '100%',
                          borderTopRightRadius: 7,
                          borderBottomRightRadius: 7,
                        }}
                        onClick={() => sendMessage('', true)}
                      >
                        <SendIcon />
                      </Button>
                    </Grid>
                  </Grid>

                  <Grid sx={{ height: '7vh' }}></Grid>
                </Grid>
              </Box>
              {uploadedFiles.length > 0 ? (
                <Box
                  sx={{
                    // position: 'absolute',
                    // bottom: '60px',
                    marginBottom: '10px',
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                  }}
                >
                  {uploadedFiles.map((file, index) => (
                    <Paper
                      key={index}
                      elevation={3}
                      sx={{
                        // p: 1,
                        paddingLeft: 1,
                        display: 'flex',
                        alignItems: 'center',
                        // gap: 1,
                        borderRadius: 2,
                      }}
                    >
                      <span style={{ fontSize: '12px' }}>{file.name}</span>
                      <Button
                        variant="text"
                        color="secondary"
                        sx={{ fontSize: '10px', minWidth: '4vw' }}
                        size="small"
                        onClick={() => {
                          setDoc(file);
                          setSaver(true);
                        }}
                      >
                        View
                      </Button>
                      <Button sx={{ padding: 0, minWidth: '2vw' }} color="error" onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))}>
                        ✕
                      </Button>
                    </Paper>
                  ))}
                </Box>
              ) : null}
            </Container>
          </>
        </Box>
      }
      {/* This is the popup that is used to display content of the uploaded file */}
      <BootstrapDialog
        onClose={() => {
          setSaver(false);
        }}
        aria-labelledby="customized-dialog-title"
        open={saver}
        fullWidth={true}
        maxWidth={'md'}
      >
        {/* Title of popup */}
        <DialogTitle sx={{ m: 0, p: 2, width: '90%' }} id="customized-dialog-title">
          <div>File</div>
        </DialogTitle>

        <IconButton
          aria-label="close"
          onClick={() => {
            setSaver(false);
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

        {/* Content of the popup */}
        <DialogContent dividers sx={{ overflowX: 'auto', overflowY: 'auto', scrollbarWidth: 'thin' }}>
          {['xlsx'].includes(doc.name.split('.').pop().toLowerCase()) && <ExcelRenderer file={doc.file} />}
          {/* {['xlsx'].includes(doc.name.split('.').pop().toLowerCase()) && <ExcelSheetViewer file={doc.file} /> } */}
          {/* {['xlsx'].includes(doc.name.split('.').pop().toLowerCase()) && <ExcelViewer file={doc.file} url={doc.url} /> } */}
          {['docx', 'yaml', 'txt', 'xaml', 'pptx', 'json'].includes(doc.name.split('.').pop().toLowerCase()) && (
            <CodeMirror
              value={doc.file_content}
              style={{ width: '100%', height: '100%' }}
              theme="light"
              onChange={(value) => {
                setDoc({ ...doc, file_content: value });
              }}
            />
          )}
          {['pdf', 'mp4', 'mkv'].includes(doc.name.split('.').pop().toLowerCase()) && <iframe src={doc.url} style={{ width: '100%', minHeight: '80vh' }} />}
        </DialogContent>
      </BootstrapDialog>
    </>
  );
}
