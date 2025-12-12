// file: elios_FE/src/forumModerator/components/PostPreviewModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

// Import the same highlight.js CSS used in PostDetail
import 'highlight.js/styles/github-dark.css';
import '../styles/PostPreviewModal.css';

const PostPreviewModal = ({ post, show, onHide }) => {
    if (!post) return null;

    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            size="lg" 
            centered 
            contentClassName="admin-dark-modal"
        >
            <Modal.Header closeButton id="preview-modal-header">
                <Modal.Title>{post.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body id="preview-modal-body">
                <div className="post-meta">
                    <span><strong>Tác giả:</strong> {post.authorFullName}</span> {/* Translated */}
                    <span><strong>Danh mục:</strong> {post.categoryName}</span> {/* Translated */}
                    <span><strong>Loại:</strong> {post.postType}</span> {/* Translated */}
                </div>
                <hr />
                <div className="markdown-content">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeHighlight]}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>
            </Modal.Body>
            <Modal.Footer id="preview-modal-footer">
                <Button variant="secondary" onClick={onHide}>
                    Đóng {/* Translated */}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PostPreviewModal;