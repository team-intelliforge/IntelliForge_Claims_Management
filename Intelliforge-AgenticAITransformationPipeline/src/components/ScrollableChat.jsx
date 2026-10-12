import ChatMessage from './ChatMessage';
import { Grid, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import Markdown from './Markdown';
import { updateConsoleData } from '../app/chatSlice';

// This component displays a scrollable chat interface that connects to a WebSocket server to receive messages in real-time.
const ScrollableChat = ({ titleRef, height = '88vh' }) => {
  // State to hold the displayed text of the Console window

  const dispatch = useDispatch();
  const urls = useSelector((state) => state.chat.urls);
  const uid = useSelector((state) => state.chat.uuid);
  const messages = useSelector((state) => state.chat.message_array);
  const displayedText = useSelector((state) => state.chat.console_data);
  const console_enable = useSelector((state) => state.chat.console_enable);

  const scrollRef = useRef(null);
  const displayedTextRef = useRef(displayedText);

  useEffect(() => {
    displayedTextRef.current = displayedText;
  }, [displayedText]);

  // Websocket connection setup
  useEffect(() => {
    // Initialize WebSocket connection
    const socket = new WebSocket(urls.REACT_APP_WEBSOCKET_W1 + uid);

    // Handle the connection open event
    socket.onopen = () => {
      console.log('WebSocket connected!');
    };

    // Handle message receiving from WebSocket server
    socket.onmessage = (event) => {
      try {
        const jsonValue = JSON.parse(event.data);
        if (jsonValue.uid === uid) {
          let updated = displayedTextRef.current + jsonValue.data.replace(/\\\\/g, '\\') + '\n';
          // const updated = jsonValue.data.replace(/\\\\/g, '\\') + '\n';

          if (updated.length > 8000) {
            updated = updated.slice(updated.length - 8000);
            // console.log('Trimmed console data to last 3000 characters');
          }

          dispatch(updateConsoleData(updated));

          // Scroll to bottom
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
          }, 0);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Handle WebSocket errors
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Handle WebSocket connection close
    socket.onclose = () => {
      // console.log('WebSocket closed');
    };

    // Cleanup WebSocket connection on component unmount
    return () => {
      if (socket) {
        // console.log("Closed")
        socket.close();
      }
    };
  }, []);

  return (
    <div style={{ height: height }}>
      {messages && messages.map((m, i) => <ChatMessage last={i === messages.length - 1} text={m.content} who={m.type} key={i} first={m.first} scrollRef={scrollRef} />)}
      <div ref={titleRef} />
      {console_enable && (
        <>
          <p style={{ marginBottom: '0vh', marginTop: '0vh' }}>Showing Live Agent Execution !!!</p>
          <Grid ref={scrollRef} sx={{ padding: '2vh', borderRadius: '0.6vh', backgroundColor: 'black', minHeight: '60vh', maxHeight: '60vh', overflowY: 'scroll', scrollbarWidth: 'none', color: 'white' }}>
            {/* {displayedText} */}
            <Typography fontSize={12}>
              <Markdown markdownText={displayedText} />
            </Typography>
          </Grid>
        </>
      )}
    </div>
  );
};

export default ScrollableChat;
