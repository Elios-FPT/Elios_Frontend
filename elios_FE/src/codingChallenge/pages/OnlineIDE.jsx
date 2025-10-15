// file: elios_FE/src/codingChallenge/pages/OnlineIDE.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CodeIDE from "../components/CodeIDE";
import problemsData from "../data/problems.json";

export default function OnlineIDE() {
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [problem, setProblem] = useState(null);

  const [searchParams] = useSearchParams();
  const problemId = searchParams.get("id");

  useEffect(() => {
    const found = problemsData.find((p) => p.id.toString() === problemId);
    setProblem(found || null);
  }, [problemId]);

  const handleRun = async (code, language) => {
    setIsLoading(true);
    setError("");
    setOutput("");

    try {
      const response = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });

      if (!response.ok) throw new Error("Server error while running code");

      const data = await response.json();
      setOutput(data.output || "No output");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  if (!problem) {
    return (
      <div style={{ color: "white", padding: "40px", background: "#1e1e1e" }}>
        <h2>Problem not found ⚠️</h2>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#1e1e1e" }}>
      {/* 🧾 Left: Problem description */}
      <div
        style={{
          width: "35%",
          background: "#252526",
          color: "#ccc",
          padding: "20px",
          overflowY: "auto",
          borderRight: "1px solid #333",
        }}
      >
        <h2 style={{ color: "#50fa7b" }}>{problem.title}</h2>
        <p>{problem.description}</p>

        <pre style={{ background: "#1e1e1e", padding: "10px" }}>
          {`Input: ${problem.exampleInput}
Output: ${problem.exampleOutput}`}
        </pre>
      </div>

      {/* 💻 Right: IDE + Output */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <CodeIDE onRun={handleRun} />

        <div
          style={{
            background: "#0d0d0d",
            color: "#0f0",
            padding: "10px",
            height: "20vh",
            borderTop: "1px solid #333",
            overflowY: "auto",
            fontFamily: "monospace",
          }}
        >
          <h3 style={{ color: "#50fa7b", marginBottom: "5px" }}>Output:</h3>
          {isLoading && <pre>⏳ Running your code...</pre>}
          {error && <pre style={{ color: "red" }}>❌ {error}</pre>}
          {!isLoading && !error && <pre>{output}</pre>}
        </div>
      </div>
    </div>
  );
}
