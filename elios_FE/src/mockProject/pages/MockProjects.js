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
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
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
      { name: 'Cao nhất', value: stats.highestFinalGrade },
      { name: 'Trung bình', value: Math.round(stats.averageFinalGrade) },
      { name: 'Thấp nhất', value: stats.lowestFinalGrade }
    ]
    : [];

  const COLORS = ['#50fa7b', '#ff79c6', '#bd93f9', '#8be9fd'];

  if (loading || error) {
    return (
      <div className="full-screen-loader">
        {loading ? (
          <>
            <div className="spinner"></div>
            <p>Đang tải bảng điều khiển của bạn...</p>
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
        <UserNavbar />
      </header>

      <main className="dashboard-container">
        { }
        <div className="main-tabs-container">
          <div className="main-tabs-header">
            <button
              className={`main-tab-btn ${activeMainTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveMainTab('projects')}
            >
              Dự án Thực hành
            </button>
            <button
              className={`main-tab-btn ${activeMainTab === 'statistics' ? 'active' : ''}`}
              onClick={() => setActiveMainTab('statistics')}
            >
              Thống kê của bạn
            </button>
          </div>

          <div className="main-tab-content">
            { }
            {activeMainTab === 'projects' && (
              <div className="projects-tab">
                <div className="tab-header">
                  <h1>Dự án Thực hành</h1>
                  <p className="intro-text">
                    Chọn một dự án, lập trình và nâng cao kỹ năng của bạn!
                  </p>
                </div>

                { }
                <div className="filters-bar">
                  <div className="filter-group">
                    <label>Ngôn ngữ:</label>
                    <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)}>
                      {uniqueLanguages.map(lang => (
                        <option key={lang} value={lang}>
                          {lang === 'all' ? 'Tất cả ngôn ngữ' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Độ khó:</label>
                    <select value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}>
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>
                          {diff === 'all' ? 'Tất cả' : diff === 'Easy' ? 'Dễ' : diff === 'Medium' ? 'Trung bình' : 'Khó'}
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
                    <p className="no-results">Không có dự án nào phù hợp với bộ lọc của bạn.</p>
                  )}
                </div>
              </div>
            )}

            { }
            {activeMainTab === 'statistics' && stats && (
              <div className="statistics-tab">
                <div className="tab-header">
                  <h1>Hiệu suất của bạn</h1>
                  <p className="intro-text">
                    Theo dõi tiến độ và cải thiện bản thân!
                  </p>
                </div>

                { }
                <div className="stats-summary-grid">
                  <div className="stat-card-large">
                    <div className="stat-icon">Tổng</div>
                    <div className="stat-value">{stats.totalSubmissions}</div>
                    <div className="stat-label">Tổng số bài nộp</div>
                  </div>
                  <div className="stat-card-large">
                    <div className="stat-icon">Đạt</div>
                    <div className="stat-value">{stats.totalApproved}</div>
                    <div className="stat-label">Được duyệt</div>
                  </div>
                  <div className="stat-card-large">
                    <div className="stat-icon">Trung bình</div>
                    <div className="stat-value">
                      {stats.averageFinalGrade !== null ? stats.averageFinalGrade.toFixed(1) : 'N/A'}
                    </div>
                    <div className="stat-label">Điểm trung bình</div>
                  </div>
                </div>

                { }
                <div className="charts-grid">
                  { }
                  {statusData.length > 0 && (
                    <div className="chart-box">
                      <h3>Trạng thái bài nộp</h3>
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
                            contentStyle={{
                              background: '#1e1e1e',
                              border: '1px solid #50fa7b',
                              borderRadius: '8px',
                              color: '#b0b0b0',
                            }}
                            labelStyle={{
                              color: '#9e9e9e',
                            }}
                            itemStyle={{
                              color: '#b0b0b0',
                            }}
                          />

                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  { }
                  {gradeData.length > 0 && (
                    <div className="chart-box">
                      <h3>Phân bố điểm</h3>
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
                  <p>Hãy tiếp tục cố gắng! Mỗi bài nộp đều đưa bạn gần hơn đến sự thành thạo.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        { }
        <aside className="tips-sidebar">
          <div className="tips-box">
            <h3>Cách bắt đầu</h3>
            <ul className="tips-list">
              <li>Chọn một dự án phù hợp với trình độ của bạn</li>
              <li>Tải mã khởi đầu</li>
              <li>Đọc kỹ hướng dẫn</li>
              <li>Lập trình, kiểm tra và nộp bài</li>
              <li>Xem nhận xét và cải thiện</li>
            </ul>
          </div>
        </aside>
      </main>
    </>
  );
};

export default MockProjects;