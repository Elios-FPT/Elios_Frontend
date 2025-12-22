// file: elios_FE/src/codingChallenge/components/ProblemDescription.js
import React, { useState, useEffect } from "react";
import DescriptionView from "./DescriptionView"; 
import SubmissionsView from "./SubmissionsView"; 
import SolutionView from "./SolutionView";
import FeedbackView from "./FeedbackView"; 
import "../style/ProblemDescription.css"; 
import { useUserProfile } from "../../hooks/useUserProfile"; // Import the auth hook

const ProblemDescription = ({ problemId, problemData, loading, error, currentCode, currentLanguage }) => {
  const [activeTab, setActiveTab] = useState("description");
  const { user } = useUserProfile(); // Get current user status

  // Safety: If user logs out (or is not logged in) while on a restricted tab, switch back to description
  useEffect(() => {
    if (!user && activeTab !== "description") {
      setActiveTab("description");
    }
  }, [user, activeTab]);

  return (
    <div id="problem-description-container">
      {/* Tab Navigation */}
      <div id="tabs-container">
        <button
          id={activeTab === "description" ? "tab-button-active" : "tab-button"}
          onClick={() => setActiveTab("description")}
        >
          Mô tả {/* Translated */}
        </button>

        {/* Only show these tabs if the user is logged in */}
        {user && (
          <>
            <button
              id={activeTab === "submissions" ? "tab-button-active" : "tab-button"}
              onClick={() => setActiveTab("submissions")}
            >
              Bài nộp {/* Translated */}
            </button>
            <button
              id={activeTab === "solution" ? "tab-button-active" : "tab-button"}
              onClick={() => setActiveTab("solution")}
            >
              Giải pháp {/* Translated */}
            </button>
            <button
              id={activeTab === "feedback" ? "tab-button-active" : "tab-button"}
              onClick={() => setActiveTab("feedback")}
            >
              Phản hồi AI
            </button>
          </>
        )}
      </div>

      {/* Tab Content */}
      <div id="tab-content">
        {activeTab === "description" && (
            <DescriptionView 
                problem={problemData} 
                loading={loading} 
                error={error} 
            />
        )}
        
        {/* Render restricted views only if user is logged in */}
        {user && activeTab === "submissions" && <SubmissionsView problemId={problemId} />}
        {user && activeTab === "solution" && <SolutionView problemId={problemId} />}
        
        {user && activeTab === "feedback" && (
            <FeedbackView 
                problemId={problemId}
                currentCode={currentCode}
                currentLanguage={currentLanguage}
                problemDescription={problemData?.description || ""} 
            />
        )}
      </div>
    </div>
  );
};

export default ProblemDescription;