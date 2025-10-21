// file: elios_FE/src/forum/components/CreatePostModal.js
import React, { useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { FaBold, FaItalic, FaCode, FaFileCode } from "react-icons/fa";
import TurndownService from "turndown";
import { marked } from "marked";
import "../style/CreatePostModal.css";

const turndownService = new TurndownService();

export default function CreatePostModal({ show, handleClose, onSubmit }) {
  const editorRef = useRef(null);
  const [title, setTitle] = useState("");

  const applyFormat = (command) => {
    document.execCommand(command, false, null);
  };

  const handleSubmit = () => {
    // Get the HTML content from the editor
    const htmlContent = editorRef.current.innerHTML;

    // Convert HTML → Markdown
    const markdown = turndownService.turndown(htmlContent);

    // Send Markdown content to parent
    onSubmit({ title, content: markdown });
    handleClose();
  };

  return (
    // Add the dialogClassName prop here
    <Modal show={show} onHide={handleClose} centered dialogClassName="create-post-modal-dialog">
      <Modal.Header closeButton>
        <Modal.Title>Create New Post</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <input
          className="createpost-title-input"
          type="text"
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Toolbar */}
        <div className="createpost-toolbar">
          <button onClick={() => applyFormat("bold")} title="Bold">
            <FaBold />
          </button>
          <button onClick={() => applyFormat("italic")} title="Italic">
            <FaItalic />
          </button>
          <button onClick={() => applyFormat("insertHTML", "<code></code>")} title="Inline Code">
            <FaCode />
          </button>
          <button
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

        {/* Rich text editor area */}
        <div
          ref={editorRef}
          className="createpost-editor"
          contentEditable
          suppressContentEditableWarning
          placeholder="Write your post..."
        ></div>
      </Modal.Body>

      <Modal.Footer>
        <button className="create-post-modal-cancel-button" onClick={handleClose}>
          Cancel
        </button>
        <button className="create-post-modal-create-button" onClick={handleSubmit}>
          Post
        </button>
      </Modal.Footer>
    </Modal>
  );
}