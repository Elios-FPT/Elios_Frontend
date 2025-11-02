// File: elios_FE/src/codingChallenge/pages/CodingChallenge.js
import React, { useContext } from "react"; // Import useContext
import { useNavigate } from "react-router-dom";
import "../style/CodingChallenge.css";
import UserNavbar from "../../components/navbars/UserNavbar";
import LoadingCircle1 from "../../components/loading/LoadingCircle1";

// Import your context
import { CodingChallengeContext } from "../context/CodingChallengeContext";

const CodingChallenge = () => {
  // Get state from the context instead of component state
  const { challenges, loading } = useContext(CodingChallengeContext);
  const navigate = useNavigate();

  const handleSelect = (problemId) => {
    navigate(`/codingChallenge/online-ide?id=${problemId}`);
  };

  // Handle the initial loading state (this will only show on first app load)
  if (loading) {
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
          <h3>Categories</h3>
          <p>Placeholder for future filters or tags.</p>
        </aside>

        {/* Main Content ID */}
        <section id="coding-challenge-middle">
          <div className="coding-challenges-background">
            <h1>Coding Challenges</h1>
            <table className="coding-challenges-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Topics</th>
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
          </div>
        </section>

        {/* Right Sidebar ID */}
        <aside id="coding-challenge-right">
          <h3>Tips</h3>
          <p>Placeholder for future leaderboard or announcements.</p>
        </aside>
      </main>
    </>
  );
};

export default CodingChallenge;