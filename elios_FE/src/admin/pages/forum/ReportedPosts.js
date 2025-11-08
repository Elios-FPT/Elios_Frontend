// src/admin/pages/ReportedPosts.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../api/apiConfig';
import PostPreviewModal from '../../components/PostPreviewModal';

const ReportedPosts = () => {

    const [reportedPosts, setReportedPosts] = useState([]);

    useEffect(() => {
        // Fetch reported posts from the backend
        axios.get(API_ENDPOINTS.REPORTED_POSTS)
            .then(response => {
                setReportedPosts(response.data);
            })
            .catch(error => {
                console.error('Error fetching reported posts:', error);
            });
    }, []);



    return (
        <div>
            <h1>Reported Forum Posts</h1>
            <p>Here you can review posts that have been reported for violating community guidelines.</p>
            {/* Logic to fetch and display reported posts would go here */}
        </div>
    );
};

export default ReportedPosts;