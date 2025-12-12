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
    const [title, setTitle] = useState("Giải pháp của tôi"); // Translated
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
            setSubmitError("Chia sẻ giải pháp thất bại. Vui lòng thử lại."); // Translated
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
                    <h3 id="share-solution-modal-title">Chia sẻ giải pháp của bạn</h3> {/* Translated */}
                    <button id="share-solution-modal-close-button" onClick={onClose}>✕</button>
                </div>

                <form id="share-solution-form" onSubmit={handleShareSolution}>
                    <div id="share-solution-form-group">
                        <label htmlFor="solution-title">Tiêu đề</label> {/* Translated */}
                        <input
                            type="text"
                            id="solution-title-input" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Toolbar */}
                    <div id="solution-toolbar">
                        <div className="icon-toolbar-wrapper">
                            <button type="button" onClick={() => applyFormat("bold")} title="In đậm"><FaBold /></button> {/* Translated */}
                        </div>
                        <div className="icon-toolbar-wrapper">
                            <button type="button" onClick={() => applyFormat("italic")} title="In nghiêng"><FaItalic /></button> {/* Translated */}
                        </div>
                    </div>

                    <div id="share-solution-form-group">
                        <label htmlFor="solution-editor">Nội dung</label> {/* Translated */}
                        {/* Rich text editor adapted from CreatePostModal */}
                        <div
                            ref={editorRef}
                            id="solution-editor"
                            contentEditable
                            suppressContentEditableWarning
                            placeholder="Viết giải thích và mã nguồn của bạn tại đây..." // Translated
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
                            Hủy {/* Translated */}
                        </button>
                        <button
                            type="submit"
                            id="share-solution-btn-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Đang chia sẻ..." : "Chia sẻ giải pháp"} {/* Translated */}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditAndShareSolution;