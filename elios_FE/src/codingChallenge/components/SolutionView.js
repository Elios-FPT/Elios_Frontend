/* file: elios_FE/src/codingChallenge/components/SolutionView.js */
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaThumbsUp, FaThumbsDown, FaCommentAlt } from "react-icons/fa"; 
import { API_ENDPOINTS } from "../../api/apiConfig";
import { formatRelativeTime } from "../../forum/utils/formatTime";
import "../style/SolutionView.css";
import SolutionViewDetailModal from "./SolutionVIewDetailModal";

const SolutionView = ({ problemId }) => {
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Modal State
    const [selectedSolutionId, setSelectedSolutionId] = useState(null);

    const postType = "Solution";

    useEffect(() => {
        const fetchSolutions = async () => {
            if (!problemId) return;

            setLoading(true);
            setError("");

            try {
                const response = await axios.get(API_ENDPOINTS.GET_SOLUTION, {
                    params: {
                        PostType: postType,
                        ReferenceId: problemId,
                    },
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });

                if (response.data.status === 200 && Array.isArray(response.data.responseData)) {
                    setSolutions(response.data.responseData);
                } else {
                    setSolutions([]);
                }

            } catch (err) {
                console.error("Error fetching solutions:", err);
                setError("Không thể tải các giải pháp."); // Translated
                setSolutions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSolutions();
    }, [problemId]);

    const handleOpenModal = (solutionId) => {
        setSelectedSolutionId(solutionId);
    };

    const handleCloseModal = () => {
        setSelectedSolutionId(null);
    };

    // Generic callback to update any field of a specific solution in the list
    const handleSolutionUpdate = (solutionId, updatedFields) => {
        setSolutions(prevSolutions => 
            prevSolutions.map(sol => {
                if (sol.postId === solutionId) {
                    return {
                        ...sol,
                        ...updatedFields
                    };
                }
                return sol;
            })
        );
    };

    return (
        <div id="solution-view-container">
            {loading && <div id="solution-view-loading">Đang tải các giải pháp chính thức...</div>} {/* Translated */}
            {error && <div id="solution-view-error">{error}</div>}

            {!loading && !error && solutions.length === 0 && (
                <p id="solution-view-empty">Không tìm thấy giải pháp nào cho vấn đề này.</p> // Translated
            )}

            {!loading && !error && solutions.length > 0 && (
                <div id="solution-list">
                    {solutions.map((sol) => (
                        <div key={sol.postId} className="solution-card">
                            <div className="solution-header">
                                <div className="solution-user-info">
                                    <img 
                                        src={sol.authorAvatarUrl || "/default-avatar.png"} 
                                        alt="avatar" 
                                        className="solution-avatar"
                                    />
                                    <span className="solution-author">{sol.authorFullName}</span>
                                    <span className="solution-time">{formatRelativeTime(sol.createdAt)}</span>
                                </div>
                            </div>
                            
                            <div className="solution-title">{sol.title}</div>

                            <div 
                                className="solution-body"
                                onClick={() => handleOpenModal(sol.postId)}
                                title="Nhấp để xem chi tiết đầy đủ" // Translated
                            >
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]} 
                                    components={{ p: "span" }}
                                >
                                    {sol.content}
                                </ReactMarkdown>
                            </div>

                            <div className="solution-footer">
                                {/* Likes/Dislikes (View Only - Always Gray) */}
                                <span 
                                    className="solution-stat-item up" 
                                    style={{ 
                                        cursor: 'default', 
                                        color: '#6c757d' // Always gray
                                    }}
                                >
                                    <FaThumbsUp /> {sol.upvoteCount}
                                </span>
                                <span 
                                    className="solution-stat-item down" 
                                    style={{ 
                                        cursor: 'default', 
                                        color: '#6c757d' // Always gray
                                    }}
                                >
                                    <FaThumbsDown /> {sol.downvoteCount}
                                </span>
                                {/* Comment Count */}
                                <span 
                                    className="solution-stat-item comment"
                                    style={{ cursor: 'default', color: '#6c757d' }}
                                >
                                    <FaCommentAlt /> {sol.commentCount}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedSolutionId && (
                <SolutionViewDetailModal 
                    solutionId={selectedSolutionId} 
                    show={!!selectedSolutionId}
                    onClose={handleCloseModal}
                    onSolutionUpdate={handleSolutionUpdate} // Pass the generic callback
                />
            )}
        </div>
    );
};

export default SolutionView;