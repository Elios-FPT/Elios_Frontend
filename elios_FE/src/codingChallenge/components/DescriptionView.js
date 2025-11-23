// file: elios_FE/src/codingChallenge/components/DescriptionView.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "../style/DescriptionView.css"; 

const DescriptionView = ({ problemId }) => {
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
          API_ENDPOINTS.GET_CODE_PRACTICE_DETAIL(problemId),
          { withCredentials: true }
        );
        const data = response.data?.data || response.data;
        setProblem(data);
      } catch (err) {
        console.error("Error fetching problem:", err);
        setError("⚠️ Failed to load problem details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  if (loading) return <div id="loading-message">Loading problem...</div>;
  if (error) return <div id="error-message">{error}</div>;
  if (!problem) return null;

  return (
    <>
      <h2 id="problem-title">{problem.title}</h2>
      <ReactMarkdown
        children={problem.description}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: ({ inline, className, children, ...props }) =>
            !inline ? (
              <pre className="code-block">
                <code className={className} {...props}>{children}</code>
              </pre>
            ) : (
              <code className="inline-code" {...props}>{children}</code>
            ),
        }}
      />
      {problem.exampleInput && problem.exampleOutput && (
        <pre id="example-block">
          {`Input: ${problem.exampleInput}\nOutput: ${problem.exampleOutput}`}
        </pre>
      )}
    </>
  );
};

export default DescriptionView;