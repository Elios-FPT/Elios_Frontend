// FRONT-END: elios_FE/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./general/LandingPage";
import LandingSignUp from "./general/LandingSignUp";
import LandingSignIn from "./general/LandingSignIn";

import UserPage from "./pages/pivotPages/UserPage";
import UserHome from "./pages/userPage/UserHome";
import UserForum from "./pages/userPage/UserForum";
import CVBuilder from "./cvGenerator/pages/CVBuilder";
import CVDesignerPage from "./cvGenerator/CVDesignerPage";

import OnlineIDE from "./codingChallenge/pages/OnlineIDE";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<UserHome />} />
        <Route path="/forum" element={<UserForum />} />
        <Route path="/cv-builder-test" element={<CVBuilder />} />
        <Route path="/cv-designer" element={<CVDesignerPage />} />
        <Route path="/accounts/signup" element={<LandingSignUp />} />
        <Route path="/accounts/signin" element={<LandingSignIn />} />
        <Route path="/online-ide" element={<OnlineIDE />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
