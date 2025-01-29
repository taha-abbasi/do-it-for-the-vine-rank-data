// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import VineTable from "./components/VineTable";
import DnsDetailedPage from "./components/DnsDetailedPage"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Root path: show VineTable */}
        <Route path="/" element={<VineTable />} />

        {/* /dns path: show a detailed DNS page */}
        <Route path="/dns" element={<DnsDetailedPage />} />
      </Routes>
    </Router>
  );
}

export default App;