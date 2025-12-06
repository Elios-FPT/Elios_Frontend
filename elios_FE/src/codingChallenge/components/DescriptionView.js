// file: elios_FE/src/codingChallenge/components/DescriptionView.js
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "../style/DescriptionView.css"; 

const DescriptionView = ({ problem, loading, error }) => {
  // Logic moved to parent (OnlineIDE.js) to share data with Editor

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