// elios_FE/src/forum/components/CreatePostModal.js
import React, { useState, useRef, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "../style/CreatePostModal.css";
import { formatRelativeTime } from "../utils/formatTime";

const CreatePostModal = ({ show, handleClose, handleCreatePost }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const textareaRef = useRef(null);
    const previewRef = useRef(null);

    useEffect(() => {
        if (!show) {
            setTitle("");
            setContent("");
        }
    }, [show]);

    // keep preview scroll synced with textarea
    const handleScroll = (e) => {
        if (previewRef.current) {
            previewRef.current.scrollTop = e.target.scrollTop;
        }
    };

    const handleSubmit = () => {
        if (!title.trim() && !content.trim()) return;
        // pass trimmed title & content to parent
        handleCreatePost &&
            handleCreatePost({
                title: title.trim(),
                content: content.trim(),
            });
        setTitle("");
        setContent("");
        handleClose && handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Create New Post</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="create-post-modal mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Post title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mb-2 create-post-modal">

                        <div className="create-post-modal-editor-wrap">
                            {/* Markdown preview rendered behind the textarea */}
                            <div
                                className="create-post-modal-markdown-preview"
                                ref={previewRef}
                                aria-hidden="true"
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeHighlight]}
                                >
                                </ReactMarkdown>
                            </div>

                            {/* Transparent textarea sits above the preview */}
                            <textarea
                                ref={textareaRef}
                                className="create-post-modaleditor-textarea"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onScroll={handleScroll}
                                placeholder=""
                            />
                        </div>

                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button className="create-post-modal-cancel-button" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    className="create-post-modal-create-button"
                    onClick={handleSubmit}
                    disabled={!title.trim() && !content.trim()}
                >
                    Create Post
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreatePostModal;
