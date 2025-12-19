// file: elios_FE/src/codingChallenge/components/CodeIDE.js
import React, { useState, useEffect } from "react";
import { FaTerminal, FaSave } from "react-icons/fa";
import Editor from "@monaco-editor/react";
import "../style/CodeIDE.css";

const CodeIDE = ({ onRun, onSubmit, onCodeChange, templates }) => {
  const [language, setLanguage] = useState("JAVA");
  const [code, setCode] = useState("// Write your code here...");

  const languageMap = {
    JAVA: "java",
    JAVASCRIPT: "javascript",
    CSHARP: "csharp",
  };

  // Update code when templates load
  useEffect(() => {
    // Only update if code is the default or empty to prevent overwriting user work on re-renders
    if (templates && templates[language] && (code === "// Write your code here..." || !code)) {
      setCode(templates[language]);
      // Sync with parent immediately on template load
      if (onCodeChange) onCodeChange(templates[language], language);
    }
  }, [templates, language]); // logic adjusted slightly to be safer

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    
    // Switch template if available
    const newCode = templates && templates[newLang] ? templates[newLang] : "// Write your code here...";
    setCode(newCode);

    // CRITICAL FIX: Notify parent of language change
    if (onCodeChange) {
      onCodeChange(newCode, newLang);
    }
  };

  const handleRun = () => {
    onRun(code, language);
  };

  const handleSubmitClick = () => {
    onSubmit(code, language);
  };

  const handleEditorChange = (value) => {
    setCode(value || "");
    // CRITICAL FIX: Pass value and language to parent
    if (onCodeChange) {
      onCodeChange(value, language);
    }
  };

  return (
    <div id="codeIDE-wrapper">
      <div id="codeIDE-toolbar">
        <select
          value={language}
          onChange={handleLanguageChange} /* Updated handler */
          id="codeIDE-lang-select"
        >
          <option value="JAVA">Java</option>
          <option value="CSHARP">C#</option>
          {/* Added Javascript option since mapped in languageMap */}
          <option value="JAVASCRIPT">JavaScript</option> 
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