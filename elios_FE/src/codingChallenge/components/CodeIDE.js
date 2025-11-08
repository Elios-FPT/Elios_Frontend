// file: elios_FE/src/codingChallenge/components/CodeIDE.js
import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import "../style/CodeIDE.css";

// Accept the new 'onSubmit' prop
const CodeIDE = ({ onRun, onSubmit }) => {
  const [language, setLanguage] = useState("JAVA");
  const [code, setCode] = useState("// Write your code here...");

  const handleRun = () => {
    onRun(code, language); // send code & language to backend
  };

  // --- NEW: Handler for the submit button ---
  const handleSubmitClick = () => {
    // Call the new prop
    onSubmit(code, language); 
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
          <option value="JAVA">Java</option>
          <option value="JAVASCRIPT">JavaScript</option>
          <option value="CSHARP">C#</option>
        </select>

        {/* --- NEW: Button group wrapper --- */}
        <div className="button-group">
          <button onClick={handleRun} className="run-btn">
            ▶ Run
          </button>
          
          {/* --- NEW: Submit button --- */}
          <button onClick={handleSubmitClick} className="submit-btn">
            Submit
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <Editor
        height="80vh"
        theme="vs-dark"
        language={language}
        value={code}
        onChange={(value) => setCode(value || "")}
        onMount={(editor) => {
          editor.onKeyDown((event) => {
            // Fix space key blocked by parent CSS or listeners
            if (event.code === "Space" && !event.ctrlKey && !event.metaKey) {
              event.preventDefault();
              editor.trigger("keyboard", "type", { text: " " });
            }
          });
        }}
        options={{
          fontSize: 13,
          minimap: { enabled: true },
          automaticLayout: true,
          suggestOnTriggerCharacters: true,
          wordWrap: "on",
          formatOnType: false,
          autoClosingBrackets: "always",
        }}
      />
    </div>
  );
};

export default CodeIDE;