import { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { Typography, Box, Button, Grid, IconButton, TextField, Snackbar, Tooltip, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import Loader from './Loader/Loader';
import UserSidebar from './UserSidebar';
import { updateFirstTabData, updateFlowDiagram, updateMoneyMoverCount, updateSelectedFile, updateStep, updateType, updateYamlCode, updateYamlStatus } from '../app/chatSlice';
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



// RenderDocument component
function RenderDocument({ value }) {

  const errorData = {
    "cost_estimation": {
      "llm_used": "error",
      "context_tokens": "error",
      "approximate_token_size": "error",
      "approximate_token_cost": {
        "currency": "error",
        "amount": "error"
      },
      "breakdown": {
        "extract": {
          "tokens": "error",
          "cost": "error",
          "nodes": [
            {
              "node": "error",
              "context_tokens": "error",
              "prompt_tokens": "error",
              "input_tokens": "error",
              "output_tokens": "error",
              "total_tokens": "error",
              "cost": "error"
            },
            {
              "node": "error",
              "context_tokens": "error",
              "prompt_tokens": "error",
              "input_tokens": "error",
              "output_tokens": "error",
              "total_tokens": "error",
              "cost": "error"
            }
          ]
        },
        "strategy": {
          "tokens": "error",
          "cost": "error",
          "nodes": [
            {
              "node": "error",
              "context_tokens": "error",
              "prompt_tokens": "error",
              "input_tokens": "error",
              "output_tokens": "error",
              "total_tokens": "error",
              "cost": "error"
            },
            {
              "node": "error",
              "context_tokens": "error",
              "prompt_tokens": "error",
              "input_tokens": "error",
              "output_tokens": "error",
              "total_tokens": "error",
              "cost": "error"
            },
            {
              "node": "error",
              "context_tokens": "error",
              "prompt_tokens": "error",
              "input_tokens": "error",
              "output_tokens": "error",
              "total_tokens": "error",
              "cost": "error"
            },
            {
              "node": "error",
              "context_tokens": "error",
              "prompt_tokens": "error",
              "input_tokens": "error",
              "output_tokens": "error",
              "total_tokens": "error",
              "cost": "error"
            },
            {
              "node": "error",
              "context_tokens": "error",
              "prompt_tokens": "error",
              "input_tokens": "error",
              "output_tokens": "error",
              "total_tokens": "error",
              "cost": "error"
            }
          ],
          "final_context_tokens": "error"
        },
        "documentation": {
          "tokens": "error",
          "cost": "error",
          "nodes": [
            {
              "node": "error",
              "context_tokens": "error",
              "prompt_tokens": "error",
              "input_tokens": "error",
              "output_tokens": "error",
              "total_tokens": "error",
              "cost": "error"
            },
            {
              "node": "error",
              "context_tokens": "error",
              "prompt_tokens": "error",
              "input_tokens": "error",
              "output_tokens": "error",
              "total_tokens": "error",
              "cost": "error"
            },
            {
              "node": "error",
              "context_tokens": "error",
              "prompt_tokens": "error",
              "input_tokens": "error",
              "output_tokens": "error",
              "total_tokens": "error",
              "cost": "error"
            },
            {
              "node": "error",
              "context_tokens": "error",
              "prompt_tokens": "error",
              "input_tokens": "error",
              "output_tokens": "error",
              "total_tokens": "error",
              "cost": "error"
            }
          ]
        }
      }
    },
    "summary": {
      "cost_predictability": "error",
      "reusability": "error",
      "business_value": "error",
      "rpa_assessment": "error",
      "agentic_assessment": "error",
      "human_review": "error",
      "recommendation": "error",
      "confidence": "error"
    }
  }
  const [FEEDBACK_QUESTIONS, setFeedbackQuestions] = useState([])
  function FeedbackModal({ open, onClose }) {
    const [responses, setResponses] = useState(
      Object.fromEntries(FEEDBACK_QUESTIONS.map((_, i) => [i, '']))
    );

    const handleChange = (index, value) => {
      setResponses((prev) => ({ ...prev, [index]: value }));
    };




    const handleSubmit = () => {
      const result = FEEDBACK_QUESTIONS.map((question, i) => ({
        question,
        response: responses[i],
      }));

      console.log('Feedback submitted:', result);

      // 1. Convert the result object into a JSON string
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(result, null, 2)
      )}`;

      // 2. Create a temporary anchor element
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', 'sme-feedback.json');

      // 3. Append to body, trigger the download, and clean up
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      // 4. Close and reset state
      onClose();
      setResponses(Object.fromEntries(FEEDBACK_QUESTIONS.map((_, i) => [i, ''])));
    };

    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" >
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: 600 }}>
          Share Your Feedback
          <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ scrollbarWidth: 'thin' }}>
          {FEEDBACK_QUESTIONS.map((question, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                {index + 1}. {question}
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                placeholder="Your response..."
                value={responses[index]}
                onChange={(e) => handleChange(index, e.target.value)}
                size="small"
              />
            </Box>
          ))}
        </DialogContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, gap: 1 }}>
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ backgroundColor: '#89c456', '&:hover': { backgroundColor: '#97e506' } }}
          >
            Generate
          </Button>
        </Box>
      </Dialog>
    );
  }

  const collapse = useSelector((state) => state.chat.collapse)


  // State variables for managing the component's state
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isAutomationTooltipOpen, setIsAutomationTooltipOpen] = useState(false);

  const dispatch = useDispatch();

  const firstTabData = useSelector((state) => state.chat.firstTabData);
  // const firstTabData = mmv;
  // const firstTabData={}

  function extractQuestions(data) {
    // Check if the data and the questions array exist to prevent runtime errors
    if (!data || !Array.isArray(data.questions)) {
      return [];
    }

    // Map through the array and return only the text of each question
    return data.questions.map(item => item.question);
  }





  // Render the component
  return (
    <>
      {isAutomationTooltipOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1400,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* This is the container for the right component */}
      <Grid
        sx={{
          position: 'relative',
          minWidth: !collapse ? '96%' : '80vw',
          maxWidth: !collapse ? '96%' : '80vw',
          minHeight: '85vh',
          maxHeight: '85vh',
          overflowY: 'scroll',
          scrollbarWidth: 'none',
          backgroundColor: '#f9f9f9',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'start',
          alignItems: 'center',
          paddingInline: '5vh'
        }}
      >
        {
          !loading && !firstTabData && (
            /* UI to show when data is null/missing */
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '90vh',
                borderRadius: '5px',
                gap: 2,
                textAlign: 'center',
                padding: '2rem'
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  background: '#f5f5f5',
                  borderRadius: '12px',
                  padding: '3rem 2rem',
                  maxWidth: '500px',
                  border: '1px solid #e0e0e0'
                }}
              >
                <Box sx={{ mb: 2, fontSize: '2.5rem' }}>📄</Box>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    color: '#333', 
                    mb: 1
                  }}
                >
                  Ready to Analyze Your Process?
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666'
                  }}
                >
                  Upload and process your files to generate analysis reports.
                </Typography>
              </Paper>
            </Box>
          )
        }
        {/* Shows after cost analysis process */}
        {!loading && firstTabData && (
          <>

            <>

              <Grid sx={{
                borderRadius: '5px',
                minWidth: '98%',
                maxWidth: '98%',
                minHeight: '84vh',
                maxHeight: '84vh',
                overflowY: 'auto',
                scrollbarWidth: 'none',
              }}>

                <CustomTabPanel value={value} index={1}>

                  <Grid sx={{
                    maxWidth: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                    <br />
                    <Grid sx={{ display: 'flex', flexDirection: 'row', alignSelf: 'end', justifyContent: 'space-between', marginRight: '2vw', maxWidth: '12vw', minWidth: '12vw', marginBottom: '2vh' }}>

                      <Button variant="outlined" color="secondary" size="small" sx={{ maxHeight: '5vh' }} onClick={() => { setFeedbackQuestions(firstTabData?.process_discovery_questions ?? []); setFeedbackOpen(true); }}>Feedback</Button>
                      <MarkdownPdfGenerator markdownStrings={firstTabData.process_discovery_result} fileName={`Process_Discovery.pdf`} type={'html'} />
                    </Grid>
                    <Markdown markdownText={firstTabData.process_discovery_result} />
                  </Grid>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={3}>
                  <Grid sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                    <br />
                    <Grid sx={{ display: 'flex', flexDirection: 'row', alignSelf: 'end', justifyContent: 'space-between', marginRight: '2vw', maxWidth: '12vw', minWidth: '12vw', marginBottom: '2vh' }}>
                      <Button variant="outlined" color="secondary" size="small" onClick={() => { setFeedbackQuestions(firstTabData?.operational_insights_questions ?? []); setFeedbackOpen(true); }}>Feedback</Button>

                      <MarkdownPdfGenerator markdownStrings={firstTabData.operational_insights_result} fileName={`Operational_Insights.pdf`} type={'html'} />
                    </Grid>
                    {/* <MarkdownPdfGenerator markdownStrings={firstTabData.operational_insights_result} fileName={`Operational_Insights.pdf`} /> */}

                    <Markdown markdownText={firstTabData.operational_insights_result} />
                    {/* {firstTabData.operational_insights_result} */}
                  </Grid>

                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                  <Grid sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                    <br />

                    <Grid sx={{ display: 'flex', flexDirection: 'row', alignSelf: 'end', justifyContent: 'space-between', marginRight: '2vw', maxWidth: '12vw', minWidth: '12vw', marginBottom: '2vh' }}>
                      <Button variant="outlined" color="secondary" size="small" onClick={() => { setFeedbackQuestions(firstTabData?.automation_strategy_questions ?? []); setFeedbackOpen(true); }}>Feedback</Button>

                      <MarkdownPdfGenerator markdownStrings={firstTabData.automation_strategy} fileName={`Automation_Strategy.pdf`} type={'html'} />
                    </Grid>
                    {/* <MarkdownPdfGenerator markdownStrings={firstTabData.automation_strategy} fileName={`Automation_Strategy.pdf`} /> */}

                    <Markdown markdownText={firstTabData.automation_strategy} />
                  </Grid>
                </CustomTabPanel>
                <CustomTabPanel value={value} index={4}>



                  <Grid sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}>
                    <br />
                    <Grid sx={{ display: 'flex', flexDirection: 'row', alignSelf: 'end', justifyContent: 'end', marginRight: '2vw', maxWidth: '12vw', minWidth: '12vw', marginBottom: '2vh' }}>

                      <MarkdownPdfGenerator markdownStrings={firstTabData.SOP} fileName={`SOP.pdf`} type={'markdown'} />
                    </Grid>
                    <Paper elevation={3} sx={{ padding: '4vh' }}>

                      <Markdown markdownText={firstTabData.SOP} />
                    </Paper>
                    {/* {firstTabData.SOP} */}
                  </Grid>
                </CustomTabPanel>



              </Grid>
            </>

          </>
        )}


        {/* Shows when loading is true */}
        {loading && <Loader />}
        <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      </Grid>

    </>
  );
}

export default RenderDocument;

