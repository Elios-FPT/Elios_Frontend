// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// --- General & User ---
import LandingPage from "./general/LandingPage";
import UserProfile from "./user/pages/UserProfile";
import Footer from "./components/footers/Footer";

// --- Forum (Public) ---
import Forum from "./forum/pages/Forum";
import PostDetail from "./forum/pages/PostDetail";
import UserPostStorage from "./forum/pages/UserPostStorage";
import EditPostForForum from "./forum/pages/EditPostForForum";

// --- Coding & Resume ---
import CodingChallenge from "./codingChallenge/pages/CodingChallenge";
import OnlineIDE from "./codingChallenge/pages/OnlineIDE";
import ResumeBuilder from "./resumeBuilder/pages/ResumeBuilder";
import UserResume from "./resumeBuilder/pages/UserResume";

// --- Auth & Security ---
import RoleProtectedRoute from "./auth/RoleProtectedRoute";
import TestConnectionToBE from "./components/test/TestConectionToBE";

// --- Content Moderator (Fixed Imports) ---
import ContentModeratorLayout from "./forumModerator/components/ContentModeratorLayout"; 
import PendingPosts from "./forumModerator/pages/PendingPosts"; 
import ReportedPosts from "./forumModerator/pages/ReportedPosts"; 
import ManageCategory from "./forumModerator/pages/ManageCategory"; 
import BannedUserForum from "./forumModerator/pages/BannedUserForum";

// --- Resource Manager ---
import ManageCodingBank from "./resourceManager/pages/ManageCodingBank";
import ManageProjectBank from "./resourceManager/pages/ManageProjectBank";
import ViewMockProject from "./resourceManager/pages/ViewMockProject";
import CreateMockProject from "./resourceManager/pages/CreateMockProject";
import EditMockProject from "./resourceManager/pages/EditMockProject";
import EditProjectProcesses from "./resourceManager/pages/EditProjectProcesses";
import ProjectSubmissionReview from "./resourceManager/pages/ProjectSubmissionReview";

import ViewCodingPractice from "./resourceManager/pages/ViewCodingPractice";
import EditCodingPractice from "./resourceManager/pages/EditCodingPractice";
import CreateCodingPractice from "./resourceManager/pages/CreateCodingPractice";

import ManageInterviews from "./resourceManager/pages/ManageInterviews";
import ManagePrompts from "./resourceManager/pages/ManagePrompts";
import CreatePrompt from "./resourceManager/pages/CreatePrompt";
import PromptDetail from "./resourceManager/pages/PromptDetail";
import EditPrompt from "./resourceManager/pages/EditPrompt";
import PromptAnalytics from "./resourceManager/pages/PromptAnalytics";
import PromptAuditTrail from "./resourceManager/pages/PromptAuditTrail";
import CreateNewPrompt from "./resourceManager/pages/CreateNewPrompt";

// --- User Project Logic ---
import MockProjects from "./mockProject/pages/MockProjects";
import ProjectDetailPage from './mockProject/pages/ProjectDetailPage';
import InterviewPage from "./interview/pages/InterviewPage";
import { InterviewProvider } from "./interview/context/InterviewContext";

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/post/:id" element={<PostDetail />} />
          <Route path="/codingChallenge" element={<CodingChallenge />} />
          <Route path="/codingChallenge/online-ide" element={<OnlineIDE />} />

          {/* User Protected Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={["User", "Resource Manager", "Content Moderator", "Admin"]} />}>
            <Route path="/mock-projects" element={<MockProjects />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/forum/user-posts" element={<UserPostStorage />} />
            <Route path="/forum/my-posts/edit/:postId" element={<EditPostForForum />} />
            <Route path="/resume-builder" element={<UserResume />} />
            <Route path="/resume/edit/:id" element={<ResumeBuilder />} />
            <Route path="/mock-projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/interview" element={
                <InterviewProvider>
                  <InterviewPage />
                </InterviewProvider>
              } />
          </Route>

          {/* --- CONTENT MODERATOR ROUTES (Updated) --- */}
          <Route element={<RoleProtectedRoute allowedRoles={["Content Moderator", "Admin"]} />}>
            <Route path="/content-moderator" element={<ContentModeratorLayout />}>
              <Route index element={<ManageCategory />} />
              <Route path="pending" element={<PendingPosts />} />
              <Route path="reported" element={<ReportedPosts />} />
              <Route path="manage-categories" element={<ManageCategory />} />
              <Route path="banned-users" element={<BannedUserForum />} />
            </Route>
          </Route>

          {/* --- RESOURCE MANAGER ROUTES --- */}
          <Route element={<RoleProtectedRoute allowedRoles={["Resource Manager", "Admin"]} />}>
            
            <Route path="/manage-interviews" element={<ManageInterviews />} />

            <Route path="/manage-coding-bank" element={<ManageCodingBank />} />
            <Route path="/manage-coding-bank/create" element={<CreateCodingPractice />} />
            <Route path="/manage-coding-bank/edit/:id" element={<EditCodingPractice />} />
            <Route path="/manage-coding-bank/view/:id" element={<ViewCodingPractice />} />

            <Route path="/manage-prompts" element={<ManagePrompts />} />
            <Route path="/manage-prompts/create" element={<CreateNewPrompt />} />
            <Route path="/manage-prompts/:prompt_name" element={<PromptDetail />} />
            <Route path="/manage-prompts/edit/:prompt_name/:version" element={<EditPrompt />} />
            <Route path="/manage-prompts/create/:prompt_name/:from_version" element={<CreatePrompt />} />
            <Route path="/manage-prompts/analytics/:prompt_name" element={<PromptAnalytics />} />
            <Route path="/manage-prompts/audit/:prompt_name" element={<PromptAuditTrail />} />

            <Route path="/manage-project-bank" element={<ManageProjectBank />} />
            <Route path="/manage-project-bank/view/:id" element={<ViewMockProject />} />
            <Route path="/manage-project-bank/create" element={<CreateMockProject />} />
            <Route path="/manage-project-bank/edit/:id" element={<EditMockProject />} />
            <Route path="/manage-project-bank/edit/:id/processes" element={<EditProjectProcesses />} />
            <Route path="/project/:projectId/submissions" element={<ProjectSubmissionReview />} />
          </Route>

          {/* Debug */}
          <Route path="/test-backend-connection" element={<TestConnectionToBE />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;