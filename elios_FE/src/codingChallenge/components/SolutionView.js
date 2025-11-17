/* file: elios_FE/src/codingChallenge/components/SolutionView.js */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "../style/SolutionView.css";

const SolutionView = ({ problemId }) => {
    const [solution, setSolution] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const postType = "Solution";
    const challengeId = problemId;

    useEffect(() => {
        const fetchSolution = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.GET_SOLUTION(problemId), {
                    params: {
                        PostType: postType,
                        ReferenceId: challengeId,
                    },
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                setSolution(response.data.responseData);
                console.log("✅ Backend connection successful:", response.data);

            } catch (error) {
                const errorMessage = `❌ API ${API_ENDPOINTS.GET_SOLUTION(problemId)} Error connecting to backend: ${error.message}`;
                setError(errorMessage);
                console.error(errorMessage, error.response?.data);
            }
        };

        if (problemId) {
            fetchSolution();
        }
    }, [problemId]);

    return (
        <>

        </>
    );

}

export default SolutionView;