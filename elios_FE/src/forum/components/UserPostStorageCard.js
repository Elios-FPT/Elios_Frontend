// file: elios_FE/src/forum/components/UserPostStorageCard.js
import React, { useState, useRef } from "react"; // ✅ Added useRef
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";
import {
  FaEye,
  FaCommentAlt,
  FaThumbsUp,
  FaThumbsDown,
  FaEllipsisH,
} from "react-icons/fa";
import "../style/UserPostStorageCard.css";

const UserPostStorageCard = ({ post, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // --- NEW ---
  // Use a ref to store the timer ID
  const hideTimerRef = useRef(null);
  // Set the delay (in milliseconds)
  const HIDE_DELAY = 170; 

  const truncateContent = (content) => {
    if (content.length > 60) {
      return content.slice(0, 60) + "...";
    }
    return content;
  };

  const handleEdit = () => {
    console.log("Editing post:", post.postId);
    navigate(`/forum/my-posts/edit/${post.postId}`);
  };

  const handleSubmit = () => {
    console.log("Submitting post:", post.postId);
    // Add submit logic here
  };

  const handleDelete = async () => {
    console.log("Deleting post:", post.postId);
    try {
      await onDelete(post.postId);
    } catch (error) {
      console.error("Error during delete operation:", error);
    } finally {
      setMenuOpen(false); // Close menu immediately on action
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current); // Clear any pending hide timer
      }
    }
  };

  const handleArchive = () => {
    console.log("Archiving post:", post.postId);
    setMenuOpen(false); // Close menu immediately on action
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current); // Clear any pending hide timer
    }
    // Add archive logic here
  };

  const handleMouseEnter = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, HIDE_DELAY);
  };

  return (
    <div id="user-post-card">
      {/* Top section: Post details */}
      <div id="user-post-card-details">
        <h3 id="user-post-card-title">{post.title}</h3>
        <p id="user-post-card-snippet">{truncateContent(post.content)}</p>
        <div id="user-post-card-stats">
          <span className="user-post-stat-item">
            <FaThumbsUp /> {post.upvoteCount}
          </span>
          <span className="user-post-stat-item">
            <FaThumbsDown /> {post.downvoteCount}
          </span>
          <span className="user-post-stat-item">
            <FaCommentAlt /> {post.commentCount}
          </span>
          <span className="user-post-stat-item">
            <FaEye /> {post.viewsCount}
          </span>
          <span id="user-post-card-status" className={post.status.toLowerCase()}>
            {post.status}
          </span>
        </div>
      </div>

      {/* Bottom section: Controls and buttons */}
      <div id="user-post-card-controls">
        <div id="user-post-card-buttons">
          <button id="user-post-card-btn-edit" onClick={handleEdit}>
            Edit
          </button>
          <button id="user-post-card-btn-submit" onClick={handleSubmit}>
            Submit
          </button>
        </div>

        {/* --- MODIFIED --- */}
        {/* Use the new handlers to manage showing/hiding with a delay */}
        <div
          id="user-post-card-menu-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            id="user-post-card-menu-btn"
          >
            <FaEllipsisH />
          </button>

          {/* Conditionally render the dropdown menu */}
          {menuOpen && (
            <div id="user-post-card-menu-dropdown">
              <button
                className="user-post-card-menu-item"
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                className="user-post-card-menu-item"
                onClick={handleArchive}
              >
                Archive
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPostStorageCard;