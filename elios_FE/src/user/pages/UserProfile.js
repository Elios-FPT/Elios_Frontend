import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/UserProfile.css';
import LoadingCircle1 from '../../components/loading/LoadingCircle1';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar,
  Cell
} from 'recharts';
import { FiArrowLeft } from 'react-icons/fi';

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatBirthDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatToken = (tokens) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(tokens);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.GET_USER_PROFILE, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        });
        setProfile(response.data.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div id="user-profile-loading">
        <LoadingCircle1 />
      </div>
    );
  }

  if (!profile) {
    return (
      <div id="user-profile-error">
        <div className="error-card">
          <h2>Could not load user profile</h2>
          <p>Please try refreshing the page</p>
          <button 
            className="btn-back" 
            onClick={() => navigate('/')}
          >
            <FiArrowLeft /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  const mockProjectsData = profile.mockProjectsStatistics?.responseData || {};
  const submissionsData = profile.submissionsStatistics?.responseData || {};
  const interviewData = profile.interviewStatistics || {};
  const practiceData = profile.practiceStatistics || {};

  const languageChartData = Object.entries(mockProjectsData.languageCounts || {}).map(([lang, count]) => ({
    name: lang,
    value: count,
    fill: `url(#language-${lang})`
  }));

  const difficultyChartData = Object.entries(mockProjectsData.difficultyCounts || {}).map(([diff, count]) => ({
    name: diff,
    value: count,
    fill: diff === 'Easy' ? '#0f8a57' : diff === 'Medium' ? '#ffd700' : '#ff6b6b'
  }));

  const submissionStatusData = Object.entries(submissionsData.statusCounts || {}).map(([status, count]) => ({
    name: status,
    value: count,
    fill: status === 'Approved' ? '#0f8a57' : 
          status === 'Pending' ? '#ffd700' : 
          status === 'Rejected' ? '#ff6b6b' : '#888'
  }));

  const interviewScoresData = [
    { name: 'Theoretical', score: interviewData.avgTheoreticalScore || 0, fullMark: 100 },
    { name: 'Speaking', score: interviewData.avgSpeakingScore || 0, fullMark: 100 },
    { name: 'Overall', score: interviewData.avgOverallScore || 0, fullMark: 100 }
  ];

  return (
    <div id="user-profile-bg">
      <div id="user-profile-container">
        
        <div className="profile-header">
          <button 
            className="btn-back" 
            onClick={() => navigate('/')}
          >
            <FiArrowLeft /> Back to Home
          </button>
        </div>

        <div id="user-profile-hero">
          <div className="hero-content">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                <img 
                  id="user-profile-avatar"
                  src={profile.avatarUrl} 
                  alt={`${profile.firstName}'s Avatar`}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/120x120/1a1a1a/ffffff?text=U";
                  }}
                />
                <div className="avatar-glow"></div>
                <div className="avatar-status"></div>
              </div>
            </div>
            <div className="profile-info">
              <h1 id="user-profile-name">{`${profile.firstName} ${profile.lastName}`}</h1>
              <p id="user-profile-role" className="role-badge">{profile.role}</p>
              <div className="token-display">
                <span className="token-icon">💎</span>
                <span className="token-value">{formatToken(profile.token)}</span>
              </div>
            </div>
          </div>
        </div>

        <div id="user-profile-details">
          <h2 id="user-profile-details-title">Personal Information</h2>
          <div className="details-grid">
            <div className="profile-detail-item">
              <span className="detail-label">Gender</span>
              <span className="detail-value">{profile.gender}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Date of Birth</span>
              <span className="detail-value">{formatBirthDate(profile.dateOfBirth)}</span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Member Since</span>
              <span className="detail-value">
                {new Date(profile.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}
              </span>
            </div>
            <div className="profile-detail-item">
              <span className="detail-label">Last Updated</span>
              <span className="detail-value">
                {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-title">Practice Stats</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-value">{practiceData.problemsSolvedTotal || 0}</div>
                <div className="metric-label">Solved</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{practiceData.acceptanceRate || 0}%</div>
                <div className="metric-label">AC Rate</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{practiceData.totalSubmissions || 0}</div>
                <div className="metric-label">Submissions</div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">Interviews</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-value">{interviewData.interviewsAttempted || 0}</div>
                <div className="metric-label">Attempted</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{interviewData.avgOverallScore?.toFixed(1) || 0}%</div>
                <div className="metric-label">Avg Score</div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">Mock Projects</h3>
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-value">{mockProjectsData.totalProjects || 0}</div>
                <div className="metric-label">Projects</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">{mockProjectsData.totalSubmissions || 0}</div>
                <div className="metric-label">Submissions</div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="stat-title">Submissions</h3>
            <div className="status-metrics">
              <div className="status-item approved">
                <div className="status-value">{submissionsData.totalApproved || 0}</div>
                <div className="status-label">Approved</div>
              </div>
              <div className="status-item pending">
                <div className="status-value">{submissionsData.totalPending || 0}</div>
                <div className="status-label">Pending</div>
              </div>
              <div className="status-item rejected">
                <div className="status-value">{submissionsData.totalRejected || 0}</div>
                <div className="status-label">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">Language Distribution</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={languageChartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    {Object.keys(mockProjectsData.languageCounts || {}).map((lang, i) => (
                      <linearGradient key={lang} id={`language-${lang}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0f8a57" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#ffd700" stopOpacity={0.8}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#bbbbbb" fontSize={12} />
                  <YAxis stroke="#bbbbbb" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Project Difficulty</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={difficultyChartData}>
                  <RadialBar
                    minAngle={15}
                    background={{ fill: '#2a2a2a' }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <Legend />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card full-span">
            <h3 className="chart-title">Submission Status</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={submissionStatusData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#bbbbbb" fontSize={12} />
                  <YAxis stroke="#bbbbbb" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card full-span">
            <h3 className="chart-title">Interview Performance</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={interviewScoresData} outerRadius={120}>
                  <PolarGrid stroke="#333" strokeWidth={1} />
                  <PolarAngleAxis dataKey="name" stroke="#bbbbbb" fontSize={12} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#bbbbbb" tick={{ fill: '#bbbbbb' }} />
                  <Radar name="Score" dataKey="score" stroke="#0f8a57" fill="#0f8a57" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button id="user-profile-action-btn" className="primary">
            Edit Profile
          </button>
          <button className="secondary">Download Stats</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;