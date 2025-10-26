// file: elios_FE/src/codingChallenge/components/CodeOutput.jsx
import React from "react";
import "../style/CodeOutput.css";

const CodeOutput = ({ output, error, isLoading }) => {
  return (
    <div id="code-output-container">
      <h5 className="code-output-title">Output:</h5>

      {isLoading && <pre className="code-output-loading">⏳ Running your code...</pre>}
      {error && <pre className="code-output-error">❌ {error}</pre>}
      {!isLoading && !error && <pre className="code-output-result">{output}</pre>}
    </div>
  );
};

export default CodeOutput;
