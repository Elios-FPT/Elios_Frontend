import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import ProjectCard from '../components/ProjectCard';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/MockProjects.css';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const MockProjects = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [activeMainTab, setActiveMainTab] = useState('projects');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, statsRes] = await Promise.all([
          axios.get(API_ENDPOINTS.GET_MOCK_PROJECTS_LIST, { withCredentials: true }),
          axios.get(API_ENDPOINTS.GET_SUBMISSIONS_STATISTICS_CURRENT, { withCredentials: true })
        ]);

        setProjects(projRes.data.responseData.pagedData);
        setStats(statsRes.data.responseData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesLanguage = selectedLanguage === 'all' || project.language === selectedLanguage;
    const matchesDifficulty = selectedDifficulty === 'all' || project.difficulty === selectedDifficulty;
    return matchesLanguage && matchesDifficulty;
  });

  const handleProjectSelect = (projectId) => {
    navigate(`/mock-projects/${projectId}`);
  };

  const uniqueLanguages = ['all', ...new Set(projects.map(p => p.language))];
  const difficulties = ['all', 'Easy', 'Medium', 'Hard'];

  const statusData = stats?.statusCounts
    ? Object.entries(stats.statusCounts).map(([name, value]) => ({ name, value }))
    : [];

  const gradeData = stats && stats.averageFinalGrade !== null
    ? [
      { name: 'Highest', value: stats.highestFinalGrade },
      { name: 'Average', value: Math.round(stats.averageFinalGrade) },
      { name: 'Lowest', value: stats.lowestFinalGrade }
    ]
    : [];

  const COLORS = ['#50fa7b', '#ff79c6', '#bd93f9', '#8be9fd'];

  if (loading || error) {
    return (
      <div className="full-screen-loader">
        {loading ? (
          <>
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
          </>
        ) : (
          <p className="error-text">{error}</p>
        )}
      </div>
    );
  }

  return (
    <>
      <header>
        
      </header>

      <main className="dashboard-container">
        { }
        <div className="main-tabs-container">
          <div className="main-tabs-header">
            <button
              className={`main-tab-btn ${activeMainTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveMainTab('projects')}
            >
              Mock Projects
            </button>
            <button
              className={`main-tab-btn ${activeMainTab === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveMainTab('statistics')}
            >
              Your Statistics
            </button>
          </div>

          <div className="main-tab-content">
            { }
            {activeMainTab === 'projects' && (
              <div className="projects-tab">
                <div className="tab-header">
                  <h1>Mock Projects</h1>
                  <p className="intro-text">
                    Choose a project, code, and level up your skills!
                  </p>
                </div>

                { }
                <div className="filters-bar">
                  <div className="filter-group">
                    <label>Language:</label>
                    <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)}>
                      {uniqueLanguages.map(lang => (
                        <option key={lang} value={lang}>
                          {lang === 'all' ? 'All Languages' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Difficulty:</label>
                    <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}>
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>
                          {diff}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                { }
                <div className="projects-grid">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onSelect={handleProjectSelect}
                      />
                    ))
                  ) : (
                    <p className="no-results">No projects match your filters.</p>
                  )}
                </div>
              </div>
            )}

            { }
            {activeMainTab === 'statistics' && stats && (
              <div className="statistics-tab">
                <div className="tab-header">
                  <h1>Your Performance</h1>
                  <p className="intro-text">
                    Track your progress and improve!
                  </p>
                </div>

                { }
                <div className="stats-summary-grid">
                  <div className="stat-card-large">
                    <div className="stat-icon">Total</div>
                    <div className="stat-value">{stats.totalSubmissions}</div>
                    <div className="stat-label">Total Submissions</div>
                  </div>
                  <div className="stat-card-large">
                    <div className="stat-icon">Approved</div>
                    <div className="stat-value">{stats.totalApproved}</div>
                    <div className="stat-label">Approved</div>
                  </div>
                  <div className="stat-card-large">
                    <div className="stat-icon">Average</div>
                    <div className="stat-value">
                      {stats.averageFinalGrade !== null ? stats.averageFinalGrade.toFixed(1) : 'N/A'}
                    </div>
                    <div className="stat-label">Average Grade</div>
                  </div>
                </div>

                { }
                <div className="charts-grid">
                  { }
                  {statusData.length > 0 && (
                    <div className="chart-box">
                      <h3>Submission Status</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: '#1e1e1e', border: '1px solid #50fa7b', borderRadius: '8px' }}
                            labelStyle={{ color: '#50fa7b' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  { }
                  {gradeData.length > 0 && (
                    <div className="chart-box">
                      <h3>Grade Distribution</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={gradeData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="4 4" stroke="#333" />
                          <XAxis dataKey="name" stroke="#ccc" />
                          <YAxis domain={[0, 100]} stroke="#ccc" />
                          <Tooltip
                            contentStyle={{ background: '#1e1e1e', border: '1px solid #50fa7b', borderRadius: '8px' }}
                            labelStyle={{ color: '#50fa7b' }}
                          />
                          <Bar
                            dataKey="value"
                            fill="#50fa7b"
                            radius={[12, 12, 0, 0]}
                            barSize={60}
                            activeBar={{ fill: "#50fa7b" }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="stats-footer">
                  <p>Keep pushing! Every submission brings you closer to mastery.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        { }
        <aside className="tips-sidebar">
          <div className="tips-box">
            <h3>How to Start</h3>
            <ul className="tips-list">
              <li>Select a project that matches your level</li>
              <li>Download the starter code</li>
              <li>Read the instructions carefully</li>
              <li>Code, test, and submit</li>
              <li>Review feedback and improve</li>
            </ul>
          </div>
        </aside>
      </main>
    </>
  );
};

export default MockProjects;