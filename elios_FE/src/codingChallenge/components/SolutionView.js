/* file: elios_FE/src/codingChallenge/components/SolutionView.js */
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
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

    const handleUpvote = async (solutionId, index, e) => {
        e.stopPropagation(); // Prevent modal opening
        // Optimistic update
        const updatedSolutions = [...solutions];
        updatedSolutions[index].upvoteCount += 1;
        setSolutions(updatedSolutions);

        try {
            await axios.post(API_ENDPOINTS.UPVOTE_POST(solutionId), {}, { withCredentials: true });
        } catch (error) {
            console.error("Error upvoting:", error);
            updatedSolutions[index].upvoteCount -= 1;
            setSolutions(updatedSolutions);
        }
    };

    const handleDownvote = async (solutionId, index, e) => {
        e.stopPropagation(); // Prevent modal opening
        // Optimistic update
        const updatedSolutions = [...solutions];
        updatedSolutions[index].downvoteCount += 1;
        setSolutions(updatedSolutions);

        try {
            await axios.post(API_ENDPOINTS.DOWNVOTE_POST(solutionId), {}, { withCredentials: true });
        } catch (error) {
            console.error("Error downvoting:", error);
            updatedSolutions[index].downvoteCount -= 1;
            setSolutions(updatedSolutions);
        }
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
                    {solutions.map((sol, index) => (
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
                                {/* <span className="solution-stat-item up" onClick={(e) => handleUpvote(sol.postId, index, e)}>
                                    <FaThumbsUp /> {sol.upvoteCount}
                                </span>
                                <span className="solution-stat-item down" onClick={(e) => handleDownvote(sol.postId, index, e)}>
                                    <FaThumbsDown /> {sol.downvoteCount}
                                </span> */}
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
                />
            )}
        </div>
    );
};

export default SolutionView;