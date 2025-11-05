// file: elios_FE/src/forum/pages/EditPostForForum.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Container } from "react-bootstrap";
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";
import { API_ENDPOINTS } from "../../api/apiConfig";
import UserNavbar from "../../components/navbars/UserNavbar";
import '../style/EditPostForForum.css'; // Import the stylesheet

const EditPostForForum = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    // State for form fields
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // State for post loading and errors
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Image Pool
    const [userImages, setUserImages] = useState([]);
    const [imagesLoading, setImagesLoading] = useState(true);
    const [imageError, setImageError] = useState(null);

    // State for full-screen drag-to-upload
    const [isDragging, setIsDragging] = useState(false);

    /**
     * Fetches the user's uploaded images for the image pool.
     */
    const fetchUserImages = useCallback(async () => {
        setImagesLoading(true);
        setImageError(null);
        try {
            const response = await axios.get(API_ENDPOINTS.GET_MY_IMAGE_POOL, {
                withCredentials: true,
            });

            if (response.data && Array.isArray(response.data.responseData)) {
                setUserImages(response.data.responseData);
            } else {
                setImageError("Could not load user images.");
            }
        } catch (err) {
            console.error("Error fetching user images:", err);
            setImageError("Failed to fetch images.");
        } finally {
            setImagesLoading(false);
        }
    }, []); // No dependencies, function is stable

    /**
     * Fetches the main post content.
     */
    useEffect(() => {
        const fetchPostData = async () => {
            if (!postId) return;

            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(API_ENDPOINTS.GET_MY_POST_CONTENT(postId), {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });

                if (response.data && response.data.responseData) {
                    const post = response.data.responseData;
                    setTitle(post.title);
                    setContent(post.content);
                } else {
                    setError("Post data not found in response.");
                }

            } catch (err) {
                console.error("Error fetching post data:", err);
                setError("Failed to fetch post. You may not have permission to edit this post or it may not exist.");
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
        fetchUserImages();
    }, [postId, fetchUserImages]);

    const handleImageUpload = async (file) => {
        console.log("Uploading file:", file.name);
        setImageError(null); // Clear old errors

        const formData = new FormData();
        formData.append('files', file);

        try {
            const response = await axios.post(API_ENDPOINTS.UPLOAD_IMAGE, formData, {
                withCredentials: true
            });

            await fetchUserImages();

        } catch (err) {
            console.error("Image upload failed:", err);

            if (err.response) {
                console.error("Server responded with:", err.response.data);
            }

            setImageError("Failed to upload image. Please try again.");
            return null;
        }
    };

    /**
     * Handles pasting images directly into the MDEditor.
     */
    const handleImagePaste = async (event) => {
        const items = (event.clipboardData || window.clipboardData).items;
        let file = null;

        for (const item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                event.preventDefault();
                file = item.getAsFile();
                break;
            }
        }

        if (!file) {
            return;
        }

        const imageUrl = await handleImageUpload(file);

        if (imageUrl) {
            // Image uploaded, now insert Markdown into editor
            const textarea = event.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const markdownToInsert = `![Pasted Image](${imageUrl})`;

            const newContent =
                content.substring(0, start) +
                markdownToInsert +
                content.substring(end);

            setContent(newContent);

            // Move cursor to after the inserted markdown
            setTimeout(() => {
                if (textarea) {
                    textarea.selectionStart = textarea.selectionEnd = start + markdownToInsert.length;
                }
            }, 0);
        }
    };

    /**
     * Handles starting a drag operation from the image pool.
     * We set the data to the Markdown string of the image.
     */
    const handleImagePoolDragStart = (event, imageUrl) => {
        const markdownToInsert = `![Image](${imageUrl})`;
        event.dataTransfer.setData("text/plain", markdownToInsert);
    };

    /**
     * Effect to handle global drag-and-drop for file uploads.
     */
    useEffect(() => {
        const handleDragOver = (event) => {
            event.preventDefault();
            setIsDragging(true); // Show visual feedback
        };

        const handleDragLeave = (event) => {
            event.preventDefault();
            setIsDragging(false); // Hide visual feedback
        };

        const handleDrop = async (event) => {
            event.preventDefault();
            setIsDragging(false); // Hide visual feedback

            let file = null;
            if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
                // Check if any dropped item is an image file
                for (const item of event.dataTransfer.files) {
                    if (item.type.startsWith('image/')) {
                        file = item;
                        break;
                    }
                }
            }

            if (file) {
                // We found an image file, upload it.
                // No need to insert, just upload to the pool.
                await handleImageUpload(file);
            }
        };

        // Add listeners to the whole window
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('dragleave', handleDragLeave);
        window.addEventListener('drop', handleDrop);

        // Cleanup function to remove listeners
        return () => {
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('dragleave', handleDragLeave);
            window.removeEventListener('drop', handleDrop);
        };
    }, []); // Empty array means this runs once on mount and cleans up on unmount

    /**
     * Handles the final form submission.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Implement the UPDATE/PUT API call
        console.log("Submitting updated post:", { title, content });
        // ... (your existing submit logic) ...
    };

    if (loading) {
        return (
            <>
                <UserNavbar />
                <div id="edit-post-for-forum-container">
                    <p>Loading post data...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <UserNavbar />
                <div id="edit-post-for-forum-container">
                    <p id="edit-post-for-forum-error">{error}</p>
                    <button type="button" className="edit-post-for-forum-btn-cancel" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </>
        );
    }

    const renderImagePool = () => (
        <div id="edit-post-for-forum-image-pool">
            <h3>Image Pool</h3>
            {imageError && <p className="image-pool-error">{imageError}</p>}
            <div id="image-pool-list-container">
                {imagesLoading ? (
                    <p>Loading images...</p>
                ) : userImages.length > 0 ? (
                    userImages.map((image) => (
                        <div key={image.id || image.url} className="image-pool-item">
                            <img
                                src={image.url}
                                alt="User upload"
                                draggable="true"
                                onDragStart={(e) => handleImagePoolDragStart(e, image.url)}
                            />
                        </div>
                    ))
                ) : (
                    <p>No images uploaded yet. Drag images here to upload.</p>
                )}
            </div>
        </div>
    );

    return (
        <>
            <UserNavbar />
            {/* Full-screen overlay shown when dragging a file over the window */}
            {isDragging && (
                <div id="edit-post-for-forum-drag-overlay">
                    <p>Drop image to upload</p>
                </div>
            )}

            <div id="edit-post-for-forum-container">
                <Row>
                    {/* Image Pool Sidebar Column */}
                    <Col md={3}>
                        {renderImagePool()}
                    </Col>
                    {/* Main Content Editor Column */}
                    <Col md={9}>
                        <div id="edit-post-for-forum-form-wrapper">
                            <h1>Edit Your Post</h1>
                            <form id="edit-post-for-forum-form" onSubmit={handleSubmit}>
                                <div className="edit-post-for-forum-form-group">
                                    <label htmlFor="title">Title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="edit-post-for-forum-form-group" data-color-mode="light">
                                    <label htmlFor="content">Content</label>
                                    <MDEditor
                                        value={content}
                                        onChange={setContent}
                                        onPaste={handleImagePaste}
                                        height={600} // Increased height
                                        previewOptions={{
                                            rehypePlugins: [[rehypeSanitize]],
                                        }}
                                    />
                                </div>
                                <div className="edit-post-for-forum-form-actions">
                                    <button type="submit" className="edit-post-for-forum-btn-save">Save Changes</button>
                                    <button type="button" className="edit-post-for-forum-btn-cancel" onClick={() => navigate('/forum/user-posts')}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </Col>

                </Row>
            </div>
        </>
    );
};

export default EditPostForForum;