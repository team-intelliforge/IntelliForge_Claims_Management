
import MenuIcon from '@mui/icons-material/Menu';

import { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { Typography, Box, Button, Grid, IconButton, TextField, Snackbar, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import Loader from '../components/Loader/Loader';
import UserSidebar from '../components/UserSidebar';
import {updateChainOfThought, updateCollapse, updateFirstTabData, updateFlowDiagram, updateMoneyMoverCount, updateSelectedFile, updateStep, updateType, updateYamlCode, updateYamlStatus, updateAll, updateGraphData, updateEvalData } from '../app/chatSlice';
import mammoth from 'mammoth';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PropTypes from 'prop-types';
// *** Dont remove it is usefull
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useDispatch, useSelector } from 'react-redux';
import Markdown from './Markdown';
import MarkdownPdfGenerator from './MarkdownPdfRenderer';
import ExcelSheetViewer from './ExcelSheetViewer';
import AddIcon from '@mui/icons-material/ControlPoint';
import MinusIcon from '@mui/icons-material/RemoveCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Or use VisibilityOutlined

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

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}
CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};


function DocxViewer({ file, fileName }) {
  const containerRef = useRef(null);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file || !containerRef.current) return;

    let cancelled = false;

    const renderDocx = async () => {
      try {
        setRendering(true);
        setError('');

        containerRef.current.innerHTML = '';

        const arrayBuffer = await file.arrayBuffer();

        if (cancelled) return;

        await renderAsync(
          arrayBuffer,
          containerRef.current,
          containerRef.current,
          {
            className: 'docx-preview',
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
            renderComments: false,
            useBase64URL: true,
          }
        );
      } catch (err) {
        console.error('DOCX preview failed:', err);
        setError(err?.message || 'Unable to preview DOCX file.');
      } finally {
        if (!cancelled) {
          setRendering(false);
        }
      }
    };

    renderDocx();

    return () => {
      cancelled = true;

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [file]);

  // const handleDownloadPdf = () => {
  //   if (!containerRef.current) return;

  //   const safeName = fileName?.replace(/\.[^/.]+$/, '') || 'document';

  //   html2pdf()
  //     .from(containerRef.current)
  //     .set({
  //       filename: `${safeName}.pdf`,
  //       margin: 8,
  //       html2canvas: {
  //         scale: 2,
  //         useCORS: true,
  //       },
  //       jsPDF: {
  //         unit: 'mm',
  //         format: 'a4',
  //         orientation: 'portrait',
  //       },
  //       pagebreak: {
  //         mode: ['css', 'legacy'],
  //       },
  //     })
  //     .save();
  // };

  return (
    <Box sx={{ width: '100%' }}>
      {/* <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 1,
          gap: 1,
        }}
      >
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={handleDownloadPdf}
          disabled={rendering || !!error}
        >
          Download PDF
        </Button>
      </Box> */}

      {rendering && (
        <Typography variant="body2" color="text.secondary">
          Rendering DOCX preview...
        </Typography>
      )}

      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}

      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          minHeight: '75vh',
          overflow: 'auto',
          // backgroundColor: '#f5f5f5',
          // p: 2,
          borderRadius: '8px',

          '& .docx-wrapper': {
            backgroundColor: '#f5f5f5',
            padding: '16px',
          },

          '& .docx': {
            backgroundColor: '#fff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            margin: '0 auto 16px auto',
          },

          '& table': {
            borderCollapse: 'collapse',
          },

          '& img': {
            maxWidth: '100%',
          },
        }}
      />
    </Box>
  );
}

DocxViewer.propTypes = {
  file: PropTypes.object,
  fileName: PropTypes.string,
};

function LeftBar({ showAvatar = true, setLoader }) {
  const leftBarOpen = useSelector((state) => state.chat.collapse)
  const [data, setData] = useState(null);
  const [value, setValue] = useState(2);
  const [valueMini, setValueMini] = useState(0);
  const allData2 = useSelector((state) => state.chat)
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleChangeMini = (event, newValue) => {
    setValueMini(newValue);
  };

  const [openDiagram, setOpenDiagram] = useState(false);
  const [saver, setSaver] = useState(false);
  // const [type, setType] = useState(' ');
  const type = useSelector((state) => state.chat.type);
  //State that stores the document code
  const [codeDoc, setCodeDoc] = useState('');

  // const [selectedFile, setSelectedFile] = useState(null);
  const selectedFile = useSelector((state) => state.chat.selectedFile);
  const [docURL, setDocURL] = useState('');
  const dispatch = useDispatch();
  const fileTypes = { T1: '.xaml,.xml', T2: '.xaml,.xml', T5: '.xaml,.xml', T3: '.json,.docx,.pdf,.xlsx,.xls,.csv', T4: '.mp4,.mkv', T6: '*', T7: '*' };
  const [addButtonText, setAddButtonText] = useState('+ ADD FILE');
  const [doc, setDoc] = useState({ name: '', file: null, file_content: '', url: '' });
  const uid = useSelector((state) => state.chat.uuid);
  const firstTabData = useSelector((state) => state.chat.firstTabData);
  useEffect(() => { }, [data]);


  function extractQuestions(data) {
    // Check if the data and the questions array exist to prevent runtime errors
    if (!data || !Array.isArray(data.questions)) {
      return [];
    }

    // Map through the array and return only the text of each question
    return data.questions.map(item => item.question);
  }

  const handleProcess = async () => {
    dispatch(updateYamlCode(''));
    dispatch(updateFirstTabData(null));
    setLoader(true);


    try {
      const formData = new FormData();
      selectedFile.forEach((fileObj) => {
        formData.append('files', fileObj.file);
      });

      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/process-pega-xml`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();

      const updatedData = {
        ...result.resp,
        process_discovery_result: result.process_discovery_result,
      };

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      const processintel_input = `\nProcess Discovery\n${updatedData.process_discovery_result}\nAutomation Strategy\n${updatedData.automation_strategy}`;

      const [processDiscoveryQuestion, automationStrategyQuestion] = await Promise.all([
        fetch(`${process.env.REACT_APP_APPGENOME_URL}/sme-feedback`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ html_input: updatedData.process_discovery_result }),
        }).then(res => res.json()),

        fetch(`${process.env.REACT_APP_APPGENOME_URL}/sme-feedback`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ html_input: updatedData.automation_strategy }),
        }).then(res => res.json()),

        handleProcessIntel(processintel_input)
      ]);

      dispatch(updateFirstTabData({
        ...updatedData,
        process_discovery_questions: extractQuestions(processDiscoveryQuestion),
        automation_strategy_questions: extractQuestions(automationStrategyQuestion),
        finalData: true
      }));

    } catch (error) {
      alert("Error processing files: " + error.message);
      console.log("Error processing files: " + error);
    } finally {
      dispatch(updateCollapse(false))
      setLoader(false);
    }
  };

  const handleProcessIntel = async (input) => {
    const formData = new FormData();
    formData.append('input_data', input);

    const priorityPromise = fetch(`${process.env.REACT_APP_PROCESSINTEL_URL}/process/dspy_priority/${uid}`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Config file upload failed');
        return response.json();
      })
      .then((data) => {
        dispatch(updateFlowDiagram(data));
      })
      .catch((error) => {
        console.error('Flow diagram Error:', error);
        dispatch(
          updateFlowDiagram([
            {
              steps: 'some error occured while generating process steps',
              cognitive_complexity: 'high',
              automation_feasibility: 'semi-automatable',
              risk_level: 'high',
              impact_level: 'high',
            },
          ])
        );
      });

    const multipleFormData = new FormData();
    multipleFormData.append('input_data', input);
    multipleFormData.append('type', 'multiple');
    multipleFormData.append('agent_list', JSON.stringify([]));

    const multiplePromise = fetch(`${process.env.REACT_APP_PROCESSINTEL_URL}/process/multiple/${uid}`, {
      method: 'POST',
      body: multipleFormData,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Config file generating failed');
        return response.json();
      })
      .then((data) => {
        dispatch(updateYamlCode(data.yaml));
        dispatch(updateGraphData(data.graphData))
        dispatch(updateChainOfThought(data.chain_of_thought))
      })
      .catch((error) => {
        console.error('Error:', error);
        dispatch(updateYamlCode('Error while generating config'));
        dispatch(
          updateFlowDiagram([
            {
              steps: 'some error occured while generating config',
              cognitive_complexity: 'high',
              automation_feasibility: 'semi-automatable',
              risk_level: 'high',
              impact_level: 'high',
            },
          ])
        );
      });

    await Promise.all([priorityPromise, multiplePromise]);
  };

  const readPlainFilePromise = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  // --- Multi-Select File Handling Logic ---
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    try {
      setAddButtonText('Reading files...');
      const newProcessedFiles = [];

      for (const file of files) {
        const extension = file.name.split('.').pop().toLowerCase();
        const url = URL.createObjectURL(file);
        let extractedText = "";

        if (extension === 'xml') {
          extractedText = await readPlainFilePromise(file);
          newProcessedFiles.push({
            type: 'xml',
            name: file.name,
            file: file,
            file_content: extractedText,
            url: url
          });
        }
        else if (extension === 'xaml') {
          extractedText = await readPlainFilePromise(file);
          newProcessedFiles.push({
            type: 'xaml',
            name: file.name,
            file: file,
            file_content: extractedText,
            url: url
          });
        }
        else if (extension === 'pdf') {
          extractedText = await extractTextFromPDF(file, url);
          newProcessedFiles.push({
            type: 'pdf',
            name: file.name,
            file: file,
            file_content: extractedText,
            url: url
          });
        }
        else if (extension === 'json') {
          extractedText = ""
          newProcessedFiles.push({
            type: 'json',
            name: file.name,
            file: file,
            file_content: extractedText,
            url: url
          });
        }
        else if (extension === 'docx') {
          extractedText = await extractTextFromDocx(file);
          newProcessedFiles.push({
            type: 'docx',
            name: file.name,
            file: file,
            file_content: extractedText,
            url: url
          });
        }
        else if (extension === 'mp4' || extension === 'mkv') {
          // For video files, we don't extract text but store the URL for playback
          extractedText = "";
          newProcessedFiles.push({
            type: 'video',
            name: file.name,
            file: file,
            file_content: extractedText,
            url: url
          });

        }
        else if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
          newProcessedFiles.push({
            type: 'excel',
            name: file.name,
            file: file,
            file_content: "",
            url: url
          });
        }
        else {
          newProcessedFiles.push({
            type: 'pdf',
            name: file.name,
            file: file,
            file_content: "",
            url: url
          });
        }

      }

      dispatch(updateSelectedFile([...selectedFile, ...newProcessedFiles]));
      setAddButtonText('+ ADD FILE');
      event.target.value = ''; // Reset input
    } catch (error) {
      console.error('File upload failed:', error);
      setAddButtonText('+ ADD FILE');
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

      // setCodeDoc(fullText);
      return fullText;
    };

    reader.readAsArrayBuffer(file);
  };

  const extractTextFromDocx = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const result = await mammoth.extractRawText({
            arrayBuffer: e.target.result,
          });
          resolve(result.value || '');
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <Grid
      sx={{
        position: 'relative',
        minWidth: leftBarOpen ? '20vw' : '3vw',
        maxWidth: leftBarOpen ? '20vw' : '3vw',
        minHeight: '85vh',
        marginTop: '1vh',
        border: '1px solid #dfe5f0',
        borderRadius: '10px',
        // background: '#f4f6fb',
        padding: leftBarOpen ? '16px 16px 14px' : '8px 6px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Button
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          backgroundColor: 'transparent',
          padding: 0,
          minWidth: 'auto',
          color: '#3d4d63',
          '& .MuiButton-startIcon': {
            margin: 0,
          },
          '&:hover': {
            backgroundColor: 'transparent',
          }
        }}
        onClick={() => dispatch(updateCollapse(!leftBarOpen))}
        startIcon={<MenuIcon />}
      />

      {leftBarOpen && (
        <Grid container direction="column" sx={{ width: '100%', pt: '10px' }}>
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em', color: '#3e6fb8', textTransform: 'uppercase', mb: '4px' }}>
            Input Documents
          </Typography>

          <Typography sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.1, letterSpacing: '0.1em', color: '#1c2b3c', mb: '18px' }}>
            Discovery Intake
          </Typography>

          <FormControl fullWidth size="small">
            <Select
              value={type}
              onChange={(event) => {
                dispatch(updateType(event.target.value));
              }}
              displayEmpty
              sx={{
                width: '100%',
                minHeight: '30px',
                borderRadius: '14px',
                background: 'rgba(125, 148, 202, 0.12)',
                border: '1px solid #d7e1f5',
                color: '#1d2a3a',
                fontSize: '0.88rem',
                fontWeight: 600,
                boxShadow: 'none'
                , letterSpacing: '0.1em',
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '& .MuiSelect-icon': {
                  color: '#394966',
                  right: 12,
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: '14px',
                    mt: 1,
                  },
                },
              }}
            >
              {type === ' ' && (
                <MenuItem value={' '} disabled>
                  Select
                </MenuItem>
              )}
              <MenuItem value={'T3'}>Document</MenuItem>
              <MenuItem value={'T4'}>Video</MenuItem>
              <MenuItem value={'T1'}>Pega</MenuItem>
              <MenuItem value={'T2'}>Appian</MenuItem>
              <MenuItem value={'T5'}>UiPath</MenuItem>
              <MenuItem value={'T6'}>FileNet</MenuItem>
              <MenuItem value={'T7'}>Enate</MenuItem>
            </Select>
          </FormControl>

          <input
            id="file-input"
            type="file"
            accept={fileTypes[type]}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            multiple
          />

          <Button
            fullWidth
            variant="contained"
            onClick={() => document.getElementById('file-input').click()}
            sx={{
              mt: '18px',
              height: '35px',
              borderRadius: '10px',
              background: 'linear-gradient(180deg, #0f1f35 0%, #1d2b3f 100%)',
              color: '#fff',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              boxShadow: 'none',
              '&:hover': {
                background: 'linear-gradient(180deg, #0f1f35 0%, #1d2b3f 100%)',
              },
            }}
          >
            {addButtonText === '+ ADD FILE' ? '+ ADD FILE' : addButtonText}
          </Button>

          {selectedFile.length > 0 && (
            <Button
              fullWidth
              variant="contained"
              onClick={handleProcess}
              sx={{
                mt: '10px',
                height: '35px',
                borderRadius: '12px',
                background: 'linear-gradient(180deg, #0f1f35 0%, #1d2b3f 100%)',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                boxShadow: 'none',
                '&:hover': {
                  background: 'linear-gradient(180deg, #0f1f35 0%, #1d2b3f 100%)',
                },
              }}
            >
              Process
            </Button>
          )}

          <Box sx={{ mt: '24px', mb: '8px' }}>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', color: '#3e6fb8', textTransform: 'uppercase' }}>
              Active Sources ({selectedFile.length})
            </Typography>
          </Box>

          <Grid item sx={{ maxHeight: '40vh', overflowY: 'auto', scrollbarWidth: 'thin', width: '100%' }}>
            {selectedFile.length !== 0 &&
              selectedFile.map((file, index) => (
                <Grid
                  container
                  key={index}
                  alignItems="center"
                  sx={{
                    width: '100%',
                    border: '1px solid #dfe7f5',
                    borderRadius: '16px',
                    padding: '8px 6px',
                    marginBottom: '12px',
                    // background: '#eef3fb',
                    boxSizing: 'border-box',
                  }}
                >
                  <Box
                    sx={{
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '12px',
                      color: '#3e6fb8',

                      fontSize: '1.05rem',
                      flexShrink: 0,
                    }}
                  >
                    📄
                  </Box>

                  <Grid item xs sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#1d2a3a', fontWeight: 700, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.05em' }}>
                      {file.name}
                    </Typography>

                  </Grid>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Button
                      size="small"
                      sx={{
                        minWidth: '20px', // Reduced to fit the icon better
                        width: '20px',
                        height: '28px',
                        borderRadius: '999px',
                        color: '#2b3f62',
                        textTransform: 'none',
                        padding: 0, // Centers the icon inside the pill button
                      }}
                      onClick={() => { setDoc(file); setSaver(true); console.log(allData2) }}
                    >
                      <VisibilityIcon sx={{ fontSize: '1rem' }} />
                    </Button>

                    <IconButton
                      size="small"
                      onClick={() => dispatch(updateSelectedFile(selectedFile.filter((_, i) => i !== index)))}
                      sx={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#eff2f7',
                        color: '#51627d',
                        '&:hover': { background: '#e2e8f4' },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: '0.85rem' }} />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
          </Grid>



          {selectedFile.length === 0 && (
            <Box sx={{ mt: '18px', p: '22px 18px', borderRadius: '16px', background: '#edf1f6', border: '1px solid #e0e7f2', minHeight: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography sx={{ fontSize: '0.97rem', fontWeight: 700, color: '#2d3a4b', mb: '8px' }}>
                Need help?
              </Typography>
              <Typography sx={{ fontSize: '0.92rem', color: '#5f7190', lineHeight: 1.5 }}>
                Upload process documentation or SOP transcripts to run unified discovery models.
              </Typography>
            </Box>
          )}
        </Grid>
      )}

      <BootstrapDialog open={saver} onClose={() => setSaver(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ m: 0, p: 2 }}>{doc.name}</DialogTitle>
        <IconButton onClick={() => setSaver(false)} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}>
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          {doc.type == 'xml' && <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{doc.file_content}</pre>}
          {doc.type == 'xaml' && <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{doc.file_content}</pre>}
          {doc.type === 'docx' && (<DocxViewer file={doc.file} fileName={doc.name} />)}
          {(doc.type == 'pdf' || doc.type == 'json') && <iframe src={doc.url} style={{ width: '100%', minHeight: '80vh' }} />}
          {doc.type == 'video' && <iframe src={doc.url} style={{ width: '100%', minHeight: '80vh' }} />}
          {doc.type == 'excel' && <ExcelSheetViewer file={doc.file} />}
        </DialogContent>
      </BootstrapDialog>
    </Grid>
  );
}

export default LeftBar;
