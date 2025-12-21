import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import LoadingCircle1 from '../../components/loading/LoadingCircle1';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiAlertCircle, FiEdit3 } from 'react-icons/fi';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [mockSubStats, setMockSubStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);

  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
  });
  const [saving, setSaving] = useState(false);

  const packages = [
    { value: 100000, label: '100K', bonus: '' },
    { value: 200000, label: '200K', bonus: '' },
    { value: 500000, label: '500K', bonus: '' },
    { value: 1000000, label: '1M', bonus: '' },
  ];

  // Load profile chính
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await axios.get(API_ENDPOINTS.GET_USER_PROFILE, {
          withCredentials: true,
        });
        setProfile(data.data);
        setEditForm({
          firstName: data.data.firstName || '',
          lastName: data.data.lastName || '',
          gender: data.data.gender || '',
          dateOfBirth: data.data.dateOfBirth ? data.data.dateOfBirth.split('T')[0] : '',
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const loadMockSubStats = async () => {
      if (activeTab !== 'profile') return;
      setStatsLoading(true);
      try {
        const { data } = await axios.get(
          API_ENDPOINTS.GET_SUBMISSIONS_STATISTICS_CURRENT,
          { withCredentials: true }
        );
        setMockSubStats(data.responseData);
      } catch (err) {
        console.error('Failed to load mock submission stats:', err);
        setMockSubStats(null);
      } finally {
        setStatsLoading(false);
      }
    };
    loadMockSubStats();
  }, [activeTab]);

  const loadOrders = async () => {
    setOrderLoading(true);
    try {
      const { data } = await axios.get(API_ENDPOINTS.PAY_GET_CURRENT_ORDERS, {
        params: { limit: 50, sortBy: 'createdAt', descending: true },
        withCredentials: true,
      });
      setOrders(data.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadOrders();
    }
  }, [activeTab]);

  const handleTopup = async () => {
    const value = Number(amount);
    if (!value || value < 2000) {
      alert('Minimum amount is 2,000 VND');
      return;
    }

    setProcessing(true);
    try {
      const payload = {
        totalAmount: value,
        description: `Top-up Tokens`,
        returnUrl: `${window.location.origin}/user/profile`,
        cancelUrl: `${window.location.origin}/user/profile`,
        buyerName: `${profile.firstName} ${profile.lastName}`,
        buyerEmail: profile.email || '',
        buyerPhone: profile.phone || '',
        buyerCompanyName: 'Elios Platform',
        buyerAddress: 'Vietnam',
        expiredAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        buyerNotGetInvoice: true,
        taxPercentage: 0,
        items: [
          {
            name: `Top-up ${value.toLocaleString()} VND`,
            quantity: 1,
            price: value,
            unit: 'package',
            taxPercentage: 0,
          },
        ],
      };

      const { data } = await axios.post(API_ENDPOINTS.PAY_CREATE_ORDER, payload, {
        withCredentials: true,
      });

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      alert('Failed to create payment. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        id: localStorage.getItem('userId'),
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        gender: editForm.gender,
        dateOfBirth: editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString() : null
      };

      await axios.put(API_ENDPOINTS.UPDATE_USER, payload, {
        withCredentials: true,
      });

      setProfile(prev => ({ ...prev, ...payload }));
      alert('Profile updated successfully');
    } catch (err) {
      alert('Failed to update profile');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      PAID: { color: '#0f8a57', icon: <FiCheckCircle />, text: 'Paid' },
      PENDING: { color: '#ef4444', icon: <FiXCircle />, text: 'Cancelled' },
      EXPIRED: { color: '#6b7280', icon: <FiAlertCircle />, text: 'Expired' },
    };
    const s = config[status] || config.PENDING;
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '8px',
        backgroundColor: s.color + '22',
        color: s.color,
        fontSize: '0.85rem',
        fontWeight: '600'
      }}>
        {s.icon} {s.text}
      </span>
    );
  };

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
          <h2>Unable to load profile</h2>
          <p>Please try again later</p>
          <button className="btn-back" onClick={() => navigate('/')}>
            <FiArrowLeft /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  const practice = profile.practiceStatistics || {};
  const interview = profile.interviewStatistics || {};

  // Dữ liệu từ API mới
  const sub = mockSubStats || {
    totalSubmissions: 0,
    totalApproved: 0,
    totalPending: 0,
    totalRejected: 0,
    averageFinalGrade: 0,
  };

  // Pie Chart data
  const statusData = [
    { name: 'Approved', value: sub.totalApproved || 0, fill: '#0f8a57' },
    { name: 'Pending', value: sub.totalPending || 0, fill: '#ffd700' },
    { name: 'Rejected', value: sub.totalRejected || 0, fill: '#ff6b6b' },
  ].filter(item => item.value > 0);

  // Practice Bar Chart data
  const practiceBarData = [
    { name: 'Easy', value: practice.problemsSolvedEasy || 0 },
    { name: 'Medium', value: practice.problemsSolvedMedium || 0 },
    { name: 'Hard', value: practice.problemsSolvedHard || 0 },
    { name: 'Total Solved', value: practice.problemsSolvedTotal || 0 },
  ];

  // Interview Radar Chart data
  const interviewRadarData = [
    {
      subject: 'Theoretical',
      value: Math.round(interview.avgTheoreticalScore || 0),
      fullMark: 100,
    },
    {
      subject: 'Speaking',
      value: Math.round(interview.avgSpeakingScore || 0),
      fullMark: 100,
    },
    {
      subject: 'Overall',
      value: Math.round(interview.avgOverallScore || 0),
      fullMark: 100,
    },
  ];

  return (
    <div id="user-profile-bg">
      <div id="user-profile-container">
        <div className="profile-header">
          <button className="btn-back" onClick={() => navigate('/')}>
            <FiArrowLeft /> Back
          </button>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'edit' ? 'active' : ''}`}
            onClick={() => setActiveTab('edit')}
          >
            Edit Profile
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Transaction History
          </button>
        </div>

        {activeTab === 'profile' && (
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
                    <div className="avatar-glow"></div>
                    <div className="avatar-status"></div>
                  </div>
                </div>

                <div className="profile-info">
                  <h1 id="user-profile-name">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="role-badge">{profile.role || 'Member'}</p>

                  <div className="token-section">
                    <div className="token-display">
                      <span className="token-icon">💎</span>
                      <span className="token-value">
                        {(profile.token || 0).toLocaleString()} Tokens
                      </span>
                    </div>
                    <button className="btn-topup" onClick={() => setShowTopup(true)}>
                      <span className="sparkle"></span>
                      Top Up Tokens
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div id="user-profile-details">
              <h2 id="user-profile-details-title">Personal Information</h2>
              <div className="details-grid">
                <div className="profile-detail-item">
                  <span className="detail-label">Gender</span>
                  <span className="detail-value">{profile.gender || 'Not set'}</span>
                </div>
                <div className="profile-detail-item">
                  <span className="detail-label">Date of Birth</span>
                  <span className="detail-value">
                    {profile.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                      : 'Not set'}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <span className="detail-label">Member Since</span>
                  <span className="detail-value">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">
                    {new Date(profile.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
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
                    <div className="metric-value">{practice.problemsSolvedTotal || 0}</div>
                    <div className="metric-label">Solved</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{practice.acceptanceRate || 0}%</div>
                    <div className="metric-label">AC Rate</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{practice.totalSubmissions || 0}</div>
                    <div className="metric-label">Submissions</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <h3 className="stat-title">Interviews</h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <div className="metric-value">{interview.interviewsAttempted || 0}</div>
                    <div className="metric-label">Attempted</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{(interview.avgOverallScore || 0).toFixed(1)}%</div>
                    <div className="metric-label">Avg Score</div>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <h3 className="stat-title">Mock Project Submissions</h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <div className="metric-value">{sub.totalSubmissions || 0}</div>
                    <div className="metric-label">Submissions</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">{(sub.averageFinalGrade || 0).toFixed(0)}</div>
                    <div className="metric-label">Avg Grade</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              {/* Practice Statistics - Bar Chart */}
              <div className="chart-card">
                <h3 className="chart-title">Practice Problems by Difficulty</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={practiceBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#bbbbbb" />
                    <YAxis stroke="#bbbbbb" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#23272f',
                        border: '1px solid #00ff88',
                        borderRadius: '12px',
                        boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
                      }}
                      labelStyle={{ color: '#ffd700' }}
                      itemStyle={{ color: '#00ff88' }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {practiceBarData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            index === 3
                              ? '#ffd700' // Total Solved: gold
                              : ['#00ff88', '#ffd700', '#ff6b6b'][index] // Easy: green, Medium: gold, Hard: red
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Interview Statistics - Radar Chart */}
              <div className="chart-card">
                <h3 className="chart-title">Interview Score Breakdown</h3>
                {interview.interviewsAttempted > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <RadarChart data={interviewRadarData}>
                      <PolarGrid stroke="#444" />
                      <PolarAngleAxis dataKey="subject" stroke="#bbbbbb" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#bbbbbb" tick={{ fill: '#bbbbbb' }} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#00ff88"
                        fill="#00ff88"
                        fillOpacity={0.6}
                        strokeWidth={3}
                        dot={{ fill: '#ffd700', r: 6 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#23272f',
                          border: '1px solid #00ff88',
                          borderRadius: '12px',
                          boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
                        }}
                        labelStyle={{ color: '#ffd700' }}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ textAlign: 'center', color: '#888', padding: '4rem', fontSize: '1.1rem' }}>
                    Chưa tham gia interview nào
                  </p>
                )}
              </div>

              {/* Existing Mock Project Pie Chart */}
              <div className="chart-card full-span">
                <h3 className="chart-title">Mock Project Submission Status</h3>
                {statsLoading ? (
                  <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <LoadingCircle1 size={50} />
                  </div>
                ) : statusData.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#888', padding: '4rem', fontSize: '1.1rem' }}>
                    Chưa có submission nào để hiển thị
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelStyle={{ fill: '#fff', fontSize: '14px', fontWeight: '600' }}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#23272f',
                          border: '1px solid #444',
                          borderRadius: '12px',
                          padding: '10px',
                        }}
                        labelStyle={{ color: '#ffd700' }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'edit' && (
          <div className="edit-profile-container">
            <h2 className="section-title">Edit Profile</h2>

            <div className="edit-profile-card">
              <div className="edit-form-grid">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={e => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={e => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={e => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={e => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>

              <div className="edit-actions">
                <button
                  className="btn-confirm"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-container">
            <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>
              Transaction History
            </h2>

            {orderLoading ? (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <LoadingCircle1 />
              </div>
            ) : orders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#BBBBBB', fontStyle: 'italic', padding: '4rem' }}>
                No transactions found.
              </p>
            ) : (
              <div className="transaction-list">
                {orders.map(order => (
                  <div key={order.id} className="transaction-item">
                    <div className="transaction-header">
                      <div>
                        <strong>Order #{order.orderCode || order.id.slice(0, 8)}</strong>
                        <span style={{ marginLeft: '8px', color: '#888', fontSize: '0.9rem' }}>
                          {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="transaction-body">
                      <div>
                        <p style={{ margin: '8px 0', color: '#BBBBBB' }}>
                          {order.description || 'Token top-up'}
                        </p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffd700' }}>
                          {order.totalAmount.toLocaleString()} VND
                        </p>
                      </div>
                      {order.checkoutUrl && (
                        <a
                          href={order.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#4ade80', textDecoration: 'underline', fontSize: '0.9rem' }}
                        >
                          View Payment Link
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showTopup && (
          <div className="topup-modal-overlay" onClick={() => !processing && setShowTopup(false)}>
            <div className="topup-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Top Up Tokens</h2>
                <button
                  className="btn-close"
                  onClick={() => setShowTopup(false)}
                  disabled={processing}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <p className="current-balance">
                  Current balance:{' '}
                  <strong>{(profile.token || 0).toLocaleString()} Tokens</strong>
                </p>

                <div className="package-grid">
                  {packages.map(pkg => (
                    <button
                      key={pkg.value}
                      className={`package-btn ${amount === pkg.value ? 'selected' : ''}`}
                      onClick={() => setAmount(pkg.value)}
                      disabled={processing}
                    >
                      <div className="package-price">{pkg.label}</div>
                      <div className="package-bonus">{pkg.bonus}</div>
                    </button>
                  ))}
                </div>

                <div className="custom-input">
                  <label>Or enter custom amount (VND)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="100000"
                    min="10000"
                    step="10000"
                    disabled={processing}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-cancel"
                  onClick={() => setShowTopup(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  className="btn-confirm"
                  onClick={handleTopup}
                  disabled={processing || !amount}
                >
                  {processing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;