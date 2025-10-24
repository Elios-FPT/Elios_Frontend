// file: elios_FE/src/forum/components/CreatePostModal.js
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { FaBold, FaItalic, FaCode, FaFileCode, FaImage } from "react-icons/fa";
import TurndownService from "turndown";
import "../style/CreatePostModal.css";
import { API_ENDPOINTS } from "../../api/apiConfig";

const turndownService = new TurndownService();

const CreatePostModal = ({ show, handleClose }) => {
  const editorRef = useRef(null);
  const inputRef = useRef(null); // Ref for the hidden file input
  const [title, setTitle] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false); // State for drag-over effect

  // Hardcoded values
  const CATEGORY_ID = "3fa85f64-5717-4562-b3fc-2c963f66afa6";
  const POST_TYPE = "normal";

  const applyFormat = (command) => {
    document.execCommand(command, false, null);
  };

  // Handles files from both drop and file input
  const handleFilesAdded = (newFiles) => {
    const validImageFiles = Array.from(newFiles).filter(file => file.type.startsWith("image/"));
    if (validImageFiles.length === 0) return;

    setImages(prevImages => [...prevImages, ...validImageFiles]);

    const newPreviews = validImageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  const handleDeleteImage = (indexToRemove) => {
    URL.revokeObjectURL(imagePreviews[indexToRemove]);
    setImages(images.filter((_, index) => index !== indexToRemove));
    setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length) {
      handleFilesAdded(droppedFiles);
    }
  };

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(fileUrl => URL.revokeObjectURL(fileUrl));
    };
  }, [imagePreviews]);

  const handleSubmit = async () => {
    const htmlContent = editorRef.current.innerHTML;
    const markdown = turndownService.turndown(htmlContent);

    const formData = new FormData();
    formData.append("CategoryId", CATEGORY_ID);
    formData.append("Title", title);
    formData.append("Content", markdown);
    formData.append("PostType", POST_TYPE);
    images.forEach((file) => formData.append("files", file));

    try {
      const res = await axios.post(API_ENDPOINTS.CREATE_POST, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      console.log("✅ Post created successfully:", res.data);
      handleClose();
    } catch (err) {
      console.error("❌ Failed to create post:", err);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName="create-post-modal">
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
          <button onClick={() => applyFormat("bold")} title="Bold"><FaBold /></button>
          <button onClick={() => applyFormat("italic")} title="Italic"><FaItalic /></button>
          <button onClick={() => applyFormat("insertHTML", "<code></code>")} title="Inline Code"><FaCode /></button>
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

        {/* Rich text editor */}
        <div
          ref={editorRef}
          className="createpost-editor"
          contentEditable
          suppressContentEditableWarning
          placeholder="Write your post..."
        ></div>

        {/* Hidden File Input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="createpost-file-input"
          onChange={(e) => handleFilesAdded(e.target.files)}
          style={{ display: 'none' }} // Hide the default input
        />

        {/* Drop Zone */}
        <div
          className={`drop-zone ${isDragging ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()} // Make the whole zone clickable
        >
          <div className="drop-zone-prompt">
            <FaImage size={30} />
            <p>
              <b>Drag & drop images here</b> or click to browse.
            </p>
          </div>
        </div>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="image-preview-container">
            {imagePreviews.map((previewUrl, idx) => (
              <div key={idx} className="image-preview-item">
                <img src={previewUrl} alt={`preview ${idx}`} className="preview-image" />
                <button
                  onClick={() => handleDeleteImage(idx)}
                  className="delete-image-btn"
                  title="Remove image"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button className="create-post-modal-cancel-button" onClick={handleClose}>Cancel</button>
        <button className="create-post-modal-create-button" onClick={handleSubmit}>Post</button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreatePostModal;