import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import VerifyCode from "./components/VerifyCode";
import Crarea from "./components/Cr-area";
import HomePage from "./HomePage";
import Dashboard from "./Dashboard";
import TestCatalog from "./components/TestCatalog"
import Services from "./Services"

function App() {
  return (
    <Router>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Verify-Code" element={<VerifyCode />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cr-area" element={<Crarea />} />
        <Route path="/Cr-rea" element={<Dashboard />} />
        <Route path="/services" element={<Services />} />
        <Route path="/TestCatalog" element={<TestCatalog />} />
      </Routes>
    </Router>
  );
}

export default App;

