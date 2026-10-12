import "./App.css";
import theme from "./Palette";
import { BrowserRouter as Router, Routes, Route, HashRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { useEffect } from "react";
import Login from "./Pages/Login";
import Home from "./Pages/Home"
import ClaimDetails from "./Pages/ClaimDetails";

function App() {
  useEffect(() => {
    document.title = "ClaimsIntel";
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="*" exact={true} element={<Login />} />
          <Route path="/" exact={true} element={<Login />} />
          <Route path="/home" exact={true} element={<Home />} />
          <Route path="/report/:claimid" exact={true} element={<ClaimDetails />} />
        </Routes>
      </HashRouter>
      
      
    </ThemeProvider>
  );
}

export default App;
