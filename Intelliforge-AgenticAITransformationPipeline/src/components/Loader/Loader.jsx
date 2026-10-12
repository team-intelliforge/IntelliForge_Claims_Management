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
    }, 1500000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const data = [
    //   "Connecting to datasource",
    "Agent Working"
  ];

  return (
    <>
      <div>
        <div id="loading-wrapper">
          <div id="loading-text">{data[switchTimer]}</div>
          <div id="loading-content"></div>
        </div>
      </div>
    </>
  );
};

export default Loader;
