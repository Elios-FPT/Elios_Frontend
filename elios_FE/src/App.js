// FRONT-END: cv-generate-module/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import CvGenerator from "./pages/CvGenerator";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<CvGenerator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
