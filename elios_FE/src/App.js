// FRONT-END: elios_FE/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./general/LandingPage";
import LandingSignUp from "./general/LandingSignUp";
import LandingSignIn from "./general/LandingSignIn";

import UserPage from "./pages/pivotPages/UserPage";
import UserHome from "./pages/userPage/UserHome";
import UserForum from "./pages/userPage/UserForum";

import CvGenerator from "./cvGenerator/pages/CvGenerator";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<UserHome />} />
        <Route path="/forum" element={<UserForum />} />
        <Route path="/accounts/signup" element={<LandingSignUp />} />
        <Route path="/accounts/signin" element={<LandingSignIn />} />
       <Route path="/editor" element={<CvGenerator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
