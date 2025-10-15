// file: elios_FE/src/codingChallenge/components/CodeIDE.jsx
import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import "../style/CodeIDE.css";

const CodeIDE = ({ onRun }) => {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Write your code here...");

  const handleRun = () => {
    onRun(code, language); // send code & language to backend
  };

  return (
    <div className="ide-wrapper">
      {/* Toolbar */}
      <div className="toolbar">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="lang-select"
        >
          <option value="javascript">JavaScript</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
        </select>

        <button onClick={handleRun} className="run-btn">
          ▶ Run
        </button>
      </div>

      {/* Code Editor */}
      <Editor
        height="80vh"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          automaticLayout: true,
          suggestOnTriggerCharacters: true,
          wordWrap: "on",
          formatOnType: true,
          autoClosingBrackets: "always",
        }}
      />
    </div>
  );
};

export default CodeIDE;
