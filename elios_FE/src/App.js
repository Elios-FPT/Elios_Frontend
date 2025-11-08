// file: elios_FE/src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// No more provider imports here!
import LandingPage from "./general/LandingPage";

import Forum from "./forum/pages/Forum";
import PostDetail from "./forum/pages/PostDetail";
import UserPostStorage from "./forum/pages/UserPostStorage";
import EditPostForForum from "./forum/pages/EditPostForForum";

import CodingChallenge from "./codingChallenge/pages/CodingChallenge";
import OnlineIDE from "./codingChallenge/pages/OnlineIDE";
import TestConnectionToBE from "./components/test/TestConectionToBE";

import ProtectedRoute from "./auth/ProtectedRoute"; // ✅

import ResumeBuilder from "./resumeBuilder/pages/ResumeBuilder";
import UserResume from "./resumeBuilder/pages/UserResume";

import AdminScreenLayout from "./admin/pages/AdminScreenLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import PendingPosts from "./admin/pages/forum/PendingPosts";
import ReportedPosts from "./admin/pages/forum/ReportedPosts";

import MockProjects from "./mockProject/pages/MockProjects";
import ProjectDetailPage from './mockProject/pages/ProjectDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Forum Routes are now flat */}
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/post/:id" element={<PostDetail />} />
        <Route path="/forum/user-posts" element={<UserPostStorage />} />
        <Route path="/forum/my-posts/edit/:postId" element={<EditPostForForum />} />

        <Route path="/test-backend-connection" element={<TestConnectionToBE />} />
        <Route path="/resume-builder" element={<UserResume />} />
        <Route path="/resume/edit/:id" element={<ResumeBuilder />} />


        <Route path="/admin" element={<AdminScreenLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="forum/pending" element={<PendingPosts />} />
          <Route path="forum/reported" element={<ReportedPosts />} />
        </Route>

        <Route path="/codingChallenge" element={<CodingChallenge />} />
        <Route path="/codingChallenge/online-ide" element={<OnlineIDE />} />

        <Route path="/mock-projects" element={<MockProjects />} />
        <Route path="/mock-projects/:projectId" element={<ProjectDetailPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          {/* <Route path="/user/home" element={<UserHome />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;