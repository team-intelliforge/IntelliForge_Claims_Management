import { useEffect, useState } from 'react';
import { Grid, Box, IconButton, Typography } from '@mui/material';
import Loader from '../components/Loader/Loader';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useSelector } from 'react-redux';

// Component to display evaluation configuration and result metrics fetched from Redux state.
function EvalConfig() {
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const uid = useSelector((state) => state.chat.uid)
  const stateData = useSelector((state) => state.chat.eval_data);
  const messageArray = useSelector((state) => state.chat.message_array);
  const leftOpen = useSelector((state) => state.chat.collapse);

  function getLastBotContent(list) {
    const filtered = list.filter((item) => item.type === 'bot' && !item.first);
    if (filtered.length === 0) {
      return 'NA';
    }
    return filtered[filtered.length - 1].content;
  }

  // Helper to transform the evaluation result object into the array format expected by the UI mapping
  const formatEvalData = (evalObj) => {
    if (!evalObj) return getFallbackData('No process to evaluate');

    // Handle if evalObj is an array (taking the first/latest item) or an object
    const item = Array.isArray(evalObj) ? evalObj[0] : evalObj;
    if (!item) return getFallbackData('No process to evaluate');

    return [
      {
        name: 'Question Answering Quality',
        score: item['question_answering_quality/score'] ?? '0.0',
        info: 'Measures how accurate and complete the final answer is and how well it aligns with reality and agent capabilities.',
        description: item['question_answering_quality/explanation'] || 'No explanation available',
      },
      {
        name: 'Relevance',
        score: item['relevance/score'] ?? '0.0',
        info: 'Determines how directly the response addresses and corresponds to the instruction and prompt.',
        description: item['relevance/explanation'] || 'No explanation available',
      },
      {
        name: 'Helpfulness',
        score: item['helpfulness/score'] ?? '0.0',
        info: 'Assesses the clarity, detail, and practical utility of the response for the user.',
        description: item['helpfulness/explanation'] || 'No explanation available',
      },
      {
        name: 'Groundedness',
        score: item['groundedness/score'] ?? '0.0',
        info: 'Refers to the extent to which responses are supported by the prompt without introducing unsupported claims.',
        description: item['groundedness/explanation'] || 'No explanation available',
      },
      {
        name: 'Safety',
        score: item['safety/score'] ?? '0.0',
        info: 'Checks for unsafe content such as hate speech, harassment, or dangerous material.',
        description: item['safety/explanation'] || 'No explanation available',
      },
      {
        name: 'Instruction Following',
        score: item['instruction_following/score'] ?? '0.0',
        info: 'Evaluates how precisely the response fulfills conditional requirements and steps in the instruction.',
        description: item['instruction_following/explanation'] || 'No explanation available',
      },
    ];
  };

  const getFallbackData = (statusText) => [
    {
      name: 'Question Answering Quality',
      score: '0.0',
      info: 'Measures how accurate and complete the final answer is.',
      description: statusText,
    },
    {
      name: 'Relevance',
      score: '0.0',
      info: 'Determines how relevant the response is to the instruction.',
      description: statusText,
    },
    {
      name: 'Helpfulness',
      score: '0.0',
      info: 'Assesses the clarity and practical utility of the response.',
      description: statusText,
    },
    {
      name: 'Groundedness',
      score: '0.0',
      info: 'Refers to the extent to which responses are supported by the prompt.',
      description: statusText,
    },
    {
      name: 'Safety',
      score: '0.0',
      info: 'Checks for unsafe content or hazardous material.',
      description: statusText,
    },
    {
      name: 'Instruction Following',
      score: '0.0',
      info: 'Evaluates how precisely the response fulfills conditional requirements.',
      description: statusText,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const response = getLastBotContent(messageArray);
      try {
        const formData = new FormData();
        formData.append('response_eval', response);

        const res = await fetch(`${process.env.REACT_APP_BASE_URL}/evaluate/${uid}`, {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();
        setData(json['eval_data']);
      } catch (error) {
        console.error("Failed to fetch evaluation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [messageArray, stateData]);

  return (
    <>
      {!loading && (
        <Box sx={{ minWidth: !leftOpen ? '80vw' : '52vw', maxHeight: '100%', overflowY: 'scroll', scrollbarWidth: 'none', p: 2 }}>
          {data?.map((item, index) => (
            <Box key={index} sx={{ mb: '2vh', paddingInline: '8vh', borderWidth: '0.01px', borderRadius: '3px', minHeight: '10vh' }}>
              <Grid container direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '97%', mb: '3vh' }}>
                <Typography fontWeight="600" fontSize="0.9rem">
                  {item.name}
                  <Tooltip title={item.info} placement="bottom-start">
                    <IconButton size="small">
                      <InfoOutlinedIcon color="secondary" sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Typography>
                <Typography fontSize="0.9rem">Score: {item.score}</Typography>
              </Grid>
              <Grid container direction="column" justifyContent="space-between" alignItems="start" sx={{ mb: '2vh', width: '99%' }}>
                <Typography fontSize="0.8rem">{item.description}</Typography>
              </Grid>
            </Box>
          ))}
        </Box>
      )}

      {loading && (
        <Grid sx={{ position: 'relative', width: '100%', minHeight: '100%', maxHeight: '100%' }}>
          <Loader />
        </Grid>
      )}
    </>
  );
}

export default EvalConfig;