// file: elios_FE/src/codingChallenge/pages/OnlineIDE.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get("id");
  const [testResults, setTestResults] = useState(null);
  const [haveContent, setHaveContent] = useState(false);

  // State for horizontal split [Problem, Right Section]
  const [mainSizes, setMainSizes] = useState([30, 70]);
  const [lastProblemSize, setLastProblemSize] = useState(30);

  // State for vertical split [Code Editor, Output]
  const [verticalSizes, setVerticalSizes] = useState([65, 35]);
  const [lastEditorSize, setLastEditorSize] = useState(65);

  // Handle Browser Refresh / Tab Close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (haveContent) {
        e.preventDefault();
        e.returnValue = "You might lose your current content.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [haveContent]); // Add haveContent as dependency

  // Handle Back Button Click
  const handleBackNavigation = () => {
    if (haveContent) {
      const confirmLeave = window.confirm("You have unsaved content. Are you sure you want to leave?");
      if (confirmLeave) {
        navigate("/codingchallenge");
      }
    } else {
      navigate("/codingchallenge");
    }
  };

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
    setTestResults(null);
    setHaveContent(true); // Mark content as existing when running
    try {
      const payload = { code, language };
      const response = await axios.post(
        API_ENDPOINTS.RUN_CODE_SOLUTION(problemId),
        payload,
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      const resultData = response.data.data || response.data;
      const { summary, evaluationResults } = resultData;

      let displayText = "";
      displayText += "================ RESULT ================\n";
      displayText += `Status    : ${summary?.overallStatus || "UNKNOWN"}\n`;
      displayText += `Passed    : ${summary?.passedTestCases || 0}/${summary?.totalTestCases || 0}\n`;
      displayText += "=======================================\n";

      if (evaluationResults?.length) {
        displayText += "\nTest Case Results\n";
        displayText += "---------------------------------------\n";
        evaluationResults.forEach((res, idx) => {
          displayText += `#${idx + 1}  ${res.status}\n`;
          if (res.input) displayText += `  Input  : ${res.input}\n`;
          //  if (res.expectedOutput) displayText += `  Expected: ${res.expectedOutput}\n`;
          if (res.actualOutput) displayText += `  Output : ${res.actualOutput}\n`;
          if (res.errorMessage) displayText += `  Error  : ${res.errorMessage}\n`;
          displayText += "---------------------------------------\n";
        });
      }
      setTestResults(resultData);
      setOutput(displayText.trim());
    } catch (err) {
      console.error("❌ Error running code:", err);
      setError(err.response?.data?.message || "❌ Error submitting code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (code, language) => {
    setIsLoading(true);
    setError("");
    setOutput("");
    setTestResults(null);
    try {
      const payload = { code, language };
      const response = await axios.post(
        API_ENDPOINTS.SUBMIT_CODE_SOLUTION(problemId),
        payload,
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      const resultData = response.data.data || response.data;
      const { summary, evaluationResults } = resultData;

      let displayText = "";
      displayText += "================ RESULT ================\n";
      displayText += `Status    : ${summary?.overallStatus || "UNKNOWN"}\n`;
      displayText += `Passed    : ${summary?.passedTestCases || 0}/${summary?.totalTestCases || 0}\n`;
      displayText += "=======================================\n";

      if (evaluationResults?.length) {
        displayText += "\nTest Case Results\n";
        displayText += "---------------------------------------\n";
        evaluationResults.forEach((res, idx) => {
          displayText += `#${idx + 1}  ${res.status}\n`;
          if (res.input) displayText += `  Input  : ${res.input}\n`;
          //  if (res.expectedOutput) displayText += `  Expected: ${res.expectedOutput}\n`;
          if (res.actualOutput) displayText += `  Output : ${res.actualOutput}\n`;
          if (res.errorMessage) displayText += `  Error  : ${res.errorMessage}\n`;
          displayText += "---------------------------------------\n";
        });
      }
      setTestResults(resultData);
      setOutput(displayText.trim());
      setHaveContent(false); // Reset content state on successful submission
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
    <>
      <div id="ide-header">
        <button 
          id="back-to-problems-btn" 
          onClick={handleBackNavigation} 
          title="Back to Problems"
        >
          <FaChevronLeft style={{ marginRight: "5px", fontSize: "0.8rem" }} /> Back to Problems
        </button>
      </div>
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
                {!isEditorCollapsed && (
                  <CodeIDE 
                    onRun={handleRun} 
                    onSubmit={handleSubmit} 
                    onCodeChange={() => setHaveContent(true)}
                  />
                )}
              </div>

              {/* Output Panel (Bottom) */}
              <div id="code-output-wrapper">
                <CodeOutput output={output} error={error} isLoading={isLoading} />
              </div>
            </Split>
          </div>
        </Split>
      </Container>
    </>
  );
};

export default OnlineIDE;