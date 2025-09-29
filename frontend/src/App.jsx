import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Weather from "./components/Weather";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#eee" }}>
        <Link to="/" style={{ margin: "0 1rem" }}>Météo</Link>
        <Link to="/login" style={{ margin: "0 1rem" }}>Connexion</Link>
        <Link to="/register" style={{ margin: "0 1rem" }}>Créer un compte</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Weather />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
