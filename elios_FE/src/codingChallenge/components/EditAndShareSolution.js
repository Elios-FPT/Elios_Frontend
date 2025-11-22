// file: elios_FE/src/codingChallenge/components/EditAndShareSolution.js
import React, { useState, useEffect, useRef } from "react";
import "../style/EditAndShareSolution.css";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";
import { FaBold, FaItalic, FaCode, FaFileCode } from "react-icons/fa"; // Import icons
import TurndownService from "turndown"; // Import Turndown

const turndownService = new TurndownService();

// Note: This CATEGORY_ID is hardcoded, similar to EditPostForForum.js.
// This might need to be a different ID for "Solutions".
const CATEGORY_ID = "8cf071b9-ea2e-4a19-865e-28ec04a26ba7";
const POST_TYPE = "Solution"; 

const EditAndShareSolution = ({ isOpen, onClose, submissionData, problemId }) => {

    // Initial content includes the submission code inside a markdown code block structure
    const initialContent = `<pre><code>${submissionData}</code></pre>`;

    const editorRef = useRef(null);
    const [title, setTitle] = useState("My Solution");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Set initial content in the editor once the modal opens
    useEffect(() => {
        if (isOpen && editorRef.current && submissionData) {
            editorRef.current.innerHTML = initialContent;
        }
    }, [isOpen, submissionData]);


    const applyFormat = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current.focus();
    };


    const handleShareSolution = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        // Convert editor HTML content to Markdown
        const htmlContent = editorRef.current.innerHTML;
        const markdown = turndownService.turndown(htmlContent);

        const postData = {
            categoryId: CATEGORY_ID,
            title: title,
            content: markdown, 
            postType: POST_TYPE,
            referenceId: problemId, 
            tags: [], 
            submitForReview: true
        };

        try {
            const response = await axios.post(API_ENDPOINTS.CREATE_POST, postData, {
                withCredentials: true,
            });

            console.log("Solution shared successfully:", response.data);
            onClose(); // Close the modal on success

        } catch (error) {
            console.error("Error sharing solution:", error.response || error);
            setSubmitError("Failed to share solution. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div id="share-solution-modal-overlay">
            <div id="share-solution-modal-content">
                <div id="share-solution-modal-header">
                    <h3 id="share-solution-modal-title">Share Your Solution</h3>
                    <button id="share-solution-modal-close-button" onClick={onClose}>✕</button>
                </div>
                
                <form id="share-solution-form" onSubmit={handleShareSolution}>
                    <div id="share-solution-form-group">
                        <label htmlFor="solution-title">Title</label>
                        <input
                            type="text"
                            id="solution-title-input" // Changed ID for consistency with CSS style adaptation
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    
                    {/* Toolbar */}
                    <div id="solution-toolbar">
                      <button type="button" onClick={() => applyFormat("bold")} title="Bold"><FaBold /></button>
                      <button type="button" onClick={() => applyFormat("italic")} title="Italic"><FaItalic /></button>
                      <button type="button" onClick={() => applyFormat("insertHTML", "<code></code>")} title="Inline Code"><FaCode /></button>
                      <button
                          type="button"
                          onClick={() => {
                              const selection = window.getSelection();
                              if (!selection.rangeCount) return;
                              const range = selection.getRangeAt(0);
                              const pre = document.createElement("pre");
                              pre.innerHTML = "<code>" + selection.toString() + "</code>";
                              range.deleteContents();
                              range.insertNode(pre);
                          }}
                          title="Code Block"
                      >
                          <FaFileCode />
                      </button>
                    </div>
                    
                    <div id="share-solution-form-group">
                        <label htmlFor="solution-editor">Content</label>
                        {/* Rich text editor adapted from CreatePostModal */}
                        <div 
                          ref={editorRef}
                          id="solution-editor"
                          contentEditable
                          suppressContentEditableWarning
                          placeholder="Write your explanation and code here..."
                        ></div>
                    </div>
                    
                    {submitError && <div id="share-solution-error">{submitError}</div>}
                    
                    <div id="share-solution-modal-actions">
                        <button
                            type="button"
                            id="share-solution-btn-cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            id="share-solution-btn-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Sharing..." : "Share Solution"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditAndShareSolution;