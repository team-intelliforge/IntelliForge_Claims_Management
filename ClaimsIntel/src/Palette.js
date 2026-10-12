import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#231e28",
    },
    secondary: {
      main: "#147D76",
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
