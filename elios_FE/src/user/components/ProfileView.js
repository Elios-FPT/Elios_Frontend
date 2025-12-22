// file: elios_FE/src/user/components/ProfileView.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import LoadingCircle1 from '../../components/loading/LoadingCircle1';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import TopUpModal from './TopUpModal';

const ProfileView = ({ profile }) => {
    const [mockSubStats, setMockSubStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [showTopup, setShowTopup] = useState(false);

    useEffect(() => {
        const loadMockSubStats = async () => {
            setStatsLoading(true);
            try {
                const { data } = await axios.get(API_ENDPOINTS.GET_SUBMISSIONS_STATISTICS_CURRENT, { withCredentials: true });
                setMockSubStats(data.responseData);
            } catch (err) {
                console.error('Failed to load mock submission stats:', err);
            } finally {
                setStatsLoading(false);
            }
        };
        loadMockSubStats();
    }, []);

    const practice = profile.practiceStatistics || {};
    const interview = profile.interviewStatistics || {};
    const sub = mockSubStats || { totalSubmissions: 0, totalApproved: 0, totalPending: 0, totalRejected: 0, averageFinalGrade: 0 };


    const COLORS = {
        Approved: '#00e396', // Neon Green (Brighter)
        Pending: '#feb019',  // Vibrant Orange
        Rejected: '#ff4560'  // Bright Red
    };

    const statusData = [
        { name: 'Đã duyệt', value: sub.totalApproved || 0, fill: COLORS.Approved },
        { name: 'Chờ duyệt', value: sub.totalPending || 0, fill: COLORS.Pending },
        { name: 'Từ chối', value: sub.totalRejected || 0, fill: COLORS.Rejected },
    ].filter(item => item.value > 0);

    // 2. Practice Problems: Explicit Color Mapping
    const practiceBarData = [
        { name: 'Dễ', value: practice.problemsSolvedEasy || 0, fill: '#00e396' },
        { name: 'Vừa', value: practice.problemsSolvedMedium || 0, fill: '#feb019' },
        { name: 'Khó', value: practice.problemsSolvedHard || 0, fill: '#ff4560' },
        { name: 'Tổng', value: practice.problemsSolvedTotal || 0, fill: '#775dd0' }, // Purple for Total
    ];

    // 3. Interview Radar Data
    const interviewRadarData = [
        { subject: 'Lý thuyết', value: Math.round(interview.avgTheoreticalScore || 0), fullMark: 100 },
        { subject: 'Nói', value: Math.round(interview.avgSpeakingScore || 0), fullMark: 100 },
        { subject: 'Tổng quan', value: Math.round(interview.avgOverallScore || 0), fullMark: 100 },
    ];

    // --- Common Tooltip Style ---
    const tooltipStyle = {
        backgroundColor: '#23272f',
        border: '1px solid #444',
        borderRadius: '8px',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
    };

    return (
        <>
            <div id="user-profile-hero">
                <div className="hero-content">
                    <div className="avatar-section">
                        <div className="avatar-wrapper">
                            <img
                                id="user-profile-avatar"
                                src={profile.avatarUrl || 'https://placehold.co/140x140/181a1b/ffd700?text=U'}
                                alt="User avatar"
                                onError={e => (e.target.src = 'https://placehold.co/140x140/181a1b/ffd700?text=U')}
                            />
                        </div>
                    </div>

                    <div className="profile-info">
                        <h1 id="user-profile-name">{profile.firstName} {profile.lastName}</h1>
                        <p className="role-badge">{profile.role || 'Thành viên'}</p>

                        <div className="token-section">
                            <div className="token-display">
                                <span className="token-icon">💎</span>
                                <span className="token-value">{(profile.token || 0).toLocaleString()} Tokens</span>
                            </div>
                            <button className="btn-topup" onClick={() => setShowTopup(true)}>
                                <span className="sparkle"></span>
                                Nạp Token
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="user-profile-details">
                <h2 id="user-profile-details-title">Thông tin cá nhân</h2>
                <div className="details-grid">
                    <div className="profile-detail-item">
                        <span className="detail-label">Giới tính</span>
                        <span className="detail-value">{profile.gender || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="profile-detail-item">
                        <span className="detail-label">Ngày sinh</span>
                        <span className="detail-value">
                            {profile.dateOfBirth
                                ? new Date(profile.dateOfBirth).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
                                : 'Chưa cập nhật'}
                        </span>
                    </div>
                    <div className="profile-detail-item">
                        <span className="detail-label">Tham gia từ</span>
                        <span className="detail-value">
                            {new Date(profile.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' })}
                        </span>
                    </div>
                    <div className="profile-detail-item">
                        <span className="detail-label">Cập nhật lần cuối</span>
                        <span className="detail-value">
                            {new Date(profile.updatedAt).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3 className="stat-title">Thống kê Luyện tập</h3>
                    <div className="metrics-grid">
                        <div className="metric-item">
                            <div className="metric-value">{practice.problemsSolvedTotal || 0}</div>
                            <div className="metric-label">Đã giải</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-value">{practice.acceptanceRate || 0}%</div>
                            <div className="metric-label">Tỷ lệ AC</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-value">{practice.totalSubmissions || 0}</div>
                            <div className="metric-label">Bài nộp</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <h3 className="stat-title">Phỏng vấn</h3>
                    <div className="metrics-grid">
                        <div className="metric-item">
                            <div className="metric-value">{interview.interviewsAttempted || 0}</div>
                            <div className="metric-label">Đã tham gia</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-value">{(interview.avgOverallScore || 0).toFixed(1)}%</div>
                            <div className="metric-label">Điểm TB</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <h3 className="stat-title">Dự án mẫu</h3>
                    <div className="metrics-grid">
                        <div className="metric-item">
                            <div className="metric-value">{sub.totalSubmissions || 0}</div>
                            <div className="metric-label">Bài nộp</div>
                        </div>
                        <div className="metric-item">
                            <div className="metric-value">{(sub.averageFinalGrade || 0).toFixed(0)}</div>
                            <div className="metric-label">Điểm TB</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                {/* 1. Practice Problems Bar Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Bài tập luyện tập</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={practiceBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                stroke="#ccc" 
                                tick={{ fill: '#ccc' }} 
                            />
                            <YAxis 
                                stroke="#ccc" 
                                tick={{ fill: '#ccc' }} 
                            />
                            <Tooltip 
                                contentStyle={tooltipStyle}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                {practiceBarData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Interview Radar Chart */}
                <div className="chart-card">
                    <h3 className="chart-title">Điểm phỏng vấn</h3>
                    {interview.interviewsAttempted > 0 ? (
                        <ResponsiveContainer width="100%" height={320}>
                            <RadarChart outerRadius="70%" data={interviewRadarData}>
                                <PolarGrid stroke="#555" />
                                <PolarAngleAxis 
                                    dataKey="subject" 
                                    tick={{ fill: '#eee', fontSize: 13, fontWeight: 500 }} 
                                />
                                <PolarRadiusAxis 
                                    angle={30} 
                                    domain={[0, 100]} 
                                    tick={{ fill: '#aaa' }} 
                                    axisLine={false} 
                                />
                                <Radar
                                    name="Score"
                                    dataKey="value"
                                    stroke="#00e396"
                                    fill="#00e396"
                                    fillOpacity={0.4}
                                    strokeWidth={3}
                                />
                                <Tooltip contentStyle={tooltipStyle} />
                            </RadarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                            <p>Chưa tham gia buổi phỏng vấn nào</p>
                        </div>
                    )}
                </div>

                {/* 3. Mock Project Pie Chart */}
                {/* <div className="chart-card full-span">
                    <h3 className="chart-title">Trạng thái Dự án mẫu</h3>
                    {statsLoading ? (
                        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LoadingCircle1 size={50} />
                        </div>
                    ) : statusData.length === 0 ? (
                        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                            <p>Chưa có bài nộp nào</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80} // Increased inner radius for thinner, modern ring
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '20px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div> */}
            </div>

            {showTopup && <TopUpModal profile={profile} onClose={() => setShowTopup(false)} />}
        </>
    );
};

export default ProfileView;