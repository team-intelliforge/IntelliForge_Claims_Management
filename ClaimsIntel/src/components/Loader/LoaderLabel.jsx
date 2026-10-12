import * as React from "react";

import { useSelector } from "react-redux";

import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import { getApiStatus } from "../../features/loaderSlice";

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function LinearWithValueLabel() {
  const [progress, setProgress] = React.useState(0);

  const apiStatus = useSelector(getApiStatus);

  React.useEffect(() => {
    setProgress(0);
    if (apiStatus.isLoading) {
      let timerId = setInterval(
        () =>
          setProgress((prevProgress) =>
            prevProgress < 90 ? prevProgress + 10 : prevProgress
          ),
        150
      );
      setTimeout(() => {
        clearInterval(timerId);
      }, 10000);

      if (apiStatus.apiSuccess === true) {
        setProgress(100);
        clearInterval(timerId);
      }
    } else {
      setProgress(0);
    }
  }, [apiStatus.apiSuccess, apiStatus.isLoading]);

  return (
    <Box sx={{ width: "100%" }}>
      <LinearProgressWithLabel value={progress} />
    </Box>
  );
}
