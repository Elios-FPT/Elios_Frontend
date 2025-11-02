// file: elios_FE/src/codingChallenge/context/CodingChallengeContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";

export const CodingChallengeContext = createContext();

export const CodingChallengeProvider = ({ children }) => {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true); // Set to true initially

    useEffect(() => {
        const fetchChallenges = async () => {
            setLoading(true); // We are about to fetch
            try {
                const response = await axios.get(API_ENDPOINTS.GET_CODE_CHALLENGES_LIST, {
                    withCredentials: true,
                    headers: {
                      "Content-Type": "application/json",
                    },
                });
                const fetchedProblems = response.data.data.content;
                
                const difficultyOrder = {
                  EASY: 1,
                  MEDIUM: 2,
                  HARD: 3,
                };

                const sortedProblems = fetchedProblems.sort((a, b) => {
                  return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
                });

                setChallenges(sortedProblems);

            } catch (error) {
                console.error("Error fetching challenges:", error);
            } finally {
                setLoading(false); // Done fetching
            }
        };

        // Only fetch if we don't have challenges
        if (challenges.length === 0) {
            fetchChallenges();
        }
    }, [challenges.length]); // Keep your dependency

    return (
        <CodingChallengeContext.Provider value={{ challenges, loading }}>
            {children}
        </CodingChallengeContext.Provider>
    );
};