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

    // Hardcoded values
    const CATEGORY_ID = "8cf071b9-ea2e-4a19-865e-28ec04a26ba7";
    const POST_TYPE = "Post";

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

    // State for sidebar drag-to-upload
    const [isOverImagePool, setIsOverImagePool] = useState(false);

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

    const handleImagePoolDragStart = (event, imageUrl) => {
        const markdownToInsert = `![Image](${imageUrl})`;
        event.dataTransfer.setData("text/plain", markdownToInsert);
    };

    
    const handlePoolDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.types.includes('Files')) {
            setIsOverImagePool(true);
        }
    };

    const handlePoolDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsOverImagePool(false);
    };

    const handlePoolDrop = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setIsOverImagePool(false);

        let file = null;
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            for (const item of event.dataTransfer.files) {
                if (item.type.startsWith('image/')) {
                    file = item;
                    break;
                }
            }
        }

        if (file) {
            await handleImageUpload(file);
        }
    };

    /**
     * Handles the final form submission (updating the post).
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); 

        const postData = {
            categoryId: CATEGORY_ID,
            title: title,
            content: content,
            postType: POST_TYPE,
            referenceId: null,
            tags: null,
            submitForReview: true
        };

        try {
            const response = await axios.put(API_ENDPOINTS.SUBMIT_POST(postId), postData, {
                withCredentials: true,
            });

            console.log("Post published successfully:", response.data);
            navigate('/forum/user-posts');

        } catch (error) {
            console.error("Error updating post:", error.response || error);
            setError("Failed to update post. Please try again.");
        }
    };

    const handleSaveDraft = async () => {
        const postData = {
            postId: postId, 
            categoryId: CATEGORY_ID,
            title: title,
            content: content,
            postType: POST_TYPE,
            tags: null
        };

        try {
            const response = await axios.put(API_ENDPOINTS.DRAFT_POST(postId), postData, {
                withCredentials: true,
            });

            console.log("Response from saving draft:", response.data);
            console.log('body being sent:', postData);
      
        } catch (error) {
            console.error("Error saving draft:", error.response || error);
            setImageError("Failed to save draft."); 
        }
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
        <div
            id="edit-post-for-forum-image-pool"
            className={isOverImagePool ? 'drag-over' : ''}
            onDragOver={handlePoolDragOver}
            onDragLeave={handlePoolDragLeave}
            onDrop={handlePoolDrop}
        >
            <h3>Image Pool</h3>
            {imageError && <p className="image-pool-error">{imageError}</p>}
            <div id="image-pool-list-container">
                {imagesLoading ? (
                    <p>Loading images...</p>
                ) : userImages.length > 0 ? (
                    userImages.map((image) => (
                        <div key={image.attachmentId} className="image-pool-item">
                            <img
                                src={image.url}
                                alt={image.fileName || "User upload"}
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
                                    {/* This button is type="button" and calls handleSaveDraft */}
                                    <button
                                        type="button"
                                        className="edit-post-for-forum-btn-draft"
                                        onClick={handleSaveDraft}
                                    >
                                        Save Draft
                                    </button>
                                    {/* This is the main submit button for the form */}
                                    <button type="submit"
                                     className="edit-post-for-forum-btn-save"
                                     onClick={handleSubmit}>
                                        Publish Post
                                    </button>
                                    <button
                                        type="button"
                                        className="edit-post-for-forum-btn-cancel"
                                        onClick={() => navigate('/forum/user-posts')}
                                    >
                                        Cancel
                                    </button>
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