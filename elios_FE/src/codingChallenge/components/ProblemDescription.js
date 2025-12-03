// file: elios_FE/src/codingChallenge/components/ProblemDescription.jsx
import React, { useState } from "react";
import DescriptionView from "./DescriptionView"; 
import SubmissionsView from "./SubmissionsView"; 
import SolutionView from "./SolutionView";
import "../style/ProblemDescription.css"; 

const ProblemDescription = ({ problemId, problemData, loading, error }) => {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div id="problem-description-container">
      {/* Tab Navigation */}
      <div id="tabs-container">
        <button
          id={activeTab === "description" ? "tab-button-active" : "tab-button"}
          onClick={() => setActiveTab("description")}
        >
          Description
        </button>
        <button
          id={activeTab === "submissions" ? "tab-button-active" : "tab-button"}
          onClick={() => setActiveTab("submissions")}
        >
          Submissions
        </button>
        <button
          id={activeTab === "solution" ? "tab-button-active" : "tab-button"}
          onClick={() => setActiveTab("solution")}
        >
          Solution
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
      </div>
    </div>
  );
};

export default ProblemDescription;