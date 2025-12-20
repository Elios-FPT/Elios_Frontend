// File: elios_FE/src/codingChallenge/pages/CodingChallenge.js
import React, { useContext } from "react"; // Import useContext
import { useNavigate } from "react-router-dom";
import "../style/CodingChallenge.css";
import UserNavbar from "../../components/navbars/UserNavbar";
import LoadingCircle1 from "../../components/loading/LoadingCircle1";

// Import your context
import { CodingChallengeContext } from "../context/CodingChallengeContext";

const CodingChallenge = () => {
  // --- Destructure all new state and setters from context ---
  const {
    challenges,
    loading,
    difficulty, // Current difficulty value
    setDifficulty, // Setter for difficulty
    page, // Current page number
    setPage, // Setter for page
    totalPages, // Total pages from API
  } = useContext(CodingChallengeContext);
  
  const navigate = useNavigate();

  const handleSelect = (problemId) => {
    navigate(`/codingChallenge/online-ide?id=${problemId}`);
  };

  // --- New Handler for Difficulty Change ---
  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  // Handle the initial loading state (this will only show on first app load)
  if (loading && challenges.length === 0) { // Only show full page load if challenges are empty
    return (
      <>
        <header>
          <UserNavbar />
        </header>
        {/* We use an ID for the main container AND a "loading" class for centering */}
        <main id="coding-challenges-container" className="loading">
          <LoadingCircle1 />
        </main>
      </>
    );
  }

  return (
    <>
      <header>
        <UserNavbar />
      </header>

      {/* Main container ID */}
      <main id="coding-challenges-container">
        {/* Left Sidebar ID */}
        <aside id="coding-challenge-left">
          <h3>Danh mục</h3> {/* Translated: Categories */}
          {/* --- START: Difficulty Filter --- */}
          <label htmlFor="difficulty-select" style={{ fontSize: '0.9rem', color: '#bbbbbb' }}>Độ khó:</label> {/* Translated: Difficulty */}
          <select
            id="difficulty-select"
            value={difficulty}
            onChange={handleDifficultyChange}
            className="difficulty-filter-dropdown" // Added class for styling
          >
            <option value="">Tất cả</option> {/* Translated: All */}
            <option value="EASY">Dễ</option> {/* Translated: Easy */}
            <option value="MEDIUM">Trung bình</option> {/* Translated: Medium */}
            <option value="HARD">Khó</option> {/* Translated: Hard */}
          </select>
          {/* --- END: Difficulty Filter --- */}
          <p style={{ marginTop: '20px' }}></p>        </aside>

        {/* Main Content ID */}
        <section id="coding-challenge-middle">
          <div className="coding-challenges-background">
            <h1>Thử thách lập trình</h1> {/* Translated: Coding Challenges */}
            
            {/* Show loading spinner over table if fetching new page/filter */}
            {loading && <LoadingCircle1 />}

            {/* --- START: Table --- */}
            {/* Hide table if loading to prevent interaction */}
            <table className="coding-challenges-table" style={{ display: loading ? 'none' : 'table' }}>
              <thead>
                <tr>
                  <th>Tiêu đề</th> {/* Translated: Title */}
                  <th>Độ khó</th> {/* Translated: Difficulty */}
                  <th>Chủ đề</th> {/* Translated: Topics */}
                </tr>
              </thead>
              <tbody>
                {/* 'problems.map' changed to 'challenges.map' */}
                {challenges.map((p) => (
                  <tr key={p.id} onClick={() => handleSelect(p.id)}>
                    <td>{p.title}</td>
                    <td className={`diff ${p.difficulty.toLowerCase()}`}>
                      {p.difficulty}
                    </td>
                    <td>{p.topics.join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* --- END: Table --- */}

            {/* --- START: Pagination Controls --- */}
            <div className="pagination-controls">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0 || loading}
              >
                Trước {/* Translated: Previous */}
              </button>
              <span>
                Trang {page + 1} / {totalPages} {/* Translated: Page X of Y */}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1 || loading}
              >
                Tiếp {/* Translated: Next */}
              </button>
            </div>
            {/* --- END: Pagination Controls --- */}
          </div>
        </section>

        {/* Right Sidebar ID */}
        <aside id="coding-challenge-right">
          <h3>Mẹo</h3> {/* Translated: Tips */}
          <p>Cố gắng tận dụng tư duy của bản thân.</p> {/* Translated placeholder */}
        </aside>
      </main>
    </>
  );
};

export default CodingChallenge;