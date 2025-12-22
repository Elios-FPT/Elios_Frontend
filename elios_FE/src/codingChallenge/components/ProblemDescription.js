// file: elios_FE/src/codingChallenge/components/ProblemDescription.js
import React, { useState } from "react";
import DescriptionView from "./DescriptionView"; 
import SubmissionsView from "./SubmissionsView"; 
import SolutionView from "./SolutionView";
import FeedbackView from "./FeedbackView"; 
import "../style/ProblemDescription.css"; 

const ProblemDescription = ({ problemId, problemData, loading, error, currentCode, currentLanguage }) => {
  const [activeTab, setActiveTab] = useState("description");

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
        {activeTab === "submissions" && <SubmissionsView problemId={problemId} />}
        {activeTab === "solution" && <SolutionView problemId={problemId} />}
        
        {activeTab === "feedback" && (
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