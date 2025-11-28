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

import ManageForum from "./moderator/pages/ManageForum";

import InterviewPage from "./interview/pages/InterviewPage";
import { InterviewProvider } from "./interview/context/InterviewContext";

import Footer from "./components/footers/Footer";

import { Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
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
            <Route path="/interview" element=
              {
                <InterviewProvider>
                  <InterviewPage />
                </InterviewProvider>
              } />
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

          {/* Content Moderator Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={["Content Moderator"]} />}>
            <Route path="/manage-forum" element={<ManageForum />} />
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