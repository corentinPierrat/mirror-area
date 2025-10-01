// import React from "react";
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import Weather from "./components/Weather";
// import Login from "./components/Login";
// import Register from "./components/Register";
// import WorkflowBuilder from "./components/WorkflowBuilder";
// import WorkflowsList from "./components/WorkflowsList";
// import ProfileSettings from "./components/ProfileSettings";
// import "./components/styles.css";

// function App() {
//   return (
//     <Router>
//       <div className="app-container">
//         {/* Navbar */}
//         <nav className="navbar">
//           <Link to="/">Météo</Link>
//           <Link to="/login">Connexion</Link>
//           <Link to="/register">Créer un compte</Link>
//           <Link to="/workflow">Créer Workflow</Link>
//           <Link to="/workflows">Mes Workflows</Link>
//           <Link to="/profile">Profil</Link>
//         </nav>

//         {/* Pages */}
//         <Routes>
//           <Route path="/" element={<Weather />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/workflow" element={<WorkflowBuilder />} />
//           <Route path="/workflows" element={<WorkflowsList />} />
//           <Route path="/profile" element={<ProfileSettings />} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import HomePage from "./HomePage";

function App() {
  return (
    <Router>
      {/* <nav style={{ padding: "1rem", background: "#eee" }}>
        <Link to="/" style={{ margin: "0 1rem" }}>Météo</Link>
        <Link to="/login" style={{ margin: "0 1rem" }}>Connexion</Link>
        <Link to="/register" style={{ margin: "0 1rem" }}>Créer un compte</Link>
      </nav> */}

      <Routes>
        {/* <Route path="/" element={<Weather />} /> */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;

