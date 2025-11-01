// file: elios_FE/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ForumContextProvider } from "./forum/context/ForumContext";

import LandingPage from "./general/LandingPage";

import UserHome from "./pages/userPage/UserHome";
import Forum from "./forum/pages/Forum";
import PostDetail from "./forum/pages/PostDetail";

import CodingChallenge from "./codingChallenge/pages/CodingChallenge";
import OnlineIDE from "./codingChallenge/pages/OnlineIDE";
import TestConnectionToBE from "./components/test/TestConectionToBE";

import ProtectedRoute from "./auth/ProtectedRoute"; // ✅

import ResumeBuilder from "./resumeBuilder/pages/ResumeBuilder";
import UserResume from "./resumeBuilder/pages/UserResume";

import AdminScreenLayout from "./admin/pages/AdminScreenLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import PendingPosts from "./admin/pages/PendingPosts";
import ReportedPosts from "./admin/pages/ReportedPosts";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        {/* Forum Routes with Context */}
        <Route
          path="/forum/*"
          element={
            <ForumContextProvider>
              <Routes>
                <Route path="" element={<Forum />} />
                <Route path="post/:id" element={<PostDetail />} />
              </Routes>
            </ForumContextProvider>
          }
        />
        <Route path="/test-backend-connection" element={<TestConnectionToBE />} />
        <Route path="/resume-builder" element={<UserResume />} />
        <Route path="/resume-builder/:id" element={<ResumeBuilder />} />


        <Route path="/admin" element={<AdminScreenLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="forum/pending" element={<PendingPosts />} />
          <Route path="forum/reported" element={<ReportedPosts />} />
          {/* Add new admin routes here to automatically use the layout */}
        </Route>



        <Route path="/codingChallenge" element={<CodingChallenge />} />
        <Route path="/codingChallenge/online-ide" element={<OnlineIDE />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
