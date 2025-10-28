// file: elios_FE/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./general/LandingPage";
import LandingSignUp from "./general/LandingSignUp";
import LandingSignIn from "./general/LandingSignIn";

import UserHome from "./pages/userPage/UserHome";
import Forum from "./forum/pages/Forum";
import PostDetail from "./forum/pages/PostDetail";

import CodingChallenge from "./codingChallenge/pages/CodingChallenge";
import OnlineIDE from "./codingChallenge/pages/OnlineIDE";
import TestConnectionToBE from "./components/test/TestConectionToBE";

import ProtectedRoute from "./auth/ProtectedRoute"; // ✅

import ResumeBuilder from "./resumeBuilder/pages/ResumeBuilder";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/post/:id" element={<PostDetail />} />

        <Route path="/test-backend-connection" element={<TestConnectionToBE />} />
          <Route path="/resumebuilder" element={<ResumeBuilder />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<UserHome />} />
          <Route path="/codingChallenge" element={<CodingChallenge />} />
          <Route path="/codingChallenge/online-ide" element={<OnlineIDE />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
