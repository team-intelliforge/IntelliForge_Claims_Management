import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2563EB",
    },
    secondary: {
      main: "#231e28",
      contrastText: "#eee",
    },
    info: {
      main: "#fff",
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
});

export default theme;
