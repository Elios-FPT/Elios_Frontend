// file: elios_FE/src/codingChallenge/components/ProblemDescription.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "../style/ProblemDescription.css";

const ProblemDescription = ({ problemId }) => {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!problemId) return;

    const fetchProblem = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          API_ENDPOINTS.GET_CODE_CHALLENGE_DETAIL(problemId),
          { withCredentials: true }
        );

        // Handle API structure — adjust if your backend wraps in { data: { content: {...} } }
        const data =
          response.data?.data?.content || response.data?.data || response.data;
        setProblem(data);
      } catch (err) {
        console.error("Error fetching problem:", err);
        setError("⚠️ Failed to load problem details");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  if (loading) return <div style={{ color: "#ccc" }}>Loading problem...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!problem) return null;

  return (
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

      {/* Markdown-rendered description */}
      <ReactMarkdown
        children={problem.description}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ inline, className, children, ...props }) {
            return !inline ? (
              <pre
                style={{
                  background: "#1e1e1e",
                  padding: "10px",
                  borderRadius: "5px",
                  overflowX: "auto",
                }}
              >
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code
                style={{
                  background: "#1e1e1e",
                  padding: "2px 4px",
                  borderRadius: "3px",
                  color: "#ffb86c",
                }}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      />

      {/* Optional example section */}
      {problem.exampleInput && problem.exampleOutput && (
        <pre
          style={{
            background: "#1e1e1e",
            padding: "10px",
            borderRadius: "5px",
            marginTop: "15px",
          }}
        >
          {`Input: ${problem.exampleInput}\nOutput: ${problem.exampleOutput}`}
        </pre>
      )}
    </div>
  );
};

export default ProblemDescription;
