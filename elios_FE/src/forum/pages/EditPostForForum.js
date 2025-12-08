// file: elios_FE/src/forum/pages/EditPostForForum.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";
import { API_ENDPOINTS } from "../../api/apiConfig";
import UserNavbar from "../../components/navbars/UserNavbar";
import '../style/EditPostForForum.css';

const EditPostForForum = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    // Hardcoded values
    const POST_TYPE = "Post";
    
    // State for form fields
    const [forumCategories, setForumCategories] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [categoryId, setCategoryId] = useState("");

    // State for post loading and errors
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for Image Pool
    const [userImages, setUserImages] = useState([]);
    const [imagesLoading, setImagesLoading] = useState(true);
    const [imageError, setImageError] = useState(null);

    // State for sidebar drag-to-upload
    const [isOverImagePool, setIsOverImagePool] = useState(false);

    // Fetches the user's uploaded images for the image pool.
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
    }, []);

    // Fetches content.
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
                    if (post.categoryId) {
                        setCategoryId(post.categoryId);
                    }
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

        const fetchCategories = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.GET_CATEGORIES_FORUM, {
                    withCredentials: true,
                });

                if (response.data && Array.isArray(response.data.responseData)) {
                    setForumCategories(response.data.responseData);
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
        fetchPostData();
        fetchUserImages();
    }, [postId, fetchUserImages]);

    const handleImageUpload = async (file) => {
        console.log("Uploading file:", file.name);
        setImageError(null); 

        const formData = new FormData();
        formData.append('files', file);

        try {
            const response = await axios.post(API_ENDPOINTS.UPLOAD_IMAGE, formData, {
                withCredentials: true
            });

            await fetchUserImages();
            
            // Return URL if the backend provides it immediately, though implementation details vary
            // Assuming response structure allows finding the URL or it's handled by refresh
            return null; // The original code returned implicit undefined or handled it inside, preserved flow

        } catch (err) {
            console.error("Image upload failed:", err);
            if (err.response) {
                console.error("Server responded with:", err.response.data);
            }
            setImageError("Failed to upload image. Please try again.");
            return null;
        }
    };

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

        // Logic relies on handleImageUpload logic which was slightly ambiguous in return in original
        // Assuming original flow worked, we keep it. 
        // Note: In original code, handleImageUpload returned void/promise but paste expected URL.
        // If your backend returns URL, update handleImageUpload to return response.data.url
        await handleImageUpload(file);
        
        // Note: The original paste logic relied on a returned URL which might have been missing in the provided snippet's upload function.
        // For now, preserving existing structure.
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
     * Internal helper to perform the draft save.
     * Returns the response object on success to allow chaining.
     */
    const performSaveDraft = async () => {
        const postData = {
            postId: postId,
            categoryId: categoryId,
            title: title,
            content: content,
            postType: POST_TYPE,
            tags: null
        };

        return await axios.put(API_ENDPOINTS.DRAFT_POST(postId), postData, {
            withCredentials: true,
        });
    };

    /**
     * Handles the "Save Draft" button click (Navigates on success).
     */
    const handleSaveDraft = async () => {
        try {
            const response = await performSaveDraft();
            
            if (response.data.status === 200) {
                navigate('/forum/user-posts');
            } else {
                alert("Failed to save draft. With error: " + response.data.message);
            }
        } catch (error) {
            console.error("Error saving draft:", error.response || error);
            alert("Failed to save draft." + (error.response ? ` Server responded with: ${error.response.data.message}` : ""));
        }
    };

    /**
     * Handles the final form submission.
     * 1. Saves Draft.
     * 2. If Draft saves successfully, Submits the Post.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. First, try to save the draft
        try {
            const draftResponse = await performSaveDraft();
            
            if (!draftResponse || draftResponse.data.status !== 200) {
                // If draft save failed logically (but didn't throw), stop here
                alert("Auto-save failed. Cannot submit post. " + (draftResponse?.data?.message || ""));
                return;
            }
        } catch (error) {
            console.error("Error during auto-save before submit:", error);
            alert("Error saving draft. Post was not submitted.");
            return; // Stop submission if draft save fails
        }

        // 2. If draft saved, proceed to submit
        const postData = {
            categoryId: categoryId,
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
            if (response.data.status === 200) {
                navigate('/forum/user-posts');
            } else {
                alert("Failed to update post. With error: " + response.data.message);
            }

        } catch (error) {
            console.error("Error updating post:", error.response || error);
            setError("Failed to update post. Please try again.");
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
                    <Col md={2}>
                        {renderImagePool()}
                    </Col>
                    <Col md={10}>
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

                                <div className="edit-post-for-forum-form-group-category">
                                    <label htmlFor="postType">Post Category</label>
                                    <select id="postType" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                                        <option value="" disabled>Select a Category</option>
                                        {forumCategories.map((category) => (
                                            <option key={category.categoryId} value={category.categoryId}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    
                                </div>
                                <div className="edit-post-for-forum-form-group" data-color-mode="dark">
                                    <label htmlFor="content">Content</label>
                                    <MDEditor
                                        value={content}
                                        onChange={setContent}
                                        onPaste={handleImagePaste}
                                        height={600}
                                        previewOptions={{
                                            rehypePlugins: [[rehypeSanitize]],
                                        }}
                                    />
                                </div>
                                <div className="edit-post-for-forum-form-actions">
                                    <button
                                        type="button"
                                        className="edit-post-for-forum-btn-draft"
                                        onClick={handleSaveDraft}
                                    >
                                        Save Draft
                                    </button>
                                    <button type="submit"
                                        className="edit-post-for-forum-btn-save">
                                        Publish Post
                                    </button>
                                    <button
                                        type="button"
                                        className="edit-post-for-forum-btn-cancel"
                                        onClick={() => navigate('/forum/user-posts')}
                                    >
                                        Return
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