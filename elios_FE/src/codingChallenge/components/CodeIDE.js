// file: elios_FE/src/codingChallenge/components/CodeIDE.js
import React, { useState } from "react";
import { FaTerminal, FaSave } from "react-icons/fa";
import Editor from "@monaco-editor/react";
import "../style/CodeIDE.css";

const CodeIDE = ({ onRun, onSubmit, onCodeChange }) => {
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

  const handleEditorChange = (value) => {
    setCode(value || "");
    if (onCodeChange) {
      onCodeChange();
    }
  };

  return (
    <div id="codeIDE-wrapper">
      <div id="codeIDE-toolbar">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          id="codeIDE-lang-select"
        >
          <option value="JAVA">Java</option>
          <option value="JAVASCRIPT">JavaScript</option>
          <option value="CSHARP">C#</option>
        </select>

        <div id="codeIDE-button-group">
          <button onClick={handleRun} id="codeIDE-run-btn">
            <FaTerminal style={{ marginLeft: "5px" }} />Run
          </button>

          <button onClick={handleSubmitClick} id="codeIDE-submit-btn">
            <FaSave style={{ marginRight: "5px" }} />Submit
          </button>
        </div>
      </div>

      <Editor
        height="80vh"
        theme="vs-dark"
        language={languageMap[language]}
        value={code}
        onChange={handleEditorChange}
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