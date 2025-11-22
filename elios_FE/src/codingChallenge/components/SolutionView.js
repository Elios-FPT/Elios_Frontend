/* file: elios_FE/src/codingChallenge/components/SolutionView.js */
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FaThumbsUp, FaThumbsDown, FaCommentAlt, FaEye } from "react-icons/fa";
import { API_ENDPOINTS } from "../../api/apiConfig";
import { formatRelativeTime } from "../../forum/utils/formatTime";
import "../style/SolutionView.css";

const SolutionView = ({ problemId }) => {
    const [solutions, setSolutions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Track expanded posts by ID
    const [expandedIds, setExpandedIds] = useState(new Set());

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
                setError("Failed to load solutions.");
                setSolutions([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSolutions();
    }, [problemId]);

    const toggleExpand = (id) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    const handleUpvote = async (solutionId, index) => {
        // Optimistic update
        const updatedSolutions = [...solutions];
        updatedSolutions[index].upvoteCount += 1;
        setSolutions(updatedSolutions);

        try {
            await axios.post(API_ENDPOINTS.UPVOTE_POST(solutionId), {}, { withCredentials: true });
        } catch (error) {
            console.error("Error upvoting:", error);
            // Revert on error
            updatedSolutions[index].upvoteCount -= 1;
            setSolutions(updatedSolutions);
        }
    };

    const handleDownvote = async (solutionId, index) => {
        // Optimistic update
        const updatedSolutions = [...solutions];
        updatedSolutions[index].downvoteCount += 1;
        setSolutions(updatedSolutions);

        try {
            await axios.post(API_ENDPOINTS.DOWNVOTE_POST(solutionId), {}, { withCredentials: true });
        } catch (error) {
            console.error("Error downvoting:", error);
            // Revert on error
            updatedSolutions[index].downvoteCount -= 1;
            setSolutions(updatedSolutions);
        }
    };

    return (
        <div id="solution-view-container">
            {loading && <div id="solution-view-loading">Loading official solutions...</div>}
            {error && <div id="solution-view-error">{error}</div>}

            {!loading && !error && solutions.length === 0 && (
                <p id="solution-view-empty">No solutions found for this problem.</p>
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
                                className={`solution-body ${expandedIds.has(sol.postId) ? 'expanded' : ''}`}
                                onClick={() => toggleExpand(sol.postId)}
                                title="Click to expand/collapse"
                            >
                                <ReactMarkdown 
                                    remarkPlugins={[remarkGfm]} 
                                    components={{ p: "span" }}
                                >
                                    {sol.content}
                                </ReactMarkdown>
                            </div>

                            <div className="solution-footer">
                                <span className="solution-stat-item up" onClick={() => handleUpvote(sol.postId, index)}>
                                    <FaThumbsUp /> {sol.upvoteCount}
                                </span>
                                <span className="solution-stat-item down" onClick={() => handleDownvote(sol.postId, index)}>
                                    <FaThumbsDown /> {sol.downvoteCount}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SolutionView;