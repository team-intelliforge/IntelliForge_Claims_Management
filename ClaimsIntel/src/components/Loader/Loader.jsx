import "./Loader.css";
import { useEffect, useState } from "react";

const Loader = () => {
  const [switchTimer, setSwitchTimer] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSwitchTimer((timer) => {
        if (timer === 4)
          return 4;
        else
          return timer + 1
      });
    }, 1500);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const data = [
  //   "Connecting to datasource",
    "Agent Working ...",
    "Agent Working ...",
    "Agent Executing ...",
    "Agent Executing ...",
  ];

  return (
    <>
      {/* <Backdrop
        sx={{ background: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={true}
      > */}
      <div id="loading-wrapper" style={{backgroundColor:'#EAF3FA'}}>
        <div id="loading-text" >
          {data[switchTimer]}</div>
        <div id="loading-content"></div>
      </div>
      {/* </Backdrop> */}
    </>
  );
};

export default Loader;
