// file: elios_FE/src/codingChallenge/components/CodeOutput.jsx
import React from "react";

const CodeOutput = ({ output, error, isLoading }) => {
  return (
    <div
      style={{
        background: "#0d0d0d",
        color: "#0f0",
        padding: "10px",
        height: "50vh",
        borderTop: "1px solid #333",
        overflowY: "auto",
        fontFamily: "monospace",
      }}
    >
      <h5 style={{ color: "#50fa7b", marginBottom: "5px" }}>Output:</h5>
      {isLoading && <pre>⏳ Running your code...</pre>}
      {error && <pre style={{ color: "red" }}>❌ {error}</pre>}
      {!isLoading && !error && <pre>{output}</pre>}
    </div>
  );
};

export default CodeOutput;
