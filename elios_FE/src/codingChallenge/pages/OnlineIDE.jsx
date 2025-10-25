// file: elios_FE/src/codingChallenge/pages/OnlineIDE.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
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


  // Run / submit code
  const handleRun = async (code, language) => {
    setIsLoading(true);
    setError("");
    setOutput("");

    try {
      const payload = { code, language };
      console.log("🛰️ Sending code submission payload:", payload);

      const response = await axios.post(
        API_ENDPOINTS.SUBMIT_CODE_SOLUTION(problemId),
        payload,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      const resultData = response.data.data || response.data;
      const { summary, evaluationResults } = resultData;

      let displayText = `🏁 Status: ${summary?.overallStatus || "UNKNOWN"}\n`;
      displayText += `✅ Passed: ${summary?.passedTestCases || 0}/${summary?.totalTestCases || 0}\n`;

      if (evaluationResults && evaluationResults.length > 0) {
        displayText += "\n🧪 Test Results:\n";
        evaluationResults.forEach((res, index) => {
          displayText += `#${index + 1} - ${res.status}\n`;
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



 return (
  <div style={{ display: "flex", height: "100vh", background: "#1e1e1e" }}>
    {/* Pass the problemId so it can fetch its own data */}
    <ProblemDescription problemId={problemId} />

    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <CodeIDE onRun={handleRun} />
      <CodeOutput output={output} error={error} isLoading={isLoading} />
    </div>
  </div>
);
};

export default OnlineIDE;
