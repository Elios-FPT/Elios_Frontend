// FRONT-END: elios_FE/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import UserPage from "./pages/pivotPages/UserPage";
import LandingPage from "./general/LandingPage";
import LandingSignUp from "./general/LandingSignUp";

import CvGenerator from "./cvGenerator/pages/CvGenerator";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/accounts/signup" element={<LandingSignUp />} />
       <Route path="/editor" element={<CvGenerator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
