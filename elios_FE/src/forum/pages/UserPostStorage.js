// file: elios_FE/src/forum/pages/UserPostStorage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Nav } from "react-bootstrap"; 
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";
import UserPostStorageCard from "../components/UserPostStorageCard";
import UserNavbar from "../../components/navbars/UserNavbar";
import "../style/UserPostStorage.css";
import LoadingCircle1 from "../../components/loading/LoadingCircle1";

const UserPostStorage = () => {
    const navigate = useNavigate();
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [banInfo, setBanInfo] = useState(null);
    
    // Tab State: 'Post' or 'Solution'
    const [activeTab, setActiveTab] = useState("Post");

    // Hardcoded values
    const CATEGORY_ID = "8cf071b9-ea2e-4a19-865e-28ec04a26ba7";
    const TITLE = "Tiêu đề bài viết"; // Translated
    const CONTENT = "Nội dung bài viết của bạn..."; // Translated

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Ensure loading state is reset when tab changes
            try {
                // Fetch posts and ban status in parallel
                const [postsResponse, banResponse] = await Promise.all([
                    axios.get(API_ENDPOINTS.GET_MY_POSTS, {
                        params: { PostType: activeTab }, // Use activeTab ('Post' or 'Solution')
                        withCredentials: true,
                        headers: { "Content-Type": "application/json" }
                    }),
                    axios.get(API_ENDPOINTS.GET_MY_BANNED_STATUS, {
                        withCredentials: true
                    })
                ]);

                setUserPosts(postsResponse.data.responseData);
                
                if (banResponse.data && banResponse.data.responseData) {
                    setBanInfo(banResponse.data.responseData);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Không thể tải dữ liệu."); // Translated
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab]); // Re-run when activeTab changes

    const handleCreateNewPost = async (e) => {
        e.preventDefault();
        
        // Prevent creation if banned
        if (banInfo && banInfo.isBanned) {
            alert("Bạn không thể tạo bài viết khi đang bị cấm."); // Translated
            return;
        }

        setError(null);

        const postData = {
            categoryId: CATEGORY_ID,
            title: TITLE,
            content: CONTENT,
            postType: "Post", // Always create generic posts from here
            referenceId: null,
            tags: null,
            submitForReview: false
        };

        try {
            const response = await axios.post(API_ENDPOINTS.CREATE_POSTS_FORUM, postData, {
                withCredentials: true,
            });

            const newPost = response.data.message;
            navigate(`/forum/my-posts/edit/${newPost}`);

        } catch (error) {
            console.error("Error creating new post:", error.response || error);
            setError("Không thể tạo bài viết mới. Vui lòng thử lại."); // Translated
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(API_ENDPOINTS.DELETE_MY_POST(postId), {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            setUserPosts(prevPosts =>
                prevPosts.filter(post => post.postId !== postId)
            );
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    };

    const renderBanNotification = () => {
        if (!banInfo || !banInfo.isBanned) return null;

        const banDate = new Date(banInfo.banUntil).toLocaleString("vi-VN"); 
        const message = banInfo.isPermanent 
            ? "Bạn đã bị cấm đăng bài vĩnh viễn." // Translated
            : `Bạn bị cấm đăng bài cho đến ${banDate}.`; // Translated

        return (
            <div id="user-post-storage-ban-notification">
                <div id="ban-notification-icon">⚠️</div>
                <div id="ban-notification-content">
                    <strong>Tài khoản bị tạm khóa</strong> {/* Translated */}
                    <span>{message}</span>
                    {banInfo.reason && <span className="ban-reason">Lý do: {banInfo.reason}</span>} 
                </div>
            </div>
        );
    };

    return (
        <div id="user-post-storage-page">
            <UserNavbar />
            <div id="user-post-storage-background">
                <div id="user-post-storage-container">
                    
                    {renderBanNotification()}

                    <div id="user-post-storage-header">
                        <h1 id="user-post-storage-title">Kho Bài Viết Của Bạn</h1> {/* Translated */}
                        
                        {/* Only show "Create" button if on "Post" tab. Solutions are created in IDE. */}
                        {activeTab === 'Post' && (
                            <button
                                id="user-post-storage-create-btn"
                                onClick={handleCreateNewPost}
                                disabled={banInfo?.isBanned}
                                title={banInfo?.isBanned ? "Bạn đang bị cấm tạo bài viết" : "Tạo bài viết mới"} 
                                style={banInfo?.isBanned ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#555' } : {}}
                            >
                                Tạo bài viết mới {/* Translated */}
                            </button>
                        )}
                    </div>

                    {/* Navigation Tabs */}
                    <Nav 
                        variant="tabs" 
                        activeKey={activeTab} 
                        onSelect={(selectedKey) => setActiveTab(selectedKey)}
                        className="mb-4 user-post-storage-tabs border-bottom-0"
                    >
                        <Nav.Item>
                            <Nav.Link 
                                eventKey="Post" 
                                className={`user-storage-tab ${activeTab === 'Post' ? 'active-tab' : ''}`}
                            >
                                Bài Viết {/* Translated: Posts */}
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link 
                                eventKey="Solution" 
                                className={`user-storage-tab ${activeTab === 'Solution' ? 'active-tab' : ''}`}
                            >
                                Bài Giải
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>

                    {error && <p className="user-post-storage-error">{error}</p>}

                    <div id="user-post-storage-list">
                        {loading ? (
                            <div id="user-post-storage-loading">
                                <LoadingCircle1 />
                            </div>
                        ) : (
                            <>
                                {userPosts.length === 0 ? (
                                    <div className="text-center text-muted w-100 py-5" style={{ gridColumn: '1 / -1' }}>
                                        <p>Bạn chưa có {activeTab === 'Post' ? 'bài viết' : 'Bài Giải'} nào.</p> {/* Translated */}
                                    </div>
                                ) : (
                                    userPosts.map((post) => (
                                        <UserPostStorageCard
                                            key={post.postId}
                                            post={post}
                                            isSolution={activeTab === 'Solution'} // <-- Pass the solution flag
                                            onDelete={handleDeletePost}
                                        />
                                    ))
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPostStorage;