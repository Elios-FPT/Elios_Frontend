// elios_FE/src/forum/components/PostModal.js
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
//import "../style/PostModal.css";
import { formatRelativeTime } from "../utils/formatTime";

const PostModal = ({ show, handleClose, post }) => {
  if (!post) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <div className="d-flex align-items-center">
          <img
            src={post.user.avatar}
            alt="user"
            className="user-forum-forum-avatar me-3"
          />
          <div>
            <h5 className="mb-0 text-white">{post.user.name}</h5>
            <small className="text-muted">{formatRelativeTime(post.time)}</small>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body>
        <h4 className="text-white">{post.title}</h4>

        {/* ✅ Markdown-rendered post content with syntax highlight */}
        <div className="user-forum-markdown-content mt-3">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {post.content}
          </ReactMarkdown>
        </div>


        {post.image && (
          <div className="text-center my-3">
            <img
              src={post.image}
              alt="post"
              className="img-fluid rounded user-forum-forum-img"
            />
          </div>
        )}

        <hr className="text-muted" />
        <h6>Comments</h6>

        {post.comments && post.comments.length > 0 ? (
          post.comments.map((c) => (
            <div key={c.id} className="d-flex align-items-start mb-3">
              <img
                src={c.user.avatar}
                alt="user"
                className="user-forum-comment-avatar me-2"
              />
              <div>
                <strong className="text-white">{c.user.name}</strong>{" "}
                <small className="text-muted">
                  {formatRelativeTime(c.time)}
                </small>
                <p className="mb-0">{c.text}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No comments yet. Be the first to comment!</p>
        )}

        <Form className="mt-4">
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Write a comment..."
              className="user-forum-comment-input"
            />
          </Form.Group>
          <Button variant="primary" size="sm" className="mt-3">
            Post Comment
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default PostModal;
