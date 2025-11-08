// file: elios_FE/src/codingChallenge/context/CodingChallengeContext.js
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";

export const CodingChallengeContext = createContext();

export const CodingChallengeProvider = ({ children }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true); // Set to true initially

  // --- New State for Filters, Sorting, and Pagination ---
  
  // Filter state
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState(""); // e.g., "EASY", "MEDIUM", "HARD", or "" for all
  const [topics, setTopics] = useState([]); // array of strings, e.g., ["Arrays", "Math"]

  // Sort state (Defaulted to match your original client-side sort logic)
  const [sort, setSort] = useState("difficulty");
  const [order, setOrder] = useState("asc");

  // Pagination state (based on note.json response)
  const [page, setPage] = useState(0); // API is 0-indexed
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // --- Modified fetchChallenges ---
  // Moved outside useEffect and wrapped in useCallback
  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      // Build the params object for Axios based on current state
      const params = {
        page,
        size,
        search,
        difficulty,
        topics, // Axios will serialize this array (e.g., topics=Math&topics=Arrays)
        sort,
        order,
      };

      const response = await axios.get(
        API_ENDPOINTS.GET_CODE_CHALLENGES_LIST,
        {
          params, // Axios automatically handles query string creation
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const responseData = response.data.data;

      setChallenges(responseData.content);


      setPage(responseData.page);
      setTotalPages(responseData.totalPages);
      setTotalElements(responseData.totalElements);

    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false); // Done fetching
    }
  }, [page, size, search, difficulty, topics, sort, order]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]); 
  return (
    <CodingChallengeContext.Provider
      value={{
        challenges,
        loading,

        // Filters + Setters
        search,
        setSearch,
        difficulty,
        setDifficulty,
        topics,
        setTopics,

        // Sorting + Setters
        sort,
        setSort,
        order,
        setOrder,

        // Pagination + Setters
        page,
        setPage,
        size,
        setSize,
        totalPages,
        totalElements,
      }}
    >
      {children}
    </CodingChallengeContext.Provider>
  );
};