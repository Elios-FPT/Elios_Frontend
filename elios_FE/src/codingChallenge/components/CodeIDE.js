// file: elios_FE/src/codingChallenge/components/CodeIDE.js
import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import "../style/CodeIDE.css";

const CodeIDE = ({ onRun, onSubmit }) => {
  const [language, setLanguage] = useState("JAVA");
  const [code, setCode] = useState("// Write your code here...");

  const languageMap = {
    JAVA: "java",
    JAVASCRIPT: "javascript",
    CSHARP: "csharp",
  };

  const handleRun = () => {
    onRun(code, language);
  };

  const handleSubmitClick = () => {
    onSubmit(code, language);
  };

  return (
    <div className="ide-wrapper">
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

        <div className="button-group">
          <button onClick={handleRun} className="run-btn">
            ▶ Run
          </button>

          <button onClick={handleSubmitClick} className="submit-btn">
            Submit
          </button>
        </div>
      </div>

      <Editor
        height="80vh"
        theme="vs-dark"
        language={languageMap[language]}
        value={code}
        onChange={(value) => setCode(value || "")}
        onMount={(editor) => {
          editor.onKeyDown((event) => {
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
          wordWrap: "on",
          autoClosingBrackets: "always",
        }}
      />
    </div>
  );
};

export default CodeIDE;


