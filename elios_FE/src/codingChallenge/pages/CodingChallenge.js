// File: elios_FE/src/codingChallenge/pages/CodingChallenge.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import problemsData from "../data/problems.json";
import "../style/CodingChallenge.css";
import UserNavbar from "../../components/navbars/UserNavbar";

const CodingChallenge = () => {
  const [problems, setProblems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setProblems(problemsData);
  }, []);

  const handleSelect = (problemId) => {
    navigate(`/codingChallenge/online-ide?id=${problemId}`);
  };

  return (
    <>
      <header>
        <UserNavbar />
      </header>

      <main className="coding-challenges-container">
        {/* Left Sidebar */}
        <aside className="coding-challenge-left">
          <h3>Categories</h3>
          <p>Placeholder for future filters or tags.</p>
        </aside>

        {/* Main Content */}
        <section className="coding-challenge-middle">
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
                {problems.map((p) => (
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

        {/* Right Sidebar */}
        <aside className="coding-challenge-right">
          <h3>Tips</h3>
          <p>Placeholder for future leaderboard or announcements.</p>
        </aside>
      </main>
    </>
  );
};

export default CodingChallenge;
