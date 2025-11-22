// src/App.js – ĐÃ SỬA
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./general/LandingPage";
import UserProfile from "./user/pages/UserProfile";

import Forum from "./forum/pages/Forum";
import PostDetail from "./forum/pages/PostDetail";
import UserPostStorage from "./forum/pages/UserPostStorage";
import EditPostForForum from "./forum/pages/EditPostForForum";

import CodingChallenge from "./codingChallenge/pages/CodingChallenge";
import OnlineIDE from "./codingChallenge/pages/OnlineIDE";
import TestConnectionToBE from "./components/test/TestConectionToBE";

import RoleProtectedRoute from "./auth/RoleProtectedRoute";

import ResumeBuilder from "./resumeBuilder/pages/ResumeBuilder";
import UserResume from "./resumeBuilder/pages/UserResume";

import AdminScreenLayout from "./admin/pages/AdminScreenLayout";
import AdminDashboard from "./admin/pages/AdminDashboard";
import PendingPosts from "./admin/pages/forum/PendingPosts";
import ReportedPosts from "./admin/pages/forum/ReportedPosts";
import AdminManageCategory from "./admin/pages/forum/AdminManageCategory";

import MockProjects from "./mockProject/pages/MockProjects";
import ProjectDetailPage from './mockProject/pages/ProjectDetailPage';

import ManageCodingBank from "./resourceManager/pages/ManageCodingBank";
import ManageProjectBank from "./resourceManager/pages/ManageProjectBank";

import ViewMockProject from "./resourceManager/pages/ViewMockProject";
import CreateMockProject from "./resourceManager/pages/CreateMockProject";
import EditMockProject from "./resourceManager/pages/EditMockProject";

import EditProjectProcesses from "./resourceManager/pages/EditProjectProcesses";

import ProjectSubmissionReview from "./resourceManager/pages/ProjectSubmissionReview";

import ManageForum from "./moderator/pages/ManageForum";

import { Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />

        {/* User Only Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={["User"]} />}>

          <Route path="/user/profile" element={<UserProfile />} />

          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/post/:id" element={<PostDetail />} />
          <Route path="/forum/user-posts" element={<UserPostStorage />} />
          <Route path="/forum/my-posts/edit/:postId" element={<EditPostForForum />} />

          <Route path="/codingChallenge" element={<CodingChallenge />} />
          <Route path="/codingChallenge/online-ide" element={<OnlineIDE />} />

          <Route path="/resume-builder" element={<UserResume />} />
          <Route path="/resume/edit/:id" element={<ResumeBuilder />} />

          <Route path="/mock-projects" element={<MockProjects />} />
          <Route path="/mock-projects/:projectId" element={<ProjectDetailPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin" element={<AdminScreenLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="forum/pending" element={<PendingPosts />} />
            <Route path="forum/reported" element={<ReportedPosts />} />
            <Route path="forum/manage-categories" element={<AdminManageCategory />} />
          </Route>
        </Route>

        {/* Resource Manager Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={["Resource Manager"]} />}>
          <Route path="/manage-coding-bank" element={<ManageCodingBank />} />
          <Route path="/manage-project-bank" element={<ManageProjectBank />} />

          <Route path="/manage-project-bank/view/:id" element={<ViewMockProject />} />
          <Route path="/manage-project-bank/create" element={<CreateMockProject />} />
          <Route path="/manage-project-bank/edit/:id" element={<EditMockProject />} />

          <Route path="/manage-project-bank/edit/:id/processes" element={<EditProjectProcesses />} />

          <Route path="/project/:projectId/submissions" element={<ProjectSubmissionReview />} />

        </Route>

        {/* Content Moderator Routes */}
        <Route element={<RoleProtectedRoute allowedRoles={["Content Moderator"]} />}>
          <Route path="/manage-forum" element={<ManageForum />} />
        </Route>

        {/* Debug */}
        <Route path="/test-backend-connection" element={<TestConnectionToBE />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;