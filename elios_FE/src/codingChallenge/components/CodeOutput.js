// file: elios_FE/src/codingChallenge/components/CodeOutput.jsx
import React from "react";
import "../style/CodeOutput.css";

const CodeOutput = ({ output, error, isLoading, testResults }) => {
  return (
    <div id="code-output-container">
      <h5 id="code-output-title">Output:</h5>

      {isLoading && <pre id="code-output-loading"> Running your code...</pre>}
      {error && <pre id="code-output-error">❌ {error}</pre>}
      
      {!isLoading && !error && testResults && (
        <>
          <p id="output-status-message">
            Overall Status:{" "}
            <span
              className={
                testResults.summary.overallStatus === "PASSED"
                  ? "status-passed"
                  : "status-failed"
              }
            >
              {testResults.summary.overallStatus}
            </span>
          </p>
          <table id="output-results-table">
            <thead>
              <tr>
                <th>Test Case</th>
                {/* <th>Expected</th> */}
                <th>Actual</th>
                <th>Status</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {testResults.evaluationResults.map((result, index) => (
                <tr key={index}>
                  <td>{result.input || `Case ${index + 1}`}</td>
                  {/* Removed expectedOutput to match the 4 headers defined above */}
                  <td>{result.actualOutput}</td>
                  <td
                    className={
                      result.status === "PASSED"
                        ? "status-passed"
                        : "status-failed"
                    }
                  >
                    {result.status}
                  </td>
                  <td>{result.errorMessage || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <pre id="code-output-result">{output}</pre>
        </>
      )}

      {!isLoading && !error && !testResults && (
        <pre id="code-output-result">{output}</pre>
      )}
    </div>
  );
};

export default CodeOutput;