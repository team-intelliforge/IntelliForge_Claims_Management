import "./App.css";
import theme from "./Palette";
import { BrowserRouter as Router, Routes, Route,HashRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import Home from "./Pages/Home";
import { useEffect } from "react";
import Login from "./Pages/Login";
function App() {
  useEffect(() => {
    document.title = "Agentic AI Transformation Pipeline for Pega Legacy Applications";
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <HashRouter>
        <Routes>
          <Route path="*" exact={true} element={<Login />} /> 
          <Route path="/" exact={true} element={<Login />} />  
          <Route path="/create" exact={true} element={<Home/>} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
