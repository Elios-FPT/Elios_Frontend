// file: elios_FE/src/codingChallenge/pages/OnlineIDE.jsx
import React, { useState } from "react";
import axios from "axios";
import { Container } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import Split from "react-split";
import { FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown } from "react-icons/fa";

import CodeIDE from "../components/CodeIDE";
import ProblemDescription from "../components/ProblemDescription";
import CodeOutput from "../components/CodeOutput";

import { API_ENDPOINTS } from "../../api/apiConfig";
import "../style/OnlineIDE.css";

const OnlineIDE = () => {
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get("id");

  // State for horizontal split [Problem, Right Section]
  const [mainSizes, setMainSizes] = useState([30, 70]);
  const [lastProblemSize, setLastProblemSize] = useState(30);

  // State for vertical split [Code Editor, Output]
  const [verticalSizes, setVerticalSizes] = useState([65, 35]);
  const [lastEditorSize, setLastEditorSize] = useState(65);

  // Toggle for the left problem panel
  const toggleProblemPanel = () => {
    if (mainSizes[0] > 0) {
      setLastProblemSize(mainSizes[0]); // Save current size
      setMainSizes([0, 100]); // Collapse
    } else {
      setMainSizes([lastProblemSize, 100 - lastProblemSize]); // Restore
    }
  };

  // Toggle for the top code editor panel
  const toggleEditorPanel = () => {
    if (verticalSizes[0] > 0) {
        setLastEditorSize(verticalSizes[0]); // Save current size
        setVerticalSizes([0, 100]); // Collapse
    } else {
        setVerticalSizes([lastEditorSize, 100 - lastEditorSize]); // Restore
    }
  };

  // Update sizes on drag
  const handleHorizontalDrag = (newSizes) => {
    setMainSizes(newSizes);
    if (newSizes[0] > 0) {
      setLastProblemSize(newSizes[0]);
    }
  };

  const handleVerticalDrag = (newSizes) => {
    setVerticalSizes(newSizes);
    if (newSizes[0] > 0) {
      setLastEditorSize(newSizes[0]);
    }
  };

  const handleRun = async (code, language) => {
    setIsLoading(true);
    setError("");
    setOutput("");
    try {
      const payload = { code, language };
      const response = await axios.post(
        API_ENDPOINTS.SUBMIT_CODE_SOLUTION(problemId),
        payload,
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      const resultData = response.data.data || response.data;
      const { summary, evaluationResults } = resultData;
      let displayText = `🏁 Status: ${summary?.overallStatus || "UNKNOWN"}\n`;
      displayText += `✅ Passed: ${summary?.passedTestCases || 0}/${summary?.totalTestCases || 0}\n`;
      if (evaluationResults?.length) {
        displayText += "\n🧪 Test Results:\n";
        evaluationResults.forEach((res, idx) => {
          displayText += `#${idx + 1} - ${res.status}\n`;
          if (res.actualOutput) displayText += `   Output: ${res.actualOutput}\n`;
          if (res.errorMessage) displayText += `   Error: ${res.errorMessage}\n`;
        });
      }
      setOutput(displayText.trim());
    } catch (err) {
      console.error("❌ Error running code:", err);
      setError(err.response?.data?.message || "❌ Error submitting code");
    } finally {
      setIsLoading(false);
    }
  };

  const isProblemCollapsed = mainSizes[0] === 0;
  const isEditorCollapsed = verticalSizes[0] === 0;

  return (
    <Container fluid id="online-ide-container">
      <Split
        sizes={mainSizes}
        minSize={0}
        gutterSize={8}
        direction="horizontal"
        id="split-wrapper"
        onDrag={handleHorizontalDrag}
      >
        {/* Problem Panel (Left) */}
        <div id="problem-panel">
          <button id="problem-toggle-btn" onClick={toggleProblemPanel} title={isProblemCollapsed ? "Show Problem" : "Hide Problem"}>
            {isProblemCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
          {!isProblemCollapsed && (
            <div id="problem-panel-content">
              <ProblemDescription problemId={problemId} />
            </div>
          )}
        </div>

        {/* Right Section */}
        <div id="right-section">
          <Split
            sizes={verticalSizes}
            minSize={0}
            gutterSize={8}
            direction="vertical"
            className="split-vertical"
            onDrag={handleVerticalDrag}
          >
            {/* Code Editor Panel (Top) */}
            <div id="code-editor-wrapper">
              {/* <button id="editor-toggle-btn" onClick={toggleEditorPanel} title={isEditorCollapsed ? "Show Editor" : "Hide Editor"}>
                  {isEditorCollapsed ? <FaChevronDown /> : <FaChevronUp />}
              </button> */}
              {!isEditorCollapsed && <CodeIDE onRun={handleRun} />}
            </div>

            {/* Output Panel (Bottom) */}
            <div id="code-output-wrapper">
              <CodeOutput output={output} error={error} isLoading={isLoading} />
            </div>
          </Split>
        </div>
      </Split>
    </Container>
  );
};

export default OnlineIDE;