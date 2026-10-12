import { useDispatch, useSelector } from 'react-redux';
import {
  updateMessageArray,
  updateConsoleData,
  updateTyping,
  updateConsoleEnable,
} from '../app/chatSlice';

export const useSendChatMessage = () => {
  const dispatch = useDispatch();
  const messageArray = useSelector((state) => state.chat.message_array);
  const uid = useSelector((state) => state.chat.uuid);
  const sendChatMessage = async (message, docText) => {
    dispatch(updateConsoleData('Welcome !!!'));

    console.log("message : ", message);
    dispatch(updateMessageArray([...messageArray, { type: 'user', content: message }]));
    dispatch(updateTyping(true));
    dispatch(updateConsoleEnable(true));

    let addndata = ``;

    try {

      let processRes = null;

      processRes = await fetch(
        `${process.env.REACT_APP_BASE_URL}/process/yaml/${uid}?question=${message}\n${addndata}\n${docText}`,
        { method: 'POST' }
      );

      const resJson = await processRes.json();

      if (!processRes.ok) {
        // console.error("Throwing Error", resJson);
        throw new Error(JSON.stringify(resJson));
      }

      const data = resJson; // safe to use
      dispatch(updateTyping(false));
      dispatch(updateConsoleEnable(false));
      dispatch(updateMessageArray([
        ...messageArray,
        { type: 'user', content: message },
        {
          type: 'bot',
          content: data.trim(),
          sources: '',
          media: '',
          base64: ''
        }
      ]));


    } catch (error) {
      console.error('Error:', error.message);

      dispatch(updateTyping(false));
      dispatch(updateConsoleEnable(false));
      dispatch(updateMessageArray([
        ...messageArray,
        { type: 'user', content: message },
        {
          type: 'bot',
          content: 'Some Error Occured While Processing!!!',
          sources: '',
          media: '',
          base64: ''
        }
      ]));

    }
  };

  return sendChatMessage;
};
